"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import { UserRole } from "@/store/slices/authSlice";
import { type Reservation } from "@/types";

// Import custom sub-hooks
import { useDashboardAuth } from "./useDashboardAuth";
import { useDashboardNotifications } from "./useDashboardNotifications";
import { useDashboardProfile } from "./useDashboardProfile";
import { useDashboardPackages } from "./useDashboardPackages";
import { useDashboardReservations } from "./useDashboardReservations";
import { useDashboardManualBooking } from "./useDashboardManualBooking";
import { useDashboardChat } from "./useDashboardChat";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";
type Tab = "reservations" | "calendar" | "packages" | "profile";

export function usePhotographerDashboard() {
  const { socket } = useSocket();

  // 1. Auth Hook
  const {
    firstName,
    role,
    userId,
    isAuthenticated,
    handleLogout,
    authFetch,
  } = useDashboardAuth();

  // States managed in main hook for coordination
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarSelectedRes, setCalendarSelectedRes] = useState<Reservation | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);

  // 2. Notifications Hook
  const {
    notifications,
    setNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClearAllNotifications,
  } = useDashboardNotifications();

  // 3. Profile Hook
  const profile = useDashboardProfile({ userId, authFetch });

  // 4. Packages Hook
  const packagesState = useDashboardPackages({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
    },
  });

  // 5. Reservations Hook
  const reservationsState = useDashboardReservations({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
    },
    packages: packagesState.packages,
    universalDepositType: profile.universalDepositType,
    universalDepositValue: profile.universalDepositValue,
  });

  // 6. Manual Booking Hook
  const manualBooking = useDashboardManualBooking({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
    },
    setShowManualModal,
  });

  // 7. Chat Hook
  const chat = useDashboardChat({
    socket,
    selectedRes: reservationsState.selectedRes,
    authFetch,
  });

  const loadTransactions = async () => {
    try {
      const res = await authFetch(`${API}/payments/photographer`, { credentials: "include" });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  const loadPhotographerData = async () => {
    if (role !== UserRole.PHOTOGRAPHER) return;
    if (!userId || userId === "null" || userId === "undefined") return;
    try {
      const [resRes, pkgRes, profRes] = await Promise.all([
        authFetch(`${API}/reservations`, { credentials: "include" }),
        authFetch(`${API}/packages`, { credentials: "include" }),
        authFetch(`${API}/photographers/${userId}`, { credentials: "include" }),
      ]);

      if (resRes.ok) {
        const resData = await resRes.json();
        reservationsState.setReservations(resData);
      }
      if (pkgRes.ok) {
        packagesState.setPackages(await pkgRes.json());
      }
      if (profRes.ok) {
        const profData = await profRes.json();
        profile.setProfileBio(profData.bio || "");
        profile.setProfileLocation(profData.baseLocation || "");
        profile.setProfilePortfolio(profData.portfolioUrl || "");
        profile.setProfileAvailability(profData.isAvailableForBooking);
        profile.setBookingSlug(profData.bookingSlug || "");
        profile.setProfileImageUrl(profData.profileImageUrl || "");
        profile.setAllowedEventTypes(profData.allowedEventTypes || []);
        profile.setAllowCustomEventTypes(profData.allowCustomEventTypes !== false);
        profile.setUniversalDepositType(profData.universalDepositType || "fixed");
        profile.setUniversalDepositValue(
          profData.universalDepositType === "percentage"
            ? profData.universalDepositValue ?? 10
            : (profData.universalDepositValue ?? 500000) / 100
        );
        profile.setOfflineMessage(profData.offlineMessage || "");
      }
      await loadTransactions();
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
      if (resId && reservationsState.reservations.length > 0) {
        const found = reservationsState.reservations.find((r) => r.id === resId);
        if (found) {
          reservationsState.setSelectedRes(found);
        }
      }
    }
  }, [reservationsState.reservations]);

  // Socket Dashboard Realtime Listeners
  useEffect(() => {
    if (!socket || !isAuthenticated || role !== UserRole.PHOTOGRAPHER || !userId) {
      return;
    }

    socket.emit("joinPhotographerDashboard", { photographerId: userId });

    const handleReservationCreated = (newRes: Reservation) => {
      reservationsState.setReservations((prev) => {
        if (prev.some((r) => r.id === newRes.id)) return prev;
        return [newRes, ...prev];
      });
      setNotifications((prev) => [
        {
          id: `booking_${newRes.id}_${Date.now()}`,
          title: "New Booking Request",
          description: `${newRes.customer?.firstName ?? "Client"} requested a ${newRes.eventType} session.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "booking" as const,
          referenceId: newRes.id,
        },
        ...prev,
      ]);
      loadTransactions();
      toast.info(`New booking request from ${newRes.customer?.firstName ?? "Client"}!`);
    };

    const handleReservationUpdated = (updatedRes: Reservation) => {
      reservationsState.setReservations((prev) =>
        prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
      );
      reservationsState.setSelectedRes((prev) =>
        prev && prev.id === updatedRes.id ? updatedRes : prev
      );
      loadTransactions();
    };

    const handleMessageReceived = ({ reservationId, message }: any) => {
      reservationsState.setReservations((prev) =>
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

      reservationsState.setSelectedRes((prev) => {
        if (prev && prev.id === reservationId) {
          chat.setMessages((msgs) => {
            if (msgs.some((m) => m.id === message.id)) return msgs;
            return [...msgs, message];
          });
        }
        return prev;
      });

      if (message.sender === "CUSTOMER") {
        setNotifications((prev) => [
          {
            id: `msg_${message.id}`,
            title: `New Message from ${message.senderName}`,
            description: message.content,
            timestamp: new Date().toISOString(),
            read: false,
            type: "chat" as const,
            referenceId: reservationId,
          },
          ...prev,
        ]);
        toast.success(`Message from ${message.senderName}: "${message.content.substring(0, 40)}${message.content.length > 40 ? "..." : ""}"`);
      }
    };

    const handleTransactionLogged = () => {
      loadTransactions();
    };

    socket.on("reservationCreated", handleReservationCreated);
    socket.on("reservationUpdated", handleReservationUpdated);
    socket.on("messageReceived", handleMessageReceived);
    socket.on("transactionLogged", handleTransactionLogged);

    return () => {
      socket.off("reservationCreated", handleReservationCreated);
      socket.off("reservationUpdated", handleReservationUpdated);
      socket.off("messageReceived", handleMessageReceived);
      socket.off("transactionLogged", handleTransactionLogged);
    };
  }, [socket, isAuthenticated, role, userId]);

  const chatDisabled =
    reservationsState.selectedRes?.status === "CANCELLED" ||
    reservationsState.selectedRes?.status === "REJECTED";

  return {
    firstName,
    role,
    isAuthenticated,
    activeTab,
    setActiveTab,
    reservations: reservationsState.reservations,
    packages: packagesState.packages,
    selectedRes: reservationsState.selectedRes,
    setSelectedRes: reservationsState.selectReservation,
    messages: chat.messages,
    messageText: chat.messageText,
    setMessageText: chat.setMessageText,
    chatEndRef: chat.chatEndRef,
    selectedPkgIds: reservationsState.selectedPkgIds,
    setSelectedPkgIds: reservationsState.setSelectedPkgIds,
    quotationNotes: reservationsState.quotationNotes,
    setQuotationNotes: reservationsState.setQuotationNotes,
    rejectionReason: reservationsState.rejectionReason,
    setRejectionReason: reservationsState.setRejectionReason,
    showRejectForm: reservationsState.showRejectForm,
    setShowRejectForm: reservationsState.setShowRejectForm,
    showManualModal,
    setShowManualModal,
    showPackageModal: packagesState.showPackageModal,
    setShowPackageModal: packagesState.setShowPackageModal,
    editingPkg: packagesState.editingPkg,
    setEditingPkg: packagesState.setEditingPkg,
    packageIncludesText: packagesState.packageIncludesText,
    setPackageIncludesText: packagesState.setPackageIncludesText,
    profileBio: profile.profileBio,
    setProfileBio: profile.setProfileBio,
    profileLocation: profile.profileLocation,
    setProfileLocation: profile.setProfileLocation,
    profilePortfolio: profile.profilePortfolio,
    setProfilePortfolio: profile.setProfilePortfolio,
    profileAvailability: profile.profileAvailability,
    bookingSlug: profile.bookingSlug,
    currentDate,
    setCurrentDate,
    handleLogout,
    handleSendChatMessage: chat.handleSendChatMessage,
    handleProposeQuotation: reservationsState.handleProposeQuotation,
    handleRejectRequest: reservationsState.handleRejectRequest,
    handleSaveProfile: profile.handleSaveProfile,
    handleToggleAvailability: profile.handleToggleAvailability,
    handleEditPackage: packagesState.handleEditPackage,
    handleDeletePackage: packagesState.handleDeletePackage,
    manualFormik: manualBooking.manualFormik,
    packageFormik: packagesState.packageFormik,
    chatDisabled,
    profileImageUrl: profile.profileImageUrl,
    setProfileImageUrl: profile.setProfileImageUrl,
    allowedEventTypes: profile.allowedEventTypes,
    setAllowedEventTypes: profile.setAllowedEventTypes,
    allowCustomEventTypes: profile.allowCustomEventTypes,
    setAllowCustomEventTypes: profile.setAllowCustomEventTypes,
    universalDepositType: profile.universalDepositType,
    setUniversalDepositType: profile.setUniversalDepositType,
    universalDepositValue: profile.universalDepositValue,
    setUniversalDepositValue: profile.setUniversalDepositValue,
    notifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClearAllNotifications,
    calendarSelectedRes,
    setCalendarSelectedRes,
    offlineMessage: profile.offlineMessage,
    setOfflineMessage: profile.setOfflineMessage,
    transactions,
    loadTransactions,
    packageDeposits: reservationsState.packageDeposits,
    setPackageDeposits: reservationsState.setPackageDeposits,
    customPackage: reservationsState.customPackage,
    setCustomPackage: reservationsState.setCustomPackage,
    customPackageDeposit: reservationsState.customPackageDeposit,
    setCustomPackageDeposit: reservationsState.setCustomPackageDeposit,
    isCustomPackageSelected: reservationsState.isCustomPackageSelected,
    setIsCustomPackageSelected: reservationsState.setIsCustomPackageSelected,
  };
}
