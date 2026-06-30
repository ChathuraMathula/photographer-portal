"use client";

import { useEffect, useState } from "react";
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

  // 1. Auth Hook
  const {
    firstName,
    role,
    userId,
    isAuthenticated,
    handleLogout,
    authFetch,
  } = useDashboardAuth();

  const [forceOpenChat, setForceOpenChat] = useState(0);

  // States managed in main hook for coordination
  const [activeTab, setActiveTab] = useState<Tab>("reservations");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarSelectedRes, setCalendarSelectedRes] = useState<Reservation | null>(null);
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

  // 8. Data Loader Hook
  const {
    transactions,
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    setTransactionsTotalPages,
    transactionsTotal,
    setTransactionsTotal,
    transactionStats,
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
    if (resId && reservationsState.reservations.length > 0) {
      const found = reservationsState.reservations.find((r) => r.id === resId);
      if (found) {
        if (reservationsState.selectedRes?.id !== found.id) {
          reservationsState.setSelectedRes(found);
        }
      }
    }
  }, [resId, reservationsState.reservations, reservationsState.selectedRes]);

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
    transactionsPage,
    setTransactionsPage,
    transactionsTotalPages,
    setTransactionsTotalPages,
    transactionsTotal,
    setTransactionsTotal,
    transactionStats,
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
    reservationsLoading: reservationsState.loading,
    calendarReservations: reservationsState.calendarReservations,
    fetchCalendarReservations: reservationsState.fetchCalendarReservations,
  };
}
