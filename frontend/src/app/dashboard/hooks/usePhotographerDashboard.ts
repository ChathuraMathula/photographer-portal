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
import { type ManualBookingValues } from "@/components/dashboard/ManualBookingModal";
import { type PackageFormValues } from "@/components/dashboard/PackageFormModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type Tab = "reservations" | "calendar" | "packages" | "profile";

const ManualBookingSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  date: Yup.string()
    .required("Date is required")
    .test("not-past", "Date cannot be in the past", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      return selected >= today;
    }),
  startTime: Yup.string()
    .required("Start time is required")
    .test("not-past-time", "Start time cannot be in the past", function (value) {
      if (!value) return false;
      const { date } = this.parent;
      if (!date) return true;
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA");
      if (date === todayStr) {
        const currentTime = today.toTimeString().slice(0, 5); // "HH:MM"
        return value >= currentTime;
      }
      return true;
    }),
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

export function usePhotographerDashboard() {
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
  const [bookingSlug, setBookingSlug] = useState("");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;
    if (!userId || userId === "null" || userId === "undefined") return;
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
        setBookingSlug(profData.bookingSlug || "");
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const resId = params.get("id");
      if (resId && reservations.length > 0) {
        const found = reservations.find((r) => r.id === resId);
        if (found) {
          setSelectedRes(found);
        }
      }
    }
  }, [reservations]);

  // ── Chat / Socket.io ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || role !== UserRole.PHOTOGRAPHER || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(API);
    socketRef.current = socket;

    socket.emit("joinPhotographerDashboard", { photographerId: userId });

    socket.on("reservationCreated", (newRes: Reservation) => {
      setReservations((prev) => {
        if (prev.some((r) => r.id === newRes.id)) return prev;
        return [newRes, ...prev];
      });
    });

    socket.on("reservationUpdated", (updatedRes: Reservation) => {
      setReservations((prev) =>
        prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
      );
      setSelectedRes((prev) =>
        prev && prev.id === updatedRes.id ? updatedRes : prev
      );
    });

    socket.on("messageReceived", ({ reservationId, message }) => {
      setReservations((prev) =>
        prev.map((r) => {
          if (r.id === reservationId) {
            const currentMessages = r.messages || [];
            if (currentMessages.some((m) => m.id === message.id)) return r;
            return {
              ...r,
              messages: [...currentMessages, message],
            };
          }
          return r;
        })
      );

      setSelectedRes((prev) => {
        if (prev && prev.id === reservationId) {
          setMessages((msgs) => {
            if (msgs.some((m) => m.id === message.id)) return msgs;
            return [...msgs, message];
          });
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, role, userId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedRes) {
      setMessages([]);
      return;
    }

    fetch(`${API}/reservations/${selectedRes.id}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        scrollToBottom();
      })
      .catch(console.error);

    socket.emit("joinReservation", { reservationId: selectedRes.id });

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };

    socket.on("message", handleMessage);

    return () => {
      socket.emit("leaveReservation", { reservationId: selectedRes.id });
      socket.off("message", handleMessage);
    };
  }, [selectedRes]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout error:", err);
    }
    dispatch(logout());
    window.location.href = "/login";
  };

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
    } catch (err) {
      console.error(err);
    }
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
      if (!res.ok) throw new Error(data.message || "Failed to reject");
      setRejectionReason("");
      setShowRejectForm(false);
      loadPhotographerData();
      setSelectedRes(null);
      alert("Request rejected professionally.");
    } catch (err: any) {
      alert(err.message || "Error rejecting request");
    }
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

  const manualFormik = useFormik<ManualBookingValues>({
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
        alert("Manual offline booking registered successfully!");
      } catch (err: any) {
        alert(err.message || "Manual booking failed");
      }
    },
  });

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
      } catch (err) {
        alert("Error saving package details");
      }
    },
  });

  const handleSetSelectedRes = (res: Reservation | null) => {
    setSelectedRes(res);
    if (res) {
      const key = `chat_last_viewed_photographer_${res.id}`;
      localStorage.setItem(key, new Date().toISOString());
      // Force trigger state update to re-render the list items
      setReservations((prev) => [...prev]);
    }
  };

  const chatDisabled =
    selectedRes?.status === "CANCELLED" || selectedRes?.status === "REJECTED";

  return {
    firstName,
    role,
    isAuthenticated,
    activeTab,
    setActiveTab,
    reservations,
    packages,
    selectedRes,
    setSelectedRes: handleSetSelectedRes,
    messages,
    messageText,
    setMessageText,
    chatEndRef,
    selectedPkgIds,
    setSelectedPkgIds,
    advanceAmount,
    setAdvanceAmount,
    quotationNotes,
    setQuotationNotes,
    rejectionReason,
    setRejectionReason,
    showRejectForm,
    setShowRejectForm,
    showManualModal,
    setShowManualModal,
    showPackageModal,
    setShowPackageModal,
    editingPkg,
    setEditingPkg,
    packageIncludesText,
    setPackageIncludesText,
    profileBio,
    setProfileBio,
    profileLocation,
    setProfileLocation,
    profilePortfolio,
    setProfilePortfolio,
    profileAvailability,
    bookingSlug,
    currentDate,
    setCurrentDate,
    handleLogout,
    handleSendChatMessage,
    handleProposeQuotation,
    handleRejectRequest,
    handleSaveProfile,
    handleToggleAvailability,
    handleEditPackage,
    handleDeletePackage,
    manualFormik,
    packageFormik,
    chatDisabled,
  };
}
