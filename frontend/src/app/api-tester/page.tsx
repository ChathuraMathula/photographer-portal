"use client";

import {
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useApiTester } from "./hooks/useApiTester";
import { AuthorizationGate } from "./components/AuthorizationGate";
import { EndpointDirectory } from "./components/EndpointDirectory";
import { ExecutionPlayground } from "./components/ExecutionPlayground";
import { ResponseConsole } from "./components/ResponseConsole";

export default function ApiTesterPage() {
  const {
    activeCategory,
    setActiveCategory,
    serverHealth,
    checkHealth,
    session,
    reqPath,
    setReqPath,
    reqMethod,
    setReqMethod,
    queryParams,
    setQueryParams,
    reqBody,
    setReqBody,
    loginEmail,
    setLoginEmail,
    loginPass,
    setLoginPass,
    authError,
    authSuccess,
    loggingIn,
    executing,
    responseStatus,
    responseStatusText,
    responseHeaders,
    responseData,
    latency,
    copiedText,
    handleCopy,
    handleLogin,
    selectSeedAccount,
    prefillPlayground,
    executeRequest,
  } = useApiTester();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-5 sm:p-6 rounded-2xl shadow-sm">
          <div className="min-w-0">
            <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2 flex-wrap">
              <Server className="h-5 w-5 sm:h-6 sm:w-6 text-primary-dark dark:text-indigo-400 shrink-0" />
              <span>API Documentation &amp; Testing Console</span>
            </h1>
            <p className="text-body-small text-zinc-555 mt-1 max-w-2xl">
              Inspect backend route specifications, authorization permissions,
              parameters, and send simulated payloads in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center shrink-0">
            {/* Server health badge */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl">
              <Activity
                className={`h-4 w-4 ${
                  serverHealth === "online"
                    ? "text-emerald-500 animate-pulse"
                    : serverHealth === "offline"
                      ? "text-red-500"
                      : "text-zinc-400 animate-spin"
                }`}
              />
              <span className="text-body-small-s font-semibold whitespace-nowrap">
                {serverHealth === "online"
                  ? "Online"
                  : serverHealth === "offline"
                    ? "Offline"
                    : "Checking…"}
              </span>
              <button
                onClick={checkHealth}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
                title="Refresh health"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Session badge */}
            {session && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-body-small-s font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[180px]">
                  {session.name} · {session.role}
                </span>
              </div>
            )}

            {/* Jump to playground (mobile only) */}
            <a
              href="#api-playground"
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-dark text-white text-body-caption font-semibold cursor-pointer"
            >
              Playground <ChevronDown className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* ── Two-column workspace ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Auth + Endpoint Directory */}
          <div className="lg:col-span-7 space-y-6">
            <AuthorizationGate
              selectSeedAccount={selectSeedAccount}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPass={loginPass}
              setLoginPass={setLoginPass}
              handleLogin={handleLogin}
              loggingIn={loggingIn}
              authError={authError}
              authSuccess={authSuccess}
            />

            <EndpointDirectory
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              prefillPlayground={prefillPlayground}
            />
          </div>

          {/* Right: Execution Playground + Response Console */}
          <div
            id="api-playground"
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-6"
          >
            <ExecutionPlayground
              reqMethod={reqMethod}
              setReqMethod={setReqMethod}
              reqPath={reqPath}
              setReqPath={setReqPath}
              queryParams={queryParams}
              setQueryParams={setQueryParams}
              reqBody={reqBody}
              setReqBody={setReqBody}
              executing={executing}
              executeRequest={executeRequest}
            >
              <ResponseConsole
                latency={latency}
                responseStatus={responseStatus}
                responseStatusText={responseStatusText}
                responseHeaders={responseHeaders}
                responseData={responseData}
                copiedText={copiedText}
                handleCopy={handleCopy}
              />
            </ExecutionPlayground>
          </div>
        </div>
      </div>
    </div>
  );
}
