"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { io, Socket } from "socket.io-client";

import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
import { type Reservation, type Package, type ChatMessage } from "@/types";

// Dashboard sub-components
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { ReservationList } from "@/components/dashboard/ReservationList";
import { CustomerDetailsCard } from "@/components/dashboard/CustomerDetailsCard";
import { ProposeQuotationCard } from "@/components/dashboard/ProposeQuotationCard";
import { ProposalStatusCard } from "@/components/dashboard/ProposalStatusCard";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { PackageGrid } from "@/components/dashboard/PackageGrid";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { ManualBookingModal, type ManualBookingValues } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal, type PackageFormValues } from "@/components/dashboard/PackageFormModal";
import { ChatBox } from "@/components/common/ChatBox";

const API = "http://localhost:3000";

type Tab = "reservations" | "calendar" | "packages" | "profile";

// ── Yup schemas ───────────────────────────────────────────────────────────────

const ManualBookingSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  date: Yup.string().required("Date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string()
    .required("End time is required")
    .test("after-start", "End time must be after start time", function (v) {
      return !v || v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
  location: Yup.string(),
  notes: Yup.string(),
});

const PackageSchema = Yup.object().shape({
  name: Yup.string().required("Package name is required"),
  description: Yup.string(),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  durationHours: Yup.number()
    .integer("Hours must be integer")
    .positive("Hours must be positive")
    .required("Duration is required"),
});

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    firstName,
    role,
    id: userId,
    isAuthenticated,
  } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<Tab>("reservations");

  // Photographer states
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Proposal / rejection form states
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);
  const [quotationNotes, setQuotationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [packageIncludesText, setPackageIncludesText] = useState("");

  // Profile states
  const [profileBio, setProfileBio] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profilePortfolio, setProfilePortfolio] = useState("");
  const [profileAvailability, setProfileAvailability] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // ── Auth guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;
    try {
      const [resRes, pkgRes, profRes] = await Promise.all([
        fetch(`${API}/reservations`, { credentials: "include" }),
        fetch(`${API}/packages`, { credentials: "include" }),
        fetch(`${API}/photographers/${userId}`, { credentials: "include" }),
      ]);

      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData);
      }
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfileBio(profData.bio || "");
        setProfileLocation(profData.baseLocation || "");
        setProfilePortfolio(profData.portfolioUrl || "");
        setProfileAvailability(profData.isAvailableForBooking);
      }
    } catch (err) {
      console.error("Error loading photographer data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === UserRole.PHOTOGRAPHER) {
      loadPhotographerData();
    }
  }, [isAuthenticated, role, userId]);

  // ── Chat / Socket.io ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedRes) { setMessages([]); return; }

    fetch(`${API}/reservations/${selectedRes.id}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { setMessages(data); scrollToBottom(); })
      .catch(console.error);

    const socket = io(API);
    socketRef.current = socket;
    socket.emit("joinReservation", { reservationId: selectedRes.id });
    socket.on("message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socket.emit("leaveReservation", { reservationId: selectedRes.id });
      socket.disconnect();
    };
  }, [selectedRes]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleLogout = () => { dispatch(logout()); router.push("/login"); };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRes) return;
    try {
      const text = messageText;
      setMessageText("");
      await fetch(`${API}/reservations/${selectedRes.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
        credentials: "include",
      });
    } catch (err) { console.error(err); }
  };

  const handleProposeQuotation = async () => {
    if (!selectedRes || selectedPkgIds.length === 0) return;
    try {
      const res = await fetch(`${API}/reservations/${selectedRes.id}/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageIds: selectedPkgIds,
          advancePaymentPriceInCents: advanceAmount * 100,
          quotationNotes,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to propose packages");
      setSelectedPkgIds([]);
      setQuotationNotes("");
      loadPhotographerData();
      setSelectedRes(null);
      alert("Proposal sent successfully to customer email!");
    } catch (err: any) { alert(err.message || "Error sending proposal"); }
  };

  const handleRejectRequest = async () => {
    if (!selectedRes || !rejectionReason.trim()) return;
    try {
      const res = await fetch(`${API}/reservations/${selectedRes.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");
      setRejectionReason("");
      setShowRejectForm(false);
      loadPhotographerData();
      setSelectedRes(null);
      alert("Request rejected professionally.");
    } catch (err: any) { alert(err.message || "Error rejecting request"); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/photographers/${userId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profileBio,
          baseLocation: profileLocation,
          portfolioUrl: profilePortfolio,
        }),
        credentials: "include",
      });
      if (res.ok) alert("Profile updated successfully!");
    } catch (err) { console.error(err); }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await fetch(`${API}/photographers/${userId}/toggle-availability`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProfileAvailability(data.isAvailableForBooking);
      }
    } catch (err) { console.error(err); }
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPkg(pkg);
    packageFormik.setValues({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.priceInCents / 100,
      durationHours: pkg.durationHours,
    });
    setPackageIncludesText(pkg.includes.join(", "));
    setShowPackageModal(true);
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`${API}/packages/${pkgId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) loadPhotographerData();
    } catch (err) { console.error(err); }
  };

  // ── Formik: Manual Booking ────────────────────────────────────────────────

  const manualFormik = useFormik<ManualBookingValues>({
    initialValues: {
      firstName: "", lastName: "", email: "", phone: "",
      date: "", startTime: "", endTime: "", eventType: "", location: "", notes: "",
    },
    validationSchema: ManualBookingSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await fetch(`${API}/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to book manual reservation");
        setShowManualModal(false);
        resetForm();
        loadPhotographerData();
        alert("Manual offline booking registered successfully!");
      } catch (err: any) { alert(err.message || "Manual booking failed"); }
    },
  });

  // ── Formik: Package ───────────────────────────────────────────────────────

  const packageFormik = useFormik<PackageFormValues>({
    initialValues: { name: "", description: "", price: 0, durationHours: 1 },
    validationSchema: PackageSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const body = {
          name: values.name,
          description: values.description,
          priceInCents: values.price * 100,
          durationHours: values.durationHours,
          includes: packageIncludesText
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i.length > 0),
        };
        const url = editingPkg ? `${API}/packages/${editingPkg.id}` : `${API}/packages`;
        const method = editingPkg ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to save package");
        setShowPackageModal(false);
        resetForm();
        setEditingPkg(null);
        setPackageIncludesText("");
        loadPhotographerData();
      } catch (err) { alert("Error saving package details"); }
    },
  });

  // ── Admin / Super Admin view ───────────────────────────────────────────────

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <AdminDashboard
        firstName={firstName ?? ""}
        role={role}
        onLogout={handleLogout}
      />
    );
  }

  // ── Photographer view ─────────────────────────────────────────────────────

  const chatDisabled =
    selectedRes?.status === "CANCELLED" || selectedRes?.status === "REJECTED";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <PhotographerBanner
          firstName={firstName ?? ""}
          profileAvailability={profileAvailability}
          onToggleAvailability={handleToggleAvailability}
          onAddManualBooking={() => setShowManualModal(true)}
        />

        {/* ── Reservations Tab ── */}
        {activeTab === "reservations" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left list */}
            <div className="md:col-span-1">
              <ReservationList
                reservations={reservations}
                selectedId={selectedRes?.id}
                onSelect={(res) => {
                  setSelectedRes(res);
                  setShowRejectForm(false);
                }}
              />
            </div>

            {/* Right details pane */}
            <div className="md:col-span-2 space-y-4">
              {selectedRes ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Summary & Actions */}
                  <div className="space-y-4">
                    <CustomerDetailsCard reservation={selectedRes} />

                    {selectedRes.status === "PENDING" && (
                      <ProposeQuotationCard
                        packages={packages}
                        selectedPkgIds={selectedPkgIds}
                        advanceAmount={advanceAmount}
                        quotationNotes={quotationNotes}
                        showRejectForm={showRejectForm}
                        rejectionReason={rejectionReason}
                        onTogglePackage={(id, checked) =>
                          setSelectedPkgIds((prev) =>
                            checked ? [...prev, id] : prev.filter((x) => x !== id)
                          )
                        }
                        onAdvanceChange={setAdvanceAmount}
                        onNotesChange={setQuotationNotes}
                        onShowRejectForm={() => setShowRejectForm(true)}
                        onCancelReject={() => setShowRejectForm(false)}
                        onRejectionReasonChange={setRejectionReason}
                        onPropose={handleProposeQuotation}
                        onReject={handleRejectRequest}
                      />
                    )}

                    {(selectedRes.status === "PROPOSED" || selectedRes.status === "CONFIRMED") && (
                      <ProposalStatusCard reservation={selectedRes} />
                    )}
                  </div>

                  {/* Chat */}
                  <ChatBox
                    messages={messages}
                    messageText={messageText}
                    onMessageChange={setMessageText}
                    onSend={handleSendChatMessage}
                    disabled={chatDisabled}
                    myRole="PHOTOGRAPHER"
                    title="Live Chat with Customer"
                    description="Negotiate event details directly"
                  />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-sm">
                  Select a reservation from the list to view details, proposal
                  forms, and client chat thread.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Calendar Tab ── */}
        {activeTab === "calendar" && (
          <BookingCalendar
            reservations={reservations}
            currentDate={currentDate}
            onPrevMonth={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
              )
            }
            onNextMonth={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              )
            }
            onDayReservationClick={(res) => {
              setSelectedRes(res);
              setActiveTab("reservations");
            }}
          />
        )}

        {/* ── Packages Tab ── */}
        {activeTab === "packages" && (
          <PackageGrid
            packages={packages}
            onAddPackage={() => {
              setEditingPkg(null);
              packageFormik.resetForm();
              setPackageIncludesText("");
              setShowPackageModal(true);
            }}
            onEditPackage={handleEditPackage}
            onDeletePackage={handleDeletePackage}
          />
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <ProfileSettingsForm
            bio={profileBio}
            location={profileLocation}
            portfolio={profilePortfolio}
            onBioChange={setProfileBio}
            onLocationChange={setProfileLocation}
            onPortfolioChange={setProfilePortfolio}
            onSubmit={handleSaveProfile}
          />
        )}
      </div>

      {/* Modals */}
      {showManualModal && (
        <ManualBookingModal
          formik={manualFormik}
          onClose={() => setShowManualModal(false)}
        />
      )}
      {showPackageModal && (
        <PackageFormModal
          formik={packageFormik}
          editingPkg={editingPkg}
          includesText={packageIncludesText}
          onIncludesChange={setPackageIncludesText}
          onClose={() => setShowPackageModal(false)}
        />
      )}
    </main>
  );
}
