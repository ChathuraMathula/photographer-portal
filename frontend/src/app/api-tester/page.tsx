"use client";

import { useState, useEffect } from "react";
import { 
  Send, Key, RefreshCw, CheckCircle2, XCircle, BookOpen, Terminal, 
  Copy, Check, Shield, Camera, Lock, Activity, Code, Server, Play, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = "http://localhost:3000";

// Mock/Seeded accounts for easy login
const SEED_ACCOUNTS = [
  { role: "SUPER_ADMIN", email: "admin@photoportal.com", pass: "SuperSecret123!", name: "System Admin" },
  { role: "ADMIN", email: "agency@photoportal.com", pass: "AdminSecret123!", name: "Agency Admin" },
  { role: "PHOTOGRAPHER", email: "sarah@photoportal.com", pass: "Photographer123!", name: "Sarah Johnson" },
  { role: "PHOTOGRAPHER", email: "michael@photoportal.com", pass: "Photographer123!", name: "Michael Fernando" }
];

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  access: "Public" | "Super Admin Only" | "Super Admin & Admin" | "Super Admin & Photographer" | "Photographer Only" | "Super Admin, Admin & Photographer";
  category: "Auth & Health" | "Public Bookings" | "Photographer Profile" | "Packages" | "Reservations" | "Users";
  defaultQuery?: { key: string; value: string }[];
  defaultBody?: string;
};

