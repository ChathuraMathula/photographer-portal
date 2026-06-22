"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("http://localhost:4001/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Backend unreachable ❌"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Photographer Portal</h1>
      <p className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded">
        {status}
      </p>
    </main>
  );
}
