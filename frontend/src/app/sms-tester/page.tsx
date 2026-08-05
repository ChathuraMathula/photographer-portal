"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, RefreshCw, Trash2, ArrowLeft, Copy, Check, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DevSmsMessage {
  id: string;
  phone: string;
  message: string;
  otp?: string;
  createdAt: string;
}

export default function SmsTesterDevInboxPage() {
  const [messages, setMessages] = useState<DevSmsMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSmsMessages = async () => {
    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      const res = await fetch(`${API}/auth/sms-inbox`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch SMS dev inbox", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearInbox = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
      await fetch(`${API}/auth/sms-inbox/clear`, { method: "POST" });
      setMessages([]);
      toast.success("SMS Dev Inbox cleared.");
    } catch (err) {
      toast.error("Failed to clear inbox");
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied OTP code ${code} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    fetchSmsMessages();
    const interval = setInterval(fetchSmsMessages, 3000); // Live poll every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  SMS Dev Inbox Tester
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  DEV TOOL (MAILDEV FOR SMS)
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulated local SMS messages & OTP verification codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSmsMessages}
              disabled={loading}
              className="h-9 px-3 rounded-xl border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {messages.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearInbox}
                className="h-9 px-3 rounded-xl text-xs font-bold"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear Inbox
              </Button>
            )}
            <Link href="/register/photographer">
              <Button size="sm" className="h-9 px-4 bg-[#0e2d5c] hover:bg-blue-900 text-white rounded-xl text-xs font-bold">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Registration
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Inbox View */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/40 space-y-3">
            <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300">No Dispatched SMS Messages Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Send an SMS verification code from the photographer registration wizard (Step 2) to test phone verification.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
              <span>Dispatched SMS Messages ({messages.length})</span>
              <span>Polling live every 3s</span>
            </div>

            <div className="space-y-2.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-900">
                        {msg.phone}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed font-mono">
                      {msg.message}
                    </p>
                  </div>

                  {msg.otp && (
                    <div className="shrink-0 flex items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">OTP Code</span>
                        <span className="text-base font-mono font-extrabold text-emerald-400 tracking-wider">
                          {msg.otp}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCopyCode(msg.id, msg.otp!)}
                        className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
        SeyaRoo Local SMS Dev Inbox • Auto-intercepting simulated SMS messages
      </footer>
    </div>
  );
}
