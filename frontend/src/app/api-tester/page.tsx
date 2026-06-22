"use client";

import { RefreshCw, Server, Activity, CheckCircle2 } from "lucide-react";
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
    executeRequest
  } = useApiTester();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Console */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-title-large text-primary-dark dark:text-white flex items-center gap-2">
              <Server className="h-6 w-6 text-primary-dark dark:text-indigo-400" />
              API Documentation &amp; Testing Console
            </h1>
            <p className="text-body-small text-zinc-555 mt-1 max-w-2xl">
              Inspect backend route specifications, authorization permissions, parameters, and send simulated payloads in real-time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center shrink-0">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 px-4 py-2 rounded-xl">
              <Activity className={`h-4 w-4 ${serverHealth === 'online' ? 'text-emerald-500 animate-pulse' : serverHealth === 'offline' ? 'text-red-500 animate-bounce' : 'text-zinc-400 animate-spin'}`} />
              <span className="text-body-small-s font-semibold">
                Server: {serverHealth === "online" ? "Online" : serverHealth === "offline" ? "Offline" : "Checking..."}
              </span>
              <button onClick={checkHealth} className="ml-1 text-zinc-400 hover:text-zinc-650 cursor-pointer" title="Refresh health">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            {session && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 text-emerald-850 dark:text-emerald-400 px-4 py-2 rounded-xl text-body-small-s font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Logged in: {session.name} ({session.role})</span>
              </div>
            )}
          </div>
        </header>

        {/* Workspace Splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Accounts login & API Endpoints specifications (Doc) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Quick Session Authentication Widget */}
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

            {/* API Endpoints Document */}
            <EndpointDirectory
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              prefillPlayground={prefillPlayground}
            />

          </div>

          {/* Right Column: Execution Playground Console */}
          <div id="api-playground" className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
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
