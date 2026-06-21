"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Calendar,
  MapPin,
  Tag,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const API = "http://localhost:3000";

type Photographer = {
  firstName: string;
  lastName: string;
};

type ProposalPackage = {
  id: string;
  name: string;
  description?: string;
  priceInCents: number;
  durationHours: number;
  includes: string[];
};

type Reservation = {
  id: string;
  status: "PENDING" | "PROPOSED" | "REJECTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  customerNotes?: string;
  advancePaymentPriceInCents?: number;
  quotationNotes?: string;
  clientSelectedPackageId?: string;
  selectedPackages?: ProposalPackage[];
  paymentDeadline?: string;
  rejectionReason?: string;
  photographer: Photographer;
};

type ChatMessage = {
  id: string;
  sender: "PHOTOGRAPHER" | "CUSTOMER";
  senderName: string;
  content: string;
  timestamp: string;
};

export default function TrackingPage() {
  const params = useParams();
  const token = params?.token as string;

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // 1. Check if email is already verified in localStorage
  useEffect(() => {
    if (!token) return;
    const storedEmail = localStorage.getItem(`verified_email_res_${token}`);
    if (storedEmail) {
      setVerifiedEmail(storedEmail);
    } else {
      setLoading(false);
    }
  }, [token]);

  // 2. Fetch reservation details once verified
  useEffect(() => {
    if (!token || !verifiedEmail) return;
    setLoading(true);
    setError("");

    fetch(`${API}/bookings/track/${token}?email=${encodeURIComponent(verifiedEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch reservation details");
        return res.json() as Promise<Reservation>;
      })
      .then((data) => {
        setReservation(data);
        if (data.clientSelectedPackageId) {
          setSelectedPkgId(data.clientSelectedPackageId);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load reservation");
        setLoading(false);
      });
  }, [token, verifiedEmail]);

  // 3. Fetch chat messages and connect to Socket.io
  useEffect(() => {
    if (!reservation || !verifiedEmail || !token) return;

    // Load message history
    fetch(`${API}/bookings/track/${token}/messages?email=${encodeURIComponent(verifiedEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch((err) => console.error("Error loading chat history:", err));

    // Connect WebSocket
    const socket = io(API);
    socketRef.current = socket;

    socket.emit("joinReservation", { reservationId: reservation.id });

    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.emit("leaveReservation", { reservationId: reservation.id });
      socket.disconnect();
    };
  }, [reservation, verifiedEmail, token]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationError("");

    try {
      const res = await fetch(`${API}/bookings/track/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Email verification failed");
      }

      localStorage.setItem(`verified_email_res_${token}`, emailInput);
      setVerifiedEmail(emailInput);
    } catch (err: any) {
      setVerificationError(err.message || "Verification failed");
      setVerifying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !verifiedEmail || !token) return;

    try {
      const text = messageText;
      setMessageText("");

      await fetch(`${API}/bookings/track/${token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail, content: text }),
      });
      // Gateway broadcasts back so it updates via socket listener
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedPkgId || !verifiedEmail || !token) return;
    setConfirming(true);

    try {
      const res = await fetch(`${API}/bookings/track/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedEmail, packageId: selectedPkgId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Confirmation failed");

      // Reload reservation state
      setReservation((prev) =>
        prev
          ? {
              ...prev,
              status: "CONFIRMED",
              clientSelectedPackageId: selectedPkgId,
            }
          : null
      );
      setConfirming(false);
    } catch (err: any) {
      alert(err.message || "Failed to confirm reservation");
      setConfirming(false);
    }
  };

  const getDeadlineText = (deadlineStr?: string) => {
    if (!deadlineStr) return "";
    const deadline = new Date(deadlineStr);
    const diffMs = deadline.getTime() - Date.now();
    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m remaining`;
  };

  // ── Loading state ──
  if (loading && !verifiedEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
          <p className="text-sm text-zinc-500">Checking verification...</p>
        </div>
      </main>
    );
  }

  // ── Verification screen ──
  if (!verifiedEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <Card className="w-full max-w-md shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Access Verification</CardTitle>
            <CardDescription>
              For security reasons, please enter your email address to access this reservation.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerifyEmail}>
            <CardContent className="space-y-4">
              {verificationError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{verificationError}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11 text-base" disabled={verifying}>
                {verifying ? "Verifying..." : "Verify and Access"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500 animate-pulse">Loading reservation details...</p>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error || "Reservation not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.removeItem(`verified_email_res_${token}`);
                setVerifiedEmail(null);
              }}
            >
              Try Different Email
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 md:px-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header Summary */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Reservation tracking
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Photographer: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{reservation.photographer.firstName} {reservation.photographer.lastName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {reservation.status === "PENDING" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" /> Pending Review
              </span>
            )}
            {reservation.status === "PROPOSED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                <Clock className="h-3.5 w-3.5" /> Proposal Proposed (Locked)
              </span>
            )}
            {reservation.status === "CONFIRMED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
              </span>
            )}
            {reservation.status === "REJECTED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <XCircle className="h-3.5 w-3.5" /> Unavailable
              </span>
            )}
            {reservation.status === "CANCELLED" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <XCircle className="h-3.5 w-3.5" /> Expired / Cancelled
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Columns */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Event Details Card */}
            <Card className="border border-zinc-200/50 dark:border-zinc-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Date & Time</p>
                    <p>{new Date(reservation.date).toDateString()} at {reservation.startTime} - {reservation.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Event Type</p>
                    <p>{reservation.eventType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Location</p>
                    <p>{reservation.location || "Not specified"}</p>
                  </div>
                </div>
                {reservation.customerNotes && (
                  <div className="sm:col-span-2 border-t pt-3 mt-1 dark:border-zinc-800">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Your Notes</p>
                    <p className="italic">"{reservation.customerNotes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rejection Message if Rejected */}
            {reservation.status === "REJECTED" && (
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">Update from Photographer</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-950 dark:text-red-300">
                  <p className="italic">"{reservation.rejectionReason || "The photographer is unavailable for this date/time."}"</p>
                </CardContent>
              </Card>
            )}

            {/* Expired Message if Cancelled */}
            {reservation.status === "CANCELLED" && (
              <Card className="border-zinc-200 bg-zinc-50 dark:bg-zinc-900/30 dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <AlertCircle className="h-5 w-5 text-zinc-500" />
                  <CardTitle className="text-lg">Quotation Expired</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-500">
                  The photographer proposed options, but the 24-hour booking reservation period expired before selection could be confirmed. The time slot is once again available to other clients.
                </CardContent>
              </Card>
            )}

            {/* Quotation & Proposals Section */}
            {(reservation.status === "PROPOSED" || reservation.status === "CONFIRMED") && reservation.selectedPackages && (
              <Card className="border border-zinc-200/50 dark:border-zinc-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">Photographer Proposal</CardTitle>
                  {reservation.status === "PROPOSED" && (
                    <CardDescription className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                      <Clock className="h-4 w-4 animate-pulse" />
                      Slot locked: {getDeadlineText(reservation.paymentDeadline)}
                    </CardDescription>
                  )}
                  {reservation.quotationNotes && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg text-sm italic text-zinc-600 dark:text-zinc-300 mt-2">
                      <strong>Notes from Sarah:</strong> "{reservation.quotationNotes}"
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Recommended Packages:</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {reservation.selectedPackages.map((pkg) => {
                      const isSelected = selectedPkgId === pkg.id;
                      const isConfirmed = reservation.status === "CONFIRMED";
                      const selectionLocked = isConfirmed && reservation.clientSelectedPackageId === pkg.id;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => !isConfirmed && setSelectedPkgId(pkg.id)}
                          className={`group relative flex flex-col justify-between p-5 rounded-xl border transition-all ${
                            isConfirmed
                              ? selectionLocked
                                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default"
                                : "border-zinc-200 dark:border-zinc-800 opacity-60 pointer-events-none"
                              : isSelected
                              ? "border-zinc-950 bg-zinc-50/50 dark:border-white dark:bg-zinc-900 cursor-pointer shadow-md"
                              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 cursor-pointer"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-zinc-950 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                {pkg.name}
                              </h4>
                              {selectionLocked && (
                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                  Selected
                                </span>
                              )}
                            </div>
                            {pkg.description && (
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-3">
                                {pkg.description}
                              </p>
                            )}
                            <p className="text-xs text-zinc-400 mt-2">Duration: {pkg.durationHours} hr(s)</p>
                            {pkg.includes.length > 0 && (
                              <ul className="text-xs text-zinc-500 space-y-1 mt-3 pl-4 list-disc">
                                {pkg.includes.slice(0, 3).map((inc) => (
                                  <li key={inc}>{inc}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="border-t pt-3 mt-4 flex items-baseline gap-1">
                            <span className="text-xs font-semibold text-zinc-400">LKR</span>
                            <span className="text-lg font-bold text-zinc-950 dark:text-white">
                              {(pkg.priceInCents / 100).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {reservation.status === "PROPOSED" && (
                    <div className="border-t pt-4 space-y-3 dark:border-zinc-800">
                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-zinc-500">Required Advance Deposit</p>
                          <p className="text-xl font-bold text-zinc-900 dark:text-white">
                            LKR {(reservation.advancePaymentPriceInCents! / 100).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          disabled={!selectedPkgId || confirming}
                          onClick={handleConfirmReservation}
                          className="h-11 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                          {confirming ? "Processing..." : "Select Package & Confirm"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {reservation.status === "CONFIRMED" && (
                    <div className="bg-emerald-50 border border-emerald-200/50 p-4 rounded-lg text-emerald-950 dark:bg-emerald-950/10 dark:border-emerald-900/50 dark:text-emerald-400 text-sm">
                      ✨ **Reservation Confirmed**. Deposit of **LKR ${(reservation.advancePaymentPriceInCents! / 100).toLocaleString()}** has been simulated/paid. The photographer is booked.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Chat thread column */}
          <div className="space-y-6">
            <Card className="flex flex-col h-[500px] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-zinc-400" />
                  <CardTitle className="text-sm font-bold">Negotiation Chat</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Have questions about custom pricing or timing? Chat here.
                </CardDescription>
              </CardHeader>
              
              {/* Message scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xs text-zinc-400 italic">No messages yet. Send a message to start negotiating.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isPhotographer = msg.sender === "PHOTOGRAPHER";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          isPhotographer ? "mr-auto" : "ml-auto items-end"
                        }`}
                      >
                        <span className="text-[10px] text-zinc-400 mb-0.5 px-1">{msg.senderName}</span>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isPhotographer
                              ? "bg-white text-zinc-900 border border-zinc-200/60 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
                              : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  disabled={reservation.status === "CANCELLED" || reservation.status === "REJECTED"}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageText.trim() || reservation.status === "CANCELLED" || reservation.status === "REJECTED"}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </div>

      </div>
    </main>
  );
}
