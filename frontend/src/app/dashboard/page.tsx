"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/store/store";
import { UserRole, logout } from "@/store/slices/authSlice";
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
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  Camera,
  User,
  ListFilter,
  MessageSquare,
  Send,
  LogOut,
  MapPin,
  Tag,
  DollarSign,
  Briefcase,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const API = "http://localhost:3000";

// --- Types ---
type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

type Package = {
  id: string;
  name: string;
  description?: string;
  priceInCents: number;
  durationHours: number;
  includes: string[];
  isActive: boolean;
};

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  adminNotes?: string;
  totalAmountInCents?: number;
  paymentDeadline?: string;
  advancePaymentPriceInCents?: number;
  quotationNotes?: string;
  clientSelectedPackageId?: string;
  selectedPackages?: any[];
  rejectionReason?: string;
  customer: Customer;
  photographer: { id: string; firstName: string; lastName: string };
};

type ChatMessage = {
  id: string;
  sender: "PHOTOGRAPHER" | "CUSTOMER";
  senderName: string;
  content: string;
  timestamp: string;
};

// --- Form Validation Schemas ---
const ManualBookingSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  date: Yup.string().required("Date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string().required("End time is required").test("after-start", "End time must be after start time", function(v) {
    return !v || v > this.parent.startTime;
  }),
  eventType: Yup.string().required("Event type is required"),
  location: Yup.string(),
  notes: Yup.string(),
});

const PackageSchema = Yup.object().shape({
  name: Yup.string().required("Package name is required"),
  description: Yup.string(),
  price: Yup.number().positive("Price must be positive").required("Price is required"),
  durationHours: Yup.number().integer("Hours must be integer").positive("Hours must be positive").required("Duration is required"),
});

