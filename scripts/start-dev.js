/**
 * start-dev.js
 * Sequential dev startup:
 *   1. Kill any processes holding dev ports (calls existing kill-ports.js)
 *   2. Start Docker DB (fire-and-forget)
 *   3. Start the NestJS backend
 *   4. Poll port 4001 until backend accepts connections (up to TIMEOUT_MS)
 *   5. Only then start the Next.js frontend dev server
 */

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_PORT = 4001;
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 120000; // 2 minutes

const isWin = process.platform === 'win32';

function log(tag, msg) {
  const ts = new Date().toLocaleTimeString();
  console.log('[' + ts + '] [' + tag + '] ' + msg);
}

function spawnProc(name, cmd, args, cwd) {
  log(name, 'Starting: ' + cmd + ' ' + args.join(' '));
  const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: isWin });
  child.on('exit', function(code) {
    if (code !== 0 && code !== null) {
      log(name, 'Exited with code ' + code);
    }
  });
  return child;
}

function waitForPort(port, timeoutMs) {
  return new Promise(function(resolve, reject) {
    var deadline = Date.now() + timeoutMs;
    var attempt = 0;

    function tryConnect() {
      if (Date.now() > deadline) {
        return reject(new Error(
          'Backend did not become ready on port ' + port + ' within ' +
          (timeoutMs / 1000) + 's. Check backend logs for errors.'
        ));
      }
      attempt++;
      log('WAIT', 'Checking backend on port ' + port + ' (attempt ' + attempt + ')...');
      var socket = net.createConnection({ port: port, host: '127.0.0.1' }, function() {
        socket.destroy();
        resolve();
      });
      socket.on('error', function() {
        socket.destroy();
        setTimeout(tryConnect, POLL_INTERVAL_MS);
      });
    }

    tryConnect();
  });
}

async function main() {
  // 1. Kill occupied ports
  log('SETUP', 'Cleaning up dev ports...');
  try {
    require('./kill-ports.js');
  } catch (e) {
    log('SETUP', 'kill-ports.js not found, skipping.');
  }

  // 2. Start docker DB (non-blocking)
  var dockerProc = spawnProc('DOCKER', 'docker-compose', ['up', '-d'], ROOT);

  // 3. Start backend
  log('BACKEND', 'Starting NestJS backend...');
  var backendProc = spawnProc('BACKEND', 'npm', ['run', 'start:dev'], path.join(ROOT, 'backend'));

  // 4. Wait for backend to be ready
  log('WAIT', 'Waiting for backend to become ready on port ' + BACKEND_PORT + '...');
  try {
    await waitForPort(BACKEND_PORT, TIMEOUT_MS);
    log('WAIT', 'Backend is ready on port ' + BACKEND_PORT + '!');
  } catch (err) {
    log('ERROR', err.message);
    if (backendProc && !backendProc.killed) backendProc.kill();
    process.exit(1);
  }

  // 5. Start frontend
  log('FRONTEND', 'Starting Next.js frontend...');
  var frontendProc = spawnProc('FRONTEND', 'npm', ['run', 'dev'], path.join(ROOT, 'frontend'));

  // Graceful shutdown on Ctrl+C
  function shutdown() {
    log('SHUTDOWN', 'Shutting down all processes...');
    [backendProc, frontendProc, dockerProc].forEach(function(p) {
      try { if (p && !p.killed) p.kill(); } catch (_) {}
    });
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(function(err) {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