const ENDPOINTS: Endpoint[] = [
  // Auth & Health
  {
    method: "GET",
    path: "/health",
    description: "Fetch health status of the backend systems.",
    access: "Public",
    category: "Auth & Health"
  },
  {
    method: "POST",
    path: "/auth/login",
    description: "Authenticate user and set HTTP-only cookie access token.",
    access: "Public",
    category: "Auth & Health",
    defaultBody: JSON.stringify({ email: "sarah@photoportal.com", password: "Photographer123!" }, null, 2)
  },
  // Public Bookings
  {
    method: "GET",
    path: "/bookings/sarah-johnson",
    description: "Get public photographer bio, location, & specialties.",
    access: "Public",
    category: "Public Bookings"
  },
  {
    method: "GET",
    path: "/bookings/sarah-johnson/availability",
    description: "Check if a photographer slot is open for date and time range.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [
      { key: "date", value: new Date().toISOString().split("T")[0] },
      { key: "startTime", value: "14:00" },
      { key: "endTime", value: "16:00" }
    ]
  },
  {
    method: "POST",
    path: "/bookings/sarah-johnson",
    description: "Submit a new booking request to a photographer.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      firstName: "Ruwan",
      lastName: "Jayasekara",
      email: "ruwan@example.com",
      phone: "+94775556666",
      date: new Date().toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "16:00",
      eventType: "Wedding Reception",
      location: "Galle Face Hotel",
      notes: "Looking forward to working together."
    }, null, 2)
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/verify",
    description: "Verify client email matches booking tracking token to grant page access.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({ email: "priya@example.com" }, null, 2)
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE",
    description: "Fetch status tracker detail card information.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }]
  },
  {
    method: "GET",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description: "Get message/chat negotiation logs.",
    access: "Public",
    category: "Public Bookings",
    defaultQuery: [{ key: "email", value: "priya@example.com" }]
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/messages",
    description: "Send chat reply message as customer.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      email: "priya@example.com",
      content: "Hello! Can we schedule a quick call to align?"
    }, null, 2)
  },
  {
    method: "POST",
    path: "/bookings/track/INSERT_TRACKING_TOKEN_HERE/confirm",
    description: "Accept proposal package and pay simulated deposit.",
    access: "Public",
    category: "Public Bookings",
    defaultBody: JSON.stringify({
      email: "priya@example.com",
      packageId: "INSERT_PACKAGE_ID_HERE"
    }, null, 2)
  },
  // Photographer Profile
  {
    method: "GET",
    path: "/photographers",
    description: "List all registered photographer profiles in the portal.",
    access: "Super Admin Only",
    category: "Photographer Profile"
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE",
    description: "Get specific profile configurations.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile"
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/profile",
    description: "Update biography, location, & specialties.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile",
    defaultBody: JSON.stringify({
      bio: "Updated professional wedding photographer portfolio.",
      baseLocation: "Negombo",
      specializations: ["Wedding", "Portrait", "Events"]
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/toggle-availability",
    description: "Toggle whether photographer is accepting new client inquiries.",
    access: "Super Admin & Photographer",
    category: "Photographer Profile"
  },
  {
    method: "GET",
    path: "/photographers/INSERT_PHOTOGRAPHER_USER_ID_HERE/booking-link",
    description: "Retrieve generated booking url details.",
    access: "Super Admin Only",
    category: "Photographer Profile"
  },
  // Packages
  {
    method: "GET",
    path: "/packages",
    description: "List all standard packages templates owned by logged-in photographer.",
    access: "Photographer Only",
    category: "Packages"
  },
  {
    method: "POST",
    path: "/packages",
    description: "Create a standard pricing package proposal option.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify({
      name: "Bronze Photography Option",
      description: "2 Hours covering and 25 edited digital photos.",
      price: 35000,
      durationHours: 2,
      includes: ["2 Hours Coverage", "25 Edited Photos", "USB Delivery"]
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Update package info and pricing details.",
    access: "Photographer Only",
    category: "Packages",
    defaultBody: JSON.stringify({
      name: "Bronze Option v2",
      price: 38000
    }, null, 2)
  },
  {
    method: "DELETE",
    path: "/packages/INSERT_PACKAGE_ID_HERE",
    description: "Permanently delete standard package template option.",
    access: "Photographer Only",
    category: "Packages"
  },
  // Reservations
  {
    method: "GET",
    path: "/reservations",
    description: "List active reservations. Photographers see only their own. Admins see all.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations",
    description: "Create an offline/manual reservation.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      firstName: "Nimal",
      lastName: "Silva",
      email: "nimal@test.com",
      phone: "+94774443333",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "13:00",
      eventType: "Portrait",
      location: "Colombo 07",
      notes: "Manual reservation booked over phone call."
    }, null, 2)
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE",
    description: "Get specific details for a reservation record.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/propose",
    description: "Submit package recommendation proposal and lock the slot for 24h.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      packageIds: ["INSERT_PACKAGE_ID_1", "INSERT_PACKAGE_ID_2"],
      advancePaymentPriceInCents: 1500000,
      quotationNotes: "Highly recommend Bronze Option for your timeline."
    }, null, 2)
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/reject",
    description: "Reject incoming client booking request with context notes.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      reason: "Sorry, I am fully booked on that date with an outstation shoot."
    }, null, 2)
  },
  {
    method: "GET",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description: "Retrieve communication logs for reservation.",
    access: "Super Admin, Admin & Photographer",
    category: "Reservations"
  },
  {
    method: "POST",
    path: "/reservations/INSERT_RESERVATION_ID_HERE/messages",
    description: "Send chat negotiation message as photographer.",
    access: "Photographer Only",
    category: "Reservations",
    defaultBody: JSON.stringify({
      content: "Yes, we can definitely accommodate custom hours."
    }, null, 2)
  },
  // Users
  {
    method: "GET",
    path: "/users",
    description: "List portal user accounts.",
    access: "Super Admin & Admin",
    category: "Users"
  },
  {
    method: "POST",
    path: "/users",
    description: "Create system user account (Admin or Photographer).",
    access: "Super Admin & Admin",
    category: "Users",
    defaultBody: JSON.stringify({
      firstName: "Kamal",
      lastName: "Perera",
      email: "kamal@photoportal.com",
      password: "Photographer123!",
      role: "PHOTOGRAPHER",
      phone: "+94777777777",
      bookingSlug: "kamal-perera",
      baseLocation: "Colombo",
      bio: "Commercial food and product photographer."
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/users/INSERT_USER_ID_HERE/toggle-active",
    description: "Toggle active state (suspend/activate) of user account.",
    access: "Super Admin & Admin",
    category: "Users"
  }
];

export default function ApiTesterPage() {
  const [activeCategory, setActiveCategory] = useState<Endpoint["category"]>("Auth & Health");
  const [serverHealth, setServerHealth] = useState<"checking" | "online" | "offline">("checking");
  const [session, setSession] = useState<{ email: string; role: string; name: string } | null>(null);
  
  // Playground state
  const [reqPath, setReqPath] = useState("/health");
  const [reqMethod, setReqMethod] = useState<Endpoint["method"]>("GET");
  const [queryParams, setQueryParams] = useState<{ key: string; value: string }[]>([]);
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

  const selectSeedAccount = (acc: typeof SEED_ACCOUNTS[0]) => {
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
            <p className="text-body-small text-zinc-500 mt-1 max-w-2xl">
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
            <CardLayout title="Authorization Gate (Quick Log-In)" desc="Select a seeded role to automatically login and write session cookies.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SEED_ACCOUNTS.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => selectSeedAccount(acc)}
                    className="flex flex-col items-center justify-between text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer transition-all hover:border-zinc-350 active:scale-[0.98]"
                  >
                    <RoleBadge role={acc.role} />
                    <span className="text-[10px] text-zinc-405 mt-2 truncate max-w-full font-semibold">{acc.name}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-4 space-y-4">
                <h4 className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Custom Auth Credentials</h4>
                <form onSubmit={handleLogin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5 space-y-1.5">
                    <Label htmlFor="custom-email" className="text-body-caption text-zinc-500">Email address</Label>
                    <Input 
                      id="custom-email" 
                      type="email"
                      placeholder="user@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-5 space-y-1.5">
                    <Label htmlFor="custom-pass" className="text-body-caption text-zinc-500">Password</Label>
                    <Input 
                      id="custom-pass" 
                      type="password"
                      placeholder="••••••••" 
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button 
                      type="submit" 
                      disabled={loggingIn}
                      className="btn btn-primary h-10 w-full px-0 py-0 min-w-0 md:min-w-0 text-sm shadow-sm"
                    >
                      {loggingIn ? "..." : "Log In"}
                    </Button>
                  </div>
                </form>
                {authError && (
                  <p className="text-body-caption font-semibold text-red-650 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200/30">
                    <XCircle className="h-3.5 w-3.5 shrink-0" /> {authError}
                  </p>
                )}
                {authSuccess && (
                  <p className="text-body-caption font-semibold text-emerald-650 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200/30">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {authSuccess}
                  </p>
                )}
              </div>
            </CardLayout>

            {/* API Endpoints Document */}
            <CardLayout 
              title="API Endpoint Directory" 
              desc="Select category and browse available backend routes, inputs and access permissions."
              headerAction={
                <div className="flex flex-wrap gap-1 border border-zinc-150 dark:border-zinc-850 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                  {(["Auth & Health", "Public Bookings", "Photographer Profile", "Packages", "Reservations", "Users"] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-body-caption font-semibold cursor-pointer transition-colors ${
                        activeCategory === cat 
                          ? "bg-white dark:bg-zinc-900 text-primary-dark dark:text-white shadow-sm border border-zinc-200/55 dark:border-zinc-800/55" 
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="space-y-4">
                {ENDPOINTS.filter(ep => ep.category === activeCategory).map((ep, i) => (
                  <div 
                    key={i} 
                    className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-white dark:bg-zinc-900/50 p-4 space-y-3 shadow-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <MethodBadge method={ep.method} />
                        <code className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 font-mono select-all bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-150/40">
                          {ep.path}
                        </code>
                      </div>
                      <span className="text-[10px] font-semibold flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-650 dark:text-zinc-400">
                        <Lock className="h-2.5 w-2.5" />
                        {ep.access}
                      </span>
                    </div>

                    <p className="text-body-small text-zinc-555 dark:text-zinc-400">{ep.description}</p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-body-caption text-zinc-405 font-medium">
                        {ep.defaultBody && <span>📥 Payload template available</span>}
                        {!ep.defaultBody && ep.defaultQuery && <span>🔍 Query keys: {ep.defaultQuery.map(q => q.key).join(", ")}</span>}
                        {!ep.defaultBody && !ep.defaultQuery && <span>⚡ Simple request</span>}
                      </div>
                      <button
                        onClick={() => prefillPlayground(ep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                      >
                        <Play className="h-3 w-3 fill-current" /> Use in Tester
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardLayout>

          </div>

          {/* Right Column: Execution Playground Console */}
          <div id="api-playground" className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
            <CardLayout 
              title="Execution Playground" 
              desc="Construct and execute live HTTP requests directly into the local port 3000 backend."
            >
              <div className="space-y-4">
                
                {/* Method & Path inputs */}
                <div className="flex gap-2">
                  <select
                    value={reqMethod}
                    onChange={(e) => setReqMethod(e.target.value as Endpoint["method"])}
                    className="w-[100px] shrink-0 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 rounded-xl text-body-small-s font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2.5 text-body-caption font-semibold text-zinc-400 font-mono">/api</span>
                    <Input 
                      value={reqPath}
                      onChange={(e) => setReqPath(e.target.value)}
                      placeholder="/health"
                      className="pl-11 h-11 font-mono text-body-small rounded-xl"
                    />
                  </div>
                </div>

                {/* Query Parameters Section */}
                <div className="space-y-2 border border-zinc-150 dark:border-zinc-850 p-3 rounded-xl bg-zinc-50/20">
                  <div className="flex justify-between items-center pb-1">
                    <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Query Parameters</Label>
                    <button
                      type="button"
                      onClick={() => setQueryParams([...queryParams, { key: "", value: "" }])}
                      className="text-body-caption font-semibold text-primary-light hover:underline hover:text-primary-dark cursor-pointer"
                    >
                      + Add Param
                    </button>
                  </div>
                  {queryParams.length === 0 ? (
                    <p className="text-body-caption text-zinc-455 italic">No query parameters appended.</p>
                  ) : (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {queryParams.map((param, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="key"
                            value={param.key}
                            onChange={(e) => {
                              const list = [...queryParams];
                              list[index].key = e.target.value;
                              setQueryParams(list);
                            }}
                            className="h-9 font-mono rounded-lg text-xs"
                          />
                          <Input
                            placeholder="value"
                            value={param.value}
                            onChange={(e) => {
                              const list = [...queryParams];
                              list[index].value = e.target.value;
                              setQueryParams(list);
                            }}
                            className="h-9 font-mono rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...queryParams];
                              list.splice(index, 1);
                              setQueryParams(list);
                            }}
                            className="text-zinc-400 hover:text-red-500 text-xs px-1 cursor-pointer font-bold"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request JSON Body Section */}
                {reqMethod !== "GET" && (
                  <div className="space-y-1.5">
                    <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Request Body (JSON)</Label>
                    <textarea
                      rows={6}
                      value={reqBody}
                      onChange={(e) => setReqBody(e.target.value)}
                      placeholder={`{\n  "key": "value"\n}`}
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-dark dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                )}

                {/* Send Button */}
                <Button
                  onClick={executeRequest}
                  disabled={executing}
                  className="btn btn-primary w-full min-w-0 max-w-none md:max-w-none h-11 py-0 shadow-sm gap-2"
                >
                  <Send className="h-4 w-4" /> {executing ? "Executing Request..." : "Send Request"}
                </Button>

                {/* Request Response Panel */}
                <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-body-small-s font-semibold text-zinc-750 dark:text-zinc-250">Response Console</h4>
                    {latency && (
                      <span className="text-[10px] font-bold text-zinc-405 font-mono">
                        Time: {latency} ms
                      </span>
                    )}
                  </div>

                  {responseStatus !== null ? (
                    <div className="space-y-3">
                      {/* Status status badge */}
                      <div className={`flex justify-between items-center p-3 rounded-xl border ${
                        responseStatus >= 200 && responseStatus < 300 
                          ? "bg-emerald-50/50 border-emerald-200/50 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-400" 
                          : "bg-red-50/50 border-red-200/50 text-red-800 dark:bg-red-950/10 dark:text-red-400"
                      }`}>
                        <div className="flex items-center gap-1.5 text-body-small-s font-bold">
                          {responseStatus >= 200 && responseStatus < 300 ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <span>Status: {responseStatus} {responseStatusText}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(responseData, "resp")}
                          className="text-[10px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === "resp" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedText === "resp" ? "Copied" : "Copy Body"}
                        </button>
                      </div>

                      {/* Header Summary */}
                      {Object.keys(responseHeaders).length > 0 && (
                        <div className="text-[10px] font-mono text-zinc-400 max-h-[80px] overflow-y-auto border border-zinc-150 dark:border-zinc-850 p-2 rounded-lg bg-zinc-50/50">
                          {Object.entries(responseHeaders).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <span className="font-bold">{k}:</span> {v}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Body Scroll area */}
                      <pre className="max-h-[350px] overflow-auto rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-950 p-4 font-mono text-xs text-zinc-350 select-all leading-normal font-medium">
                        {responseData || "{}"}
                      </pre>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 rounded-xl text-center text-body-small text-zinc-400 bg-white dark:bg-zinc-900/30">
                      No response yet. Fill out fields above and click &quot;Send Request&quot;.
                    </div>
                  )}

                </div>

              </div>
            </CardLayout>
          </div>

        </div>

      </div>
    </div>
  );
}

// Subcomponents helper
function CardLayout({ 
  title, 
  desc, 
  children,
  headerAction 
}: { 
  title: string; 
  desc: string; 
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-855 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/10">
        <div>
          <h3 className="text-title-medium text-primary-dark dark:text-white font-bold">{title}</h3>
          <p className="text-body-small text-zinc-555 mt-0.5">{desc}</p>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "SUPER_ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
        <Shield className="h-3 w-3" /> Super Admin
      </span>
    );
  }
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
        <Shield className="h-3 w-3" /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
      <Camera className="h-3 w-3" /> Photographer
    </span>
  );
}

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  const styles = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
    POST: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
    PATCH: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    DELETE: "bg-red-50 text-red-705 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono select-none ${styles[method]}`}>
      {method}
    </span>
  );
}
