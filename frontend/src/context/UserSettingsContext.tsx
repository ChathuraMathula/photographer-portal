"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface UserSettingsContextValue {
  inAppNotificationsEnabled: boolean;
  refreshSettings: () => void;
}

const UserSettingsContext = createContext<UserSettingsContextValue>({
  inAppNotificationsEnabled: true,
  refreshSettings: () => {},
});

export function useUserSettings() {
  return useContext(UserSettingsContext);
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function UserSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [inAppNotificationsEnabled, setInAppNotificationsEnabled] =
    useState(true);

  const refreshSettings = useCallback(() => {
    fetch(`${API}/users/settings`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setInAppNotificationsEnabled(data.inAppNotificationsEnabled ?? true);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch on mount
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Listen for settings-saved event dispatched from the settings page
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.inAppNotificationsEnabled !== undefined) {
        setInAppNotificationsEnabled(e.detail.inAppNotificationsEnabled);
      }
    };
    window.addEventListener("user-settings-saved" as any, handler);
    return () =>
      window.removeEventListener("user-settings-saved" as any, handler);
  }, []);

  return (
    <UserSettingsContext.Provider
      value={{ inAppNotificationsEnabled, refreshSettings }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}
