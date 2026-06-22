import { useState, useEffect } from "react";
import { Endpoint, SeedAccount, SessionInfo, QueryParam } from "../types";
import { API } from "../constants";

export function useApiTester() {
  const [activeCategory, setActiveCategory] = useState<Endpoint["category"]>("Auth & Health");
  const [serverHealth, setServerHealth] = useState<"checking" | "online" | "offline">("checking");
  const [session, setSession] = useState<SessionInfo>(null);
  
  // Playground state
  const [reqPath, setReqPath] = useState("/health");
  const [reqMethod, setReqMethod] = useState<Endpoint["method"]>("GET");
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [reqBody, setReqBody] = useState("");
  
  // Custom auth inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Response execution state
  const [executing, setExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState("");
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseData, setResponseData] = useState<string>("");
  const [latency, setLatency] = useState<number | null>(null);

  // General feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Check health on load
  const checkHealth = async () => {
    setServerHealth("checking");
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) {
        setServerHealth("online");
      } else {
        setServerHealth("offline");
      }
    } catch {
      setServerHealth("offline");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Perform custom login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail || !loginPass) return;
    setLoggingIn(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setSession({
          email: data.user.email,
          role: data.user.role,
          name: `${data.user.firstName} ${data.user.lastName}`
        });
        setAuthSuccess(`Logged in as ${data.user.firstName}! Cookie set.`);
        // Pre-fill next tester run
        setReqPath("/reservations");
        setReqMethod("GET");
      } else {
        setAuthError(data.message || "Failed to log in");
      }
    } catch (err: any) {
      setAuthError("Network error: Could not reach backend server");
    } finally {
      setLoggingIn(false);
    }
  };

  const selectSeedAccount = (acc: SeedAccount) => {
    setLoginEmail(acc.email);
    setLoginPass(acc.pass);
    // Instant login
    setTimeout(() => {
      setLoggingIn(true);
      fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acc.email, password: acc.pass }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setSession({
              email: data.user.email,
              role: data.user.role,
              name: `${data.user.firstName} ${data.user.lastName}`
            });
            setAuthSuccess(`Quick login successful: ${data.user.firstName}`);
            setAuthError("");
          } else {
            setAuthError(data.message || "Quick login failed");
          }
        })
        .catch(() => setAuthError("Network error: Could not reach backend server"))
        .finally(() => setLoggingIn(false));
    }, 50);
  };

  // Populate playground from documentation
  const prefillPlayground = (endpoint: Endpoint) => {
    setReqPath(endpoint.path);
    setReqMethod(endpoint.method);
    setQueryParams(endpoint.defaultQuery ? [...endpoint.defaultQuery] : []);
    setReqBody(endpoint.defaultBody || "");
    // scroll to playground container
    document.getElementById("api-playground")?.scrollIntoView({ behavior: "smooth" });
  };

  // Run Request in playground
  const executeRequest = async () => {
    setExecuting(true);
    setResponseStatus(null);
    setResponseStatusText("");
    setResponseData("");
    setResponseHeaders({});
    setLatency(null);

    const startTime = performance.now();

    // Construct Query String
    let targetUrl = `${API}${reqPath}`;
    if (queryParams.length > 0) {
      const activeQueries = queryParams.filter(q => q.key.trim() !== "");
      if (activeQueries.length > 0) {
        const qs = activeQueries.map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`).join("&");
        targetUrl = `${targetUrl}?${qs}`;
      }
    }

    try {
      const headers: Record<string, string> = {};
      if (reqMethod !== "GET" && reqBody) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(targetUrl, {
        method: reqMethod,
        headers,
        body: reqMethod !== "GET" && reqBody ? reqBody : undefined,
        // Send cookie credentials
        credentials: "include"
      });

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText);

      // Extract headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      setResponseHeaders(resHeaders);

      const text = await res.text();
      try {
        // Pretty JSON
        const parsed = JSON.parse(text);
        setResponseData(JSON.stringify(parsed, null, 2));
      } catch {
        setResponseData(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setResponseStatus(0);
      setResponseStatusText("Network Error / Connection Refused");
      setResponseData(JSON.stringify({
        error: "Failed to connect to the backend API.",
        suggestion: "Ensure the NestJS backend server is running locally at http://localhost:3000.",
        details: err?.message || String(err)
      }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  return {
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
  };
}