// --- Main Component ---
export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { firstName, role, id: userId, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [activeTab, setActiveTab] = useState<"reservations" | "calendar" | "packages" | "profile">("reservations");

  // Photographer States
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Proposal Accept / Rejection Form states
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);
  const [quotationNotes, setQuotationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Modals States
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [packageIncludesText, setPackageIncludesText] = useState("");

  // Profile Settings States
  const [profileBio, setProfileBio] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profilePortfolio, setProfilePortfolio] = useState("");
  const [profileAvailability, setProfileAvailability] = useState(true);

  // Calendar Navigation States
  const [currentDate, setCurrentDate] = useState(new Date());

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    upcoming: 0,
    totalRevenue: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load Initial Photographer Data
  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;

    try {
      // 1. Fetch Reservations
      const resRes = await fetch(`${API}/reservations`, { credentials: "include" });
      const resData = await resRes.json();
      if (resRes.ok) {
        setReservations(resData);
        // Calculate statistics
        const pendingCount = resData.filter((r: any) => r.status === "PENDING").length;
        const confirmedCount = resData.filter((r: any) => r.status === "CONFIRMED").length;
        const totalRevenue = resData
          .filter((r: any) => r.status === "CONFIRMED")
          .reduce((acc: number, r: any) => acc + (r.totalAmountInCents || 0), 0);

        setStats({
          pending: pendingCount,
          confirmed: confirmedCount,
          upcoming: confirmedCount,
          totalRevenue: totalRevenue / 100,
        });
      }

      // 2. Fetch Packages
      const pkgRes = await fetch(`${API}/packages`, { credentials: "include" });
      const pkgData = await pkgRes.json();
      if (pkgRes.ok) setPackages(pkgData);

      // 3. Fetch Profile
      const profRes = await fetch(`${API}/photographers/${userId}`, { credentials: "include" });
      const profData = await profRes.json();
      if (profRes.ok) {
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

  // Handle live chat connection inside selected reservation
  useEffect(() => {
    if (!selectedRes) {
      setMessages([]);
      return;
    }

    // Load Chat History
    fetch(`${API}/reservations/${selectedRes.id}/messages`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch((err) => console.error("Error loading chat:", err));

    // Connect WebSocket
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
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- Actions ---

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
      // socket event will arrive and trigger local update
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handleProposeQuotation = async () => {
    if (!selectedRes || selectedPkgIds.length === 0) return;

    try {
      const res = await fetch(`${API}/reservations/${selectedRes.id}/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageIds: selectedPkgIds,
          advancePaymentPriceInCents: advanceAmount * 100, // LKR to Cents
          quotationNotes,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to propose packages");

      // Reset states
      setSelectedPkgIds([]);
      setQuotationNotes("");
      loadPhotographerData(); // Reload list
      setSelectedRes(null);
      alert("Proposal sent successfully to customer email!");
    } catch (err: any) {
      alert(err.message || "Error sending proposal");
    }
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
      if (!res.ok) throw new Error(data.message || "Failed to reject reservation");

      // Reset
      setRejectionReason("");
      setShowRejectForm(false);
      loadPhotographerData(); // Reload
      setSelectedRes(null);
      alert("Request rejected professionally.");
    } catch (err: any) {
      alert(err.message || "Error rejecting request");
    }
  };

  // Profile Save
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
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Offline Booking Submit Formik
  const manualFormik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      date: "",
      startTime: "",
      endTime: "",
      eventType: "",
      location: "",
      notes: "",
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
        alert("Manual offline booking registered and locked successfully!");
      } catch (err: any) {
        alert(err.message || "Manual booking failed");
      }
    },
  });

  // Package Formik
  const packageFormik = useFormik({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      durationHours: 1,
    },
    validationSchema: PackageSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const body = {
          name: values.name,
          description: values.description,
          priceInCents: values.price * 100, // to cents
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
      } catch (err) {
        alert("Error saving package details");
      }
    },
  });

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
    } catch (err) {
      console.error(err);
    }
  };

  // --- Calendar Math Helpers ---
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const startOffset = getFirstDayOfMonth(year, month);

    const days = [];
    // Pad empty cells before the start of the month
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    // Fill days
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getReservationsForDay = (day: Date) => {
    const formattedDay = day.toISOString().split("T")[0];
    return reservations.filter((r) => {
      const resDate = new Date(r.date).toISOString().split("T")[0];
      return resDate === formattedDay;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // --- Views ---

  // Admin and Super Admin View (Statistics and Redirect to user management)
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Admin Portal
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Welcome back, {firstName} · <span className="font-semibold">{role}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard/users")} className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                User Management
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-zinc-500 hover:text-zinc-700">
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">Active & Sync</p>
                <p className="text-xs text-zinc-400 mt-1">PostgreSQL DB connected successfully</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">Local Maildev</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="http://localhost:1080"
                  target="_blank"
                  rel="noreferrer"
                  className="text-3xl font-bold text-indigo-500 hover:underline block"
                >
                  Go to Maildev
                </a>
                <p className="text-xs text-zinc-400 mt-1">Check outgoing bookings emails locally</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-zinc-500 dark:text-zinc-400 text-sm">Local pgAdmin ERD</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="http://localhost:5050"
                  target="_blank"
                  rel="noreferrer"
                  className="text-3xl font-bold text-amber-500 hover:underline block"
                >
                  pgAdmin Web UI
                </a>
                <p className="text-xs text-zinc-400 mt-1">Visual diagram on port 5050</p>
              </CardContent>
            </Card>
          </section>

          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 p-8 text-center bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-bold mb-2">Create & Manage User Accounts</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-lg mx-auto">
              You have access to create system users. Super Admins can add Admins and Photographers. Admins can create Photographers only.
            </p>
            <Button size="lg" onClick={() => router.push("/dashboard/users")} className="px-8">
              Open User Management
            </Button>
          </Card>

        </div>
      </main>
    );
  }

  // Photographer View
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-zinc-200/50 dark:bg-zinc-900 dark:border-zinc-800/50 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">Photographer Dashboard</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "reservations"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Reservations
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "calendar"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "packages"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "profile"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              Settings
            </button>
            <span className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></span>
            <Button size="icon" variant="ghost" onClick={handleLogout} className="text-zinc-500">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        
        {/* Universal Photographer Banner */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Welcome back, {firstName}
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Your public booking link:{" "}
              <a
                href={`/book/${profileBio ? "sarah-johnson" : "sarah-johnson"}`} // Default slug mock
                target="_blank"
                rel="noreferrer"
                className="font-medium text-zinc-950 hover:underline dark:text-white"
              >
                /book/sarah-johnson
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Accepting bookings:</span>
              <button
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  profileAvailability ? "bg-emerald-500" : "bg-zinc-250 dark:bg-zinc-850"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    profileAvailability ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <Button onClick={() => setShowManualModal(true)} variant="outline" className="h-10 text-xs font-semibold gap-1.5 border-zinc-200 dark:border-zinc-800">
              <Plus className="h-4 w-4" /> Add Manual Booking
            </Button>
          </div>
        </header>

        {/* Dynamic Tab Contents */}

        {/* ── RESERVATIONS TAB ── */}
        {activeTab === "reservations" && (
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Left list panel */}
            <div className="md:col-span-1 space-y-4">
              <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[600px] flex flex-col">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-bold">Requests List</CardTitle>
                    <span className="inline-flex rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      Total: {reservations.length}
                    </span>
                  </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {reservations.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-sm">No reservations found.</div>
                  ) : (
                    reservations.map((res) => {
                      const isSelected = selectedRes?.id === res.id;
                      return (
                        <div
                          key={res.id}
                          onClick={() => {
                            setSelectedRes(res);
                            setShowRejectForm(false);
                          }}
                          className={`p-4 cursor-pointer text-left transition-colors ${
                            isSelected
                              ? "bg-zinc-50 dark:bg-zinc-900/50 border-l-4 border-zinc-900 dark:border-white"
                              : "hover:bg-zinc-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold text-zinc-950 dark:text-white truncate">
                              {res.customer.firstName} {res.customer.lastName}
                            </span>
                            <span className="text-[10px] text-zinc-400 shrink-0">
                              {new Date(res.date).toISOString().split("T")[0]}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-zinc-500">{res.eventType}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                                res.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                                  : res.status === "PROPOSED"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                                  : res.status === "CONFIRMED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Right details / actions pane */}
            <div className="md:col-span-2 space-y-4">
              {selectedRes ? (
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* Summary & Proposal Form */}
                  <div className="space-y-4">
                    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                      <CardHeader className="pb-3 border-b dark:border-zinc-800">
                        <CardTitle className="text-md">Customer Request Details</CardTitle>
                        <CardDescription>
                          Submitted on {new Date(selectedRes.date).toDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4 text-sm text-zinc-600 dark:text-zinc-450">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-zinc-400">Client Name</p>
                            <p className="font-semibold text-zinc-950 dark:text-white">
                              {selectedRes.customer.firstName} {selectedRes.customer.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Contact</p>
                            <p>{selectedRes.customer.email}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{selectedRes.customer.phone}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-t pt-3 dark:border-zinc-800">
                          <div>
                            <p className="text-xs text-zinc-400">Date & Location</p>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {selectedRes.startTime} - {selectedRes.endTime}
                            </p>
                            <p className="text-xs">{selectedRes.location || "Location not given"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Event</p>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedRes.eventType}</p>
                          </div>
                        </div>
                        {selectedRes.customerNotes && (
                          <div className="border-t pt-3 dark:border-zinc-800">
                            <p className="text-xs text-zinc-400">Client Notes</p>
                            <p className="italic">"{selectedRes.customerNotes}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Status Actions */}
                    {selectedRes.status === "PENDING" && (
                      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold">Propose Quotation & Lock Slot</CardTitle>
                          <CardDescription>
                            Select packages to propose to this client. This locks the date for 24h.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          
                          {/* Packages Multi-select */}
                          <div className="space-y-2">
                            <Label>Choose Package Recommendations</Label>
                            <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 p-2 rounded">
                              {packages.length === 0 ? (
                                <p className="text-xs text-zinc-400 italic">No packages. Create them in Packages tab first.</p>
                              ) : (
                                packages.map((pkg) => (
                                  <label key={pkg.id} className="flex items-center gap-2 text-xs p-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded">
                                    <input
                                      type="checkbox"
                                      checked={selectedPkgIds.includes(pkg.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedPkgIds((prev) => [...prev, pkg.id]);
                                        } else {
                                          setSelectedPkgIds((prev) => prev.filter((id) => id !== pkg.id));
                                        }
                                      }}
                                    />
                                    <span>{pkg.name} - LKR {(pkg.priceInCents / 100).toLocaleString()}</span>
                                  </label>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="advance">Advance Payment (LKR)</Label>
                              <Input
                                id="advance"
                                type="number"
                                value={advanceAmount}
                                onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="propNotes">Quotation Note</Label>
                              <Input
                                id="propNotes"
                                placeholder="Any note to client..."
                                value={quotationNotes}
                                onChange={(e) => setQuotationNotes(e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2 border-t pt-3 dark:border-zinc-800">
                          {showRejectForm ? (
                            <div className="w-full space-y-2">
                              <Input
                                placeholder="Polite reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                                <Button size="sm" variant="destructive" onClick={handleRejectRequest} disabled={!rejectionReason.trim()}>
                                  Confirm Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setShowRejectForm(true)}>
                                Reject Request
                              </Button>
                              <Button onClick={handleProposeQuotation} disabled={selectedPkgIds.length === 0}>
                                Send Proposal
                              </Button>
                            </>
                          )}
                        </CardFooter>
                      </Card>
                    )}

                    {/* Proposal Details View */}
                    {(selectedRes.status === "PROPOSED" || selectedRes.status === "CONFIRMED") && (
                      <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm">Proposal Status Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <p>
                            <strong>Status:</strong>{" "}
                            <span className="font-semibold text-indigo-500 uppercase">{selectedRes.status}</span>
                          </p>
                          <p>
                            <strong>Advance Requested:</strong> LKR{" "}
                            {(selectedRes.advancePaymentPriceInCents! / 100).toLocaleString()}
                          </p>
                          {selectedRes.status === "PROPOSED" && (
                            <p className="text-red-500 text-xs">
                              ⏰ Expiry Deadline: {new Date(selectedRes.paymentDeadline!).toLocaleString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                  </div>

                  {/* Chat Section */}
                  <div className="space-y-4">
                    <Card className="flex flex-col h-[500px] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
                      <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" /> Live Chat with Customer
                        </CardTitle>
                        <CardDescription className="text-xs">Negotiate event details directly</CardDescription>
                      </CardHeader>
                      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-zinc-50/50 dark:bg-zinc-950/20">
                        {messages.map((msg) => {
                          const isMe = msg.sender === "PHOTOGRAPHER";
                          return (
                            <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto"}`}>
                              <span className="text-[9px] text-zinc-400 px-1">{msg.senderName}</span>
                              <div className={`rounded-xl px-3 py-1.5 text-xs shadow-sm ${
                                isMe ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-white text-zinc-900 border dark:bg-zinc-900 dark:text-zinc-100"
                              }`}>
                                <p className="break-all whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleSendChatMessage} className="p-2 border-t flex gap-1.5">
                        <Input
                          placeholder="Type a response..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="h-9 text-xs"
                          disabled={selectedRes.status === "CANCELLED" || selectedRes.status === "REJECTED"}
                        />
                        <Button type="submit" size="icon" className="h-9 w-9" disabled={!messageText.trim() || selectedRes.status === "CANCELLED" || selectedRes.status === "REJECTED"}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </Card>
                  </div>

                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-sm">
                  Select a reservation from the list to view details, proposal forms, and client chat thread.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {activeTab === "calendar" && (
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">Visual Bookings Grid</CardTitle>
                <CardDescription>Click a day slot to inspect photographer reservations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm w-32 text-center">
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </span>
                <Button size="icon" variant="outline" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Calendar Grid Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-zinc-500 mb-2">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              
              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                {generateCalendarDays().map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="bg-zinc-50/25 dark:bg-zinc-950/10 rounded-lg min-h-[70px]" />;
                  
                  const dayRes = getReservationsForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day.toISOString()}
                      className={`border p-2 rounded-lg min-h-[75px] text-left relative flex flex-col justify-between transition-colors ${
                        isToday
                          ? "border-zinc-900 bg-zinc-50/50 dark:border-white dark:bg-zinc-900"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <span className={`text-xs font-bold ${isToday ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                        {day.getDate()}
                      </span>
                      <div className="space-y-1 mt-1">
                        {dayRes.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setSelectedRes(r);
                              setActiveTab("reservations");
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded truncate cursor-pointer font-medium uppercase ${
                              r.status === "PENDING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                                : r.status === "PROPOSED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400"
                                : r.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {r.startTime} {r.customer.firstName}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        )}

        {/* ── PACKAGES TAB ── */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Manage Booking Packages</h3>
                <p className="text-xs text-zinc-500">Add, edit, or delete standard options proposed to users.</p>
              </div>
              <Button onClick={() => {
                setEditingPkg(null);
                packageFormik.resetForm();
                setPackageIncludesText("");
                setShowPackageModal(true);
              }} className="gap-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
                <Plus className="h-4 w-4" /> Add Package
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {packages.length === 0 ? (
                <div className="sm:col-span-3 text-center py-12 text-zinc-450 border border-dashed rounded-xl bg-white dark:bg-zinc-900">
                  No active packages. Click "Add Package" to create your first option.
                </div>
              ) : (
                packages.map((pkg) => (
                  <Card key={pkg.id} className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-md font-bold">{pkg.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500" onClick={() => handleEditPackage(pkg)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDeletePackage(pkg.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        Duration: {pkg.durationHours} hr(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pkg.description && (
                        <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                      {pkg.includes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Includes:</p>
                          <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc pl-4 space-y-0.5">
                            {pkg.includes.map((inc) => (
                              <li key={inc}>{inc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t bg-zinc-50/50 dark:bg-zinc-900/30 p-4 flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-zinc-400">LKR</span>
                      <span className="text-lg font-bold text-zinc-950 dark:text-white">
                        {(pkg.priceInCents / 100).toLocaleString()}
                      </span>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update biography and booking slug settings</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profBio">Short Biography</Label>
                  <textarea
                    id="profBio"
                    rows={4}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Describe your style, experience..."
                    className="w-full rounded-md border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profLoc">Base Location</Label>
                    <Input
                      id="profLoc"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="e.g. Colombo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profPort">Portfolio URL</Label>
                    <Input
                      id="profPort"
                      value={profilePortfolio}
                      onChange={(e) => setProfilePortfolio(e.target.value)}
                      placeholder="e.g. https://myportfolio.com"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 dark:border-zinc-800 flex justify-end">
                <Button type="submit">Save Settings</Button>
              </CardFooter>
            </form>
          </Card>
        )}

      </div>

      {/* ── MODAL: MANUAL BOOKING FORM ── */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Log Offline/Manual Booking
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowManualModal(false)} className="text-zinc-405">
                Cancel
              </Button>
            </div>
            
            <form onSubmit={manualFormik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Client First Name</Label>
                  <Input id="firstName" {...manualFormik.getFieldProps("firstName")} />
                  {manualFormik.touched.firstName && manualFormik.errors.firstName && (
                    <p className="text-xs text-red-500">{manualFormik.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Client Last Name</Label>
                  <Input id="lastName" {...manualFormik.getFieldProps("lastName")} />
                  {manualFormik.touched.lastName && manualFormik.errors.lastName && (
                    <p className="text-xs text-red-500">{manualFormik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...manualFormik.getFieldProps("email")} />
                  {manualFormik.touched.email && manualFormik.errors.email && (
                    <p className="text-xs text-red-500">{manualFormik.errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...manualFormik.getFieldProps("phone")} />
                  {manualFormik.touched.phone && manualFormik.errors.phone && (
                    <p className="text-xs text-red-500">{manualFormik.errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...manualFormik.getFieldProps("date")} />
                  {manualFormik.touched.date && manualFormik.errors.date && (
                    <p className="text-xs text-red-500">{manualFormik.errors.date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" {...manualFormik.getFieldProps("startTime")} />
                  {manualFormik.touched.startTime && manualFormik.errors.startTime && (
                    <p className="text-xs text-red-500">{manualFormik.errors.startTime}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" {...manualFormik.getFieldProps("endTime")} />
                  {manualFormik.touched.endTime && manualFormik.errors.endTime && (
                    <p className="text-xs text-red-500">{manualFormik.errors.endTime}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Input id="eventType" placeholder="e.g. Wedding, Portrait" {...manualFormik.getFieldProps("eventType")} />
                  {manualFormik.touched.eventType && manualFormik.errors.eventType && (
                    <p className="text-xs text-red-500">{manualFormik.errors.eventType}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. Colombo 03" {...manualFormik.getFieldProps("location")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Special requests</Label>
                <textarea
                  id="notes"
                  rows={2}
                  {...manualFormik.getFieldProps("notes")}
                  className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <div className="border-t pt-4 mt-6 flex justify-end gap-2 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowManualModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Book Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT PACKAGE ── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {editingPkg ? "Edit Package Details" : "Create New Package"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPackageModal(false)} className="text-zinc-405">
                Cancel
              </Button>
            </div>
            
            <form onSubmit={packageFormik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input id="name" placeholder="e.g. Bronze Portrait Package" {...packageFormik.getFieldProps("name")} />
                {packageFormik.touched.name && packageFormik.errors.name && (
                  <p className="text-xs text-red-500">{packageFormik.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={2}
                  placeholder="Describe details, deliverables..."
                  {...packageFormik.getFieldProps("description")}
                  className="w-full rounded-md border border-zinc-200 bg-white p-2.5 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (LKR)</Label>
                  <Input id="price" type="number" {...packageFormik.getFieldProps("price")} />
                  {packageFormik.touched.price && packageFormik.errors.price && (
                    <p className="text-xs text-red-500">{packageFormik.errors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (Hours)</Label>
                  <Input id="durationHours" type="number" {...packageFormik.getFieldProps("durationHours")} />
                  {packageFormik.touched.durationHours && packageFormik.errors.durationHours && (
                    <p className="text-xs text-red-500">{packageFormik.errors.durationHours}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="includesList">Included Items (comma separated)</Label>
                <Input
                  id="includesList"
                  placeholder="e.g. 1 Hour coverage, 15 edited photos, raw images"
                  value={packageIncludesText}
                  onChange={(e) => setPackageIncludesText(e.target.value)}
                />
                <p className="text-[10px] text-zinc-400">Separate items by comma.</p>
              </div>

              <div className="border-t pt-4 mt-6 flex justify-end gap-2 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowPackageModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPkg ? "Save Changes" : "Create Package"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
