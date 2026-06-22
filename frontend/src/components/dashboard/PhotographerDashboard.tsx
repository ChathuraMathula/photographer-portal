"use client";

import { usePhotographerDashboard } from "@/app/dashboard/hooks/usePhotographerDashboard";
import { UserRole } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, X } from "lucide-react";

// Dashboard sub-components
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PhotographerBanner } from "@/components/dashboard/PhotographerBanner";
import { ReservationList } from "@/components/dashboard/ReservationList";
import { CustomerDetailsCard } from "@/components/dashboard/CustomerDetailsCard";
import { ProposeQuotationCard } from "@/components/dashboard/ProposeQuotationCard";
import { ProposalStatusCard } from "@/components/dashboard/ProposalStatusCard";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { PackageGrid } from "@/components/dashboard/PackageGrid";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { ManualBookingModal } from "@/components/dashboard/ManualBookingModal";
import { PackageFormModal } from "@/components/dashboard/PackageFormModal";
import { ChatBox } from "@/components/common/ChatBox";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailsModal";
import { type Reservation } from "@/types";

type Props = {
  activeTab: "reservations" | "calendar" | "packages" | "profile";
};

export function PhotographerDashboard({ activeTab }: Props) {
  const router = useRouter();
  const [calendarSelectedRes, setCalendarSelectedRes] = useState<Reservation | null>(null);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; buttonX: number; buttonY: number } | null>(null);
  const {
    firstName,
    role,
    isAuthenticated,
    reservations,
    packages,
    selectedRes,
    setSelectedRes,
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
  } = usePhotographerDashboard();

  useEffect(() => {
    if (isAuthenticated && (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, role, router]);

  useEffect(() => {
    if (selectedRes) {
      setShowFloatingChat(true);
    } else {
      setShowFloatingChat(false);
    }
  }, [selectedRes]);

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/${tab}`);
  };

  // Draggable logic for floating button
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(false);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
      }
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setTimeout(() => {
        dragRef.current = null;
      }, 50);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
    };
    setIsDragging(false);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!dragRef.current) return;
      const touchMove = moveEvent.touches[0];
      const dx = touchMove.clientX - dragRef.current.startX;
      const dy = touchMove.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
      }
      let newX = dragRef.current.buttonX + dx;
      let newY = dragRef.current.buttonY + dy;
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      newX = Math.max(8, Math.min(newX, maxX));
      newY = Math.max(8, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      setTimeout(() => {
        dragRef.current = null;
      }, 50);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const getUnreadCount = (msgs: any[]) => {
    let lastPhotographerIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === "PHOTOGRAPHER") {
        lastPhotographerIndex = i;
        break;
      }
    }
    let unread = 0;
    for (let i = lastPhotographerIndex + 1; i < msgs.length; i++) {
      if (msgs[i].sender === "CUSTOMER") {
        unread++;
      }
    }
    return unread;
  };

  const unreadCount = showFloatingChat ? 0 : getUnreadCount(messages);

  const getChatBoxStyle = (): React.CSSProperties => {
    if (!position) {
      return {
        position: "fixed",
        bottom: "88px",
        right: "24px",
      };
    }
    const chatWidth = typeof window !== "undefined" && window.innerWidth < 640 ? 340 : 400;
    const chatHeight = 500;
    let chatTop = position.y - chatHeight - 12;
    if (chatTop < 8) {
      chatTop = position.y + 64 + 12;
    }
    let chatLeft = position.x + 28 - chatWidth / 2;
    const maxLeft = window.innerWidth - chatWidth - 12;
    chatLeft = Math.max(12, Math.min(chatLeft, maxLeft));
    return {
      position: "fixed",
      top: `${chatTop}px`,
      left: `${chatLeft}px`,
    };
  };

  if (!isAuthenticated || role !== UserRole.PHOTOGRAPHER) {
    return null; // Let the auth guard in the hook handle redirecting
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      userName={firstName ?? ""}
      userRole={role ?? ""}
    >
      <div className="space-y-6">
        <PhotographerBanner
          firstName={firstName ?? ""}
          profileAvailability={profileAvailability}
          onToggleAvailability={handleToggleAvailability}
          onAddManualBooking={() => setShowManualModal(true)}
        />

        {/* ── Reservations Tab ── */}
        {activeTab === "reservations" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left list */}
            <div className="lg:col-span-1">
              <ReservationList
                reservations={reservations}
                selectedId={selectedRes?.id}
                onSelect={(res) => {
                  setSelectedRes(res);
                  setShowRejectForm(false);
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", `/dashboard/reservations?id=${res.id}`);
                  }
                }}
              />
            </div>

            {/* Right details pane */}
            <div className="lg:col-span-2 space-y-4">
              {selectedRes ? (
                <div className="max-w-3xl mx-auto space-y-4">
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
              setCalendarSelectedRes(res);
            }}
            onDayClick={(date) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const dateStr = String(date.getDate()).padStart(2, "0");
              const formatted = `${year}-${month}-${dateStr}`;
              manualFormik.setFieldValue("date", formatted);
              setShowManualModal(true);
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
            bookingSlug={bookingSlug}
            onBioChange={setProfileBio}
            onLocationChange={setProfileLocation}
            onPortfolioChange={setProfilePortfolio}
            onSubmit={handleSaveProfile}
          />
        )}
      </div>

      {/* Modals */}
      {calendarSelectedRes && (
        <BookingDetailsModal
          reservation={calendarSelectedRes}
          onClose={() => setCalendarSelectedRes(null)}
          onNavigateToReservation={(res) => {
            setSelectedRes(res);
            setCalendarSelectedRes(null);
            router.push(`/dashboard/reservations?id=${res.id}`);
          }}
        />
      )}
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

      {/* Floating Chat Widget */}
      {selectedRes && (
        <div className="select-none">
          {showFloatingChat && (
            <div
              style={getChatBoxStyle()}
              className="w-[340px] sm:w-[400px] shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in slide-in-from-bottom-4 duration-200 z-40"
            >
              <ChatBox
                messages={messages}
                messageText={messageText}
                onMessageChange={setMessageText}
                onSend={handleSendChatMessage}
                disabled={chatDisabled}
                myRole="PHOTOGRAPHER"
                title={`Chat with ${selectedRes.customer.firstName}`}
                description={`Negotiating details for ${selectedRes.eventType}`}
              />
            </div>
          )}
          <button
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={(e) => {
              if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              setShowFloatingChat(!showFloatingChat);
            }}
            style={
              position
                ? {
                    position: "fixed",
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    bottom: "auto",
                    right: "auto",
                  }
                : {
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                  }
            }
            className="btn btn-primary rounded-full h-14 w-14 p-0 shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer touch-none z-40"
          >
            {showFloatingChat ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
