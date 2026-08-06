"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useDashboardDataLoader } from "./useDashboardDataLoader";
import { useDashboardRealtime } from "./useDashboardRealtime";

type Tab = "reservations" | "calendar" | "packages" | "profile";

export function usePhotographerDashboard() {
  const { socket } = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resId = searchParams.get("id");
  const localSelectionRef = useRef(false);

  // Auth Hook
  const { firstName, role, userId, isAuthenticated, handleLogout, authFetch } =
    useDashboardAuth();

  const [forceOpenChat, setForceOpenChat] = useState(0);

  // States managed in main hook for coordination
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarSelectedRes, setCalendarSelectedRes] =
    useState<Reservation | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Notifications Hook
  const {
    notifications,
    setNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClearAllNotifications,
  } = useDashboardNotifications({ authFetch, isAuthenticated, role });

  // Profile Hook
  const profile = useDashboardProfile({ userId, authFetch });

  // Packages Hook
  const packagesState = useDashboardPackages({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
    },
  });

  // Reservations Hook
  const reservationsState = useDashboardReservations({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
    },
    packages: packagesState.packages,
    universalDepositType: profile.universalDepositType,
    universalDepositValue: profile.universalDepositValue,
  });

  // Manual Booking Hook
  const manualBooking = useDashboardManualBooking({
    authFetch,
    loadPhotographerData: async () => {
      await loadPhotographerData();
      await reservationsState.fetchReservations();
    },
    setShowManualModal,
    onBookingCreated: (newRes) => {
      reservationsState.setReservations((prev: Reservation[]) => {
        if (prev.some((r) => r.id === newRes.id)) return prev;
        return [newRes, ...prev];
      });
      if (typeof reservationsState.setCalendarReservations === "function") {
        reservationsState.setCalendarReservations((prev: Reservation[]) => {
          if (prev.some((r) => r.id === newRes.id)) return prev;
          return [...prev, newRes];
        });
      }
    },
  });

  // Chat Hook
  const chat = useDashboardChat({
    socket,
    selectedRes: reservationsState.selectedRes,
    authFetch,
  });

  // Data Loader Hook
  const {
    transactions,
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    setTransactionsTotalPages,
    transactionsTotal,
    setTransactionsTotal,
    transactionStats,
    transactionsLoading,
    loadTransactions,
    loadPhotographerData,
  } = useDashboardDataLoader({
    role,
    userId,
    authFetch,
    reservationsState,
    packagesState,
    profile,
  });

  // 9. Realtime WebSocket Listener Hook
  useDashboardRealtime({
    socket,
    isAuthenticated,
    role,
    userId,
    reservationsState,
    setNotifications,
    loadTransactions,
    chat,
    setForceOpenChat,
    router,
  });

  useEffect(() => {
    if (isAuthenticated && role === UserRole.PHOTOGRAPHER) {
      loadPhotographerData();
    }
  }, [isAuthenticated, role, userId]);

  useEffect(() => {
    if (!resId || !isAuthenticated) return;
    if (localSelectionRef.current) {
      localSelectionRef.current = false;
      return;
    }
    // Already selected – nothing to do
    if (reservationsState.selectedRes?.id === resId) return;

    // First try to find in the already-loaded page (instant, no request)
    const found = reservationsState.reservations.find((r) => r.id === resId);
    if (found) {
      reservationsState.setSelectedRes(found);
      return;
    }

    // Not on the current page – fetch the reservation directly by ID
    authFetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/reservations/${resId}`,
      { credentials: "include" },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) reservationsState.setSelectedRes(data);
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resId, isAuthenticated, reservationsState.reservations]);

  useEffect(() => {
    if (reservationsState.selectedRes && notifications.length > 0) {
      const hasUnreadChat = notifications.some(
        (n) => n.type === "chat" && !n.read && n.referenceId === reservationsState.selectedRes!.id
      );
      if (hasUnreadChat) {
        setForceOpenChat((prev) => prev + 1);
        handleMarkAsRead(notifications.find(n => n.type === "chat" && !n.read && n.referenceId === reservationsState.selectedRes!.id)!.id);
      }
    }
  }, [reservationsState.selectedRes, notifications, handleMarkAsRead]);

  const chatDisabled =
    reservationsState.selectedRes?.status === "CANCELLED" ||
    reservationsState.selectedRes?.status === "REJECTED";

  return {
    firstName,
    role,
    userId,
    isAuthenticated,
    activeTab,
    setActiveTab,
    reservations: reservationsState.reservations,
    packages: packagesState.packages,
    selectedRes: reservationsState.selectedRes,
    setSelectedRes: (res: Reservation | null) => {
      localSelectionRef.current = true;
      reservationsState.selectReservation(res);
    },
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
    specializations: profile.specializations,
    setSpecializations: profile.setSpecializations,
    profileLocation: profile.profileLocation,
    setProfileLocation: profile.setProfileLocation,
    city: profile.city,
    setCity: profile.setCity,
    district: profile.district,
    setDistrict: profile.setDistrict,
    locationMapLink: profile.locationMapLink,
    setLocationMapLink: profile.setLocationMapLink,
    showMapPreviewOnBookingPage: profile.showMapPreviewOnBookingPage,
    setShowMapPreviewOnBookingPage: profile.setShowMapPreviewOnBookingPage,
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
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    setTransactionsTotalPages,
    transactionsTotal,
    setTransactionsTotal,
    transactionStats,
    transactionsLoading,
    loadTransactions,
    packageDeposits: reservationsState.packageDeposits,
    setPackageDeposits: reservationsState.setPackageDeposits,
    customPackage: reservationsState.customPackage,
    setCustomPackage: reservationsState.setCustomPackage,
    customPackageDeposit: reservationsState.customPackageDeposit,
    setCustomPackageDeposit: reservationsState.setCustomPackageDeposit,
    isCustomPackageSelected: reservationsState.isCustomPackageSelected,
    setIsCustomPackageSelected: reservationsState.setIsCustomPackageSelected,
    forceOpenChat,
    setForceOpenChat,
    authFetch,
    page: reservationsState.page,
    setPage: reservationsState.setPage,
    totalPages: reservationsState.totalPages,
    total: reservationsState.total,
    search: reservationsState.search,
    setSearch: reservationsState.setSearch,
    statusFilter: reservationsState.statusFilter,
    setStatusFilter: reservationsState.setStatusFilter,
    sortBy: reservationsState.sortBy,
    setSortBy: reservationsState.setSortBy,
    sortOrder: reservationsState.sortOrder,
    setSortOrder: reservationsState.setSortOrder,
    reservationsLoading: reservationsState.loading,
    calendarReservations: reservationsState.calendarReservations,
    fetchCalendarReservations: reservationsState.fetchCalendarReservations,
    calendarLoading: reservationsState.calendarLoading,
    coverImageUrl: profile.coverImageUrl,
    setCoverImageUrl: profile.setCoverImageUrl,
    showManualBookingInTopbar: profile.showManualBookingInTopbar,
    setShowManualBookingInTopbar: profile.setShowManualBookingInTopbar,
    showAcceptBookingsInTopbar: profile.showAcceptBookingsInTopbar,
    setShowAcceptBookingsInTopbar: profile.setShowAcceptBookingsInTopbar,
    proposalExpirationHours: profile.proposalExpirationHours,
    setProposalExpirationHours: profile.setProposalExpirationHours,
    paymentsUpdatedTrigger: reservationsState.paymentsUpdatedTrigger,
    setPaymentsUpdatedTrigger: reservationsState.setPaymentsUpdatedTrigger,
    lockedDates: reservationsState.lockedDates,
    fetchLockedDates: reservationsState.fetchLockedDates,
    lockDate: reservationsState.lockDate,
    unlockDate: reservationsState.unlockDate,
  };
}
