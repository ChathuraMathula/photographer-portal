"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserRole } from "@/store/slices/authSlice";
import { PhotographerDashboardProvider } from "./context/PhotographerDashboardContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { PhotographerLayoutWrapper } from "./components/PhotographerLayoutWrapper";
import { AdminLayoutWrapper } from "./components/AdminLayoutWrapper";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const { role, isAuthenticated, firstName } = useSelector(
    (state: RootState) => state.auth,
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-zinc-500 font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (role === UserRole.PHOTOGRAPHER) {
    return (
      <UserSettingsProvider>
        <PhotographerDashboardProvider>
          <PhotographerLayoutWrapper>{children}</PhotographerLayoutWrapper>
        </PhotographerDashboardProvider>
      </UserSettingsProvider>
    );
  }

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return (
      <UserSettingsProvider>
        <AdminLayoutWrapper firstName={firstName ?? ""} role={role ?? ""}>
          {children}
        </AdminLayoutWrapper>
      </UserSettingsProvider>
    );
  }

  return <>{children}</>;
}
