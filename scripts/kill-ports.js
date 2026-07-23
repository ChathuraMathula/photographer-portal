const { execSync } = require("child_process");

const ports = [4000, 4001, 8080];

console.log(`[Port Cleanup] Checking ports: ${ports.join(", ")}...`);

if (process.platform === "win32") {
  try {
    const output = execSync("netstat -ano", { encoding: "utf8" });
    const lines = output.split("\n");
    const pidsToKill = new Set();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(/\s+/);
      if (parts.length < 4) continue;

      const localAddress = parts[1];
      if (!localAddress) continue;

      for (const port of ports) {
        if (
          localAddress.endsWith(`:${port}`) ||
          localAddress.includes(`:${port}`)
        ) {
          // Double check to make sure it's actually the port (e.g. not part of IP)
          const portStr = `:${port}`;
          const isExactPort =
            localAddress.endsWith(portStr) ||
            localAddress.split(":").pop() === String(port);
          if (isExactPort) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== "0" && !isNaN(pid)) {
              pidsToKill.add(pid);
            }
          }
        }
      }
    }

    for (const pid of pidsToKill) {
      console.log(
        `[Port Cleanup] Killing process with PID ${pid} occupying dev port...`,
      );
      try {
        execSync(`taskkill /F /PID ${pid}`);
      } catch (err) {
        // ignore already killed or access denied errors
      }
    }
  } catch (e) {
    console.error(
      "[Port Cleanup] Failed to run netstat or taskkill:",
      e.message,
    );
  }
} else {
  // macOS / Linux
  for (const port of ports) {
    try {
      const output = execSync(`lsof -t -i :${port}`, { encoding: "utf8" });
      const pids = output
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);
      for (const pid of pids) {
        console.log(`[Port Cleanup] Killing process ${pid} on port ${port}...`);
        try {
          execSync(`kill -9 ${pid}`);
        } catch (err) {
          // ignore
        }
      }
    } catch (e) {
      // ignore (no process on that port)
    }
  }
}

console.log("[Port Cleanup] Ports cleanup done.");
