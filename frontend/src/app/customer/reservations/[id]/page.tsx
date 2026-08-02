"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatBox } from "@/components/common/ChatBox";
import { type ChatMessage } from "@/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface CustomerReservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location: string;
  city?: string;
  district?: string;
  status: string;
  reservationToken: string;
  totalAmountInCents?: number;
  selectedPackages?: any[];
  clientSelectedPackageId?: string;
  quotationNotes?: string;
  photographer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CustomerReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const reservationId = params?.id as string;

  const [reservation, setReservation] = useState<CustomerReservation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileTab, setMobileTab] = useState<"details" | "chat">("details");
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [confirmingPkg, setConfirmingPkg] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch Customer Reservations
        const res = await fetch(`${API}/customer/reservations`, {
          credentials: "include",
        });
        if (res.ok) {
          const list: CustomerReservation[] = await res.json();
          const target = list.find((r) => r.id === reservationId);
          if (target) {
            setReservation(target);
            if (target.selectedPackages && target.selectedPackages.length > 0) {
              setSelectedPkgId(target.clientSelectedPackageId || target.selectedPackages[0].id);
            }

            // Fetch chat messages
            const chatRes = await fetch(
              `${API}/bookings/track/${target.reservationToken}/messages?email=${encodeURIComponent(target.photographer?.email || "")}`,
            );
            if (chatRes.ok) {
              const chatData = await chatRes.json();
              setMessages(chatData || []);

              // Mark messages as read for customer
              fetch(
                `${API}/bookings/track/${target.reservationToken}/messages/read`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: target.photographer?.email || "" }),
                },
              ).catch(() => {});
            }
          } else {
            setError("Reservation not found.");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load reservation details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [reservationId, auth, router, API]);

  // Connect Socket.IO for real-time chat & status updates
  useEffect(() => {
    if (!reservation) return;

    const newSocket = io(API, { withCredentials: true });
    setSocket(newSocket);

    newSocket.emit("joinReservation", reservation.id);

    newSocket.on("messageReceived", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on("reservationUpdated", (updated: any) => {
      setReservation((prev) => (prev ? { ...prev, ...updated } : prev));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [reservation?.id, API]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !reservation) return;

    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const res = await fetch(
        `${API}/bookings/track/${reservation.reservationToken}/messages?email=${encodeURIComponent(reservation.photographer?.email || "")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: textToSend }),
        },
      );

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    }
  };

  const handleConfirmPackage = async () => {
    if (!reservation || !selectedPkgId) return;

    try {
      setConfirmingPkg(true);
      const res = await fetch(
        `${API}/bookings/track/${reservation.reservationToken}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: reservation.photographer?.email || "",
            packageId: selectedPkgId,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm package");

      toast.success("Package selected and booking confirmed successfully!");
      setReservation((prev) => prev ? { ...prev, status: "CONFIRMED" } : null);
    } catch (err: any) {
      toast.error(err.message || "Error confirming package");
    } finally {
      setConfirmingPkg(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300";
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300";
      case "PROPOSED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300";
      case "CANCELLED":
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/customer/dashboard">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-bold gap-1.5 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
          {reservation && (
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-none">
                  {reservation.eventType} Session
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(reservation.status)}`}
                >
                  {reservation.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Ref #{reservation.id.slice(0, 8)}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Tab Switcher */}
        {reservation && (
          <div className="flex lg:hidden grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-xs w-full">
            <button
              type="button"
              onClick={() => setMobileTab("details")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mobileTab === "details"
                  ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Details & Proposal
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mobileTab === "chat"
                  ? "bg-white dark:bg-zinc-900 text-[#0e2d5c] dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Live Chat ({messages.length})
            </button>
          </div>
        )}
      </header>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">
          Loading reservation details...
        </div>
      ) : error || !reservation ? (
        <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600 font-medium">
          {error || "Reservation not found"}
        </div>
      ) : (
        <>
          {/* Desktop Layout: Side-by-Side Grid */}
          <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
            {/* Left Column (7 Cols): Session Overview & Proposal Options */}
            <div className="col-span-7 space-y-6">
              <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
                    Session Details & Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80">
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        Event Date
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        {new Date(reservation.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-zinc-500 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        Time Slot
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        {reservation.startTime} - {reservation.endTime}
                      </span>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <span className="text-zinc-500 font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        Location / City
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        {reservation.city || reservation.location || "On Location"}
                      </span>
                    </div>
                  </div>

                  {reservation.photographer && (
                    <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Assigned Photographer:</span>
                      <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#0e2d5c] dark:text-blue-400" />
                        {reservation.photographer.firstName} {reservation.photographer.lastName}
                      </span>
                    </div>
                  )}

                  {reservation.totalAmountInCents && (
                    <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                        Total Amount:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${(reservation.totalAmountInCents / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quotation / Proposal Section if status is PROPOSED */}
              {reservation.status === "PROPOSED" && reservation.selectedPackages && reservation.selectedPackages.length > 0 && (
                <Card className="border-blue-200 dark:border-blue-900/40 shadow-xs bg-blue-50/30 dark:bg-blue-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Photographer Quote & Proposed Packages
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Select your preferred package below to confirm your booking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    {reservation.quotationNotes && (
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 italic">
                        &quot;{reservation.quotationNotes}&quot;
                      </div>
                    )}

                    <div className="space-y-3">
                      {reservation.selectedPackages.map((pkg: any) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            selectedPkgId === pkg.id
                              ? "bg-white dark:bg-zinc-900 border-[#0e2d5c] dark:border-blue-400 shadow-xs ring-1 ring-[#0e2d5c]"
                              : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="package"
                                checked={selectedPkgId === pkg.id}
                                onChange={() => setSelectedPkgId(pkg.id)}
                                className="accent-[#0e2d5c]"
                              />
                              <span className="font-bold text-zinc-900 dark:text-white">
                                {pkg.name}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-zinc-500 text-[11px] pl-5">
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-[#0e2d5c] dark:text-blue-400 text-sm">
                              ${((pkg.priceInCents || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={handleConfirmPackage}
                      disabled={confirmingPkg || !selectedPkgId}
                      className="w-full h-11 bg-[#0e2d5c] hover:bg-[#0b244a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      {confirmingPkg ? "Confirming Booking..." : "Confirm Selected Package"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column (5 Cols): Real-time Chat Room */}
            <div className="col-span-5 sticky top-20">
              <ChatBox
                messages={messages}
                messageText={messageText}
                onMessageChange={setMessageText}
                onSend={handleSendMessage}
                myRole="CUSTOMER"
                title={`Chat with ${reservation.photographer?.firstName || "Photographer"}`}
                description="Real-time messaging with your photographer"
                reservationId={reservation.id}
                photographerFirstName={reservation.photographer?.firstName}
              />
            </div>
          </div>

          {/* Mobile Layout: Tab Switcher View */}
          <div className="block lg:hidden">
            {mobileTab === "details" ? (
              <div className="space-y-6">
                <Card className="border-zinc-200/60 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-zinc-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#0e2d5c] dark:text-blue-400" />
                      Session Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          Date:
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {new Date(reservation.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          Time Slot:
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {reservation.startTime} - {reservation.endTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                        <span className="font-semibold flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          Location:
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                          {reservation.city || reservation.location || "On Location"}
                        </span>
                      </div>
                    </div>

                    {reservation.photographer && (
                      <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          Photographer
                        </span>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#0e2d5c] dark:text-blue-400" />
                          {reservation.photographer.firstName} {reservation.photographer.lastName}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Proposal Section on Mobile */}
                {reservation.status === "PROPOSED" && reservation.selectedPackages && (
                  <Card className="border-blue-200 dark:border-blue-900/40 shadow-xs bg-blue-50/30 dark:bg-blue-950/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Photographer Quote
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      {reservation.selectedPackages.map((pkg: any) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedPkgId === pkg.id
                              ? "bg-white dark:bg-zinc-900 border-[#0e2d5c] ring-1 ring-[#0e2d5c]"
                              : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200"
                          }`}
                        >
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {pkg.name}
                          </span>
                          <span className="font-bold text-[#0e2d5c] dark:text-blue-400">
                            ${((pkg.priceInCents || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <Button
                        type="button"
                        onClick={handleConfirmPackage}
                        disabled={confirmingPkg || !selectedPkgId}
                        className="w-full h-10 bg-[#0e2d5c] text-white font-bold rounded-xl text-xs"
                      >
                        {confirmingPkg ? "Confirming..." : "Confirm Selected Package"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="w-full">
                <ChatBox
                  messages={messages}
                  messageText={messageText}
                  onMessageChange={setMessageText}
                  onSend={handleSendMessage}
                  myRole="CUSTOMER"
                  title={`Chat with ${reservation.photographer?.firstName || "Photographer"}`}
                  description="Real-time messaging with your photographer"
                  reservationId={reservation.id}
                  photographerFirstName={reservation.photographer?.firstName}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
