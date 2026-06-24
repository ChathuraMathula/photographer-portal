"use client";

import React, { createContext, useContext } from "react";
import { usePhotographerDashboard } from "../hooks/usePhotographerDashboard";

type DashboardContextType = ReturnType<typeof usePhotographerDashboard>;

const PhotographerDashboardContext = createContext<DashboardContextType | null>(null);

export function PhotographerDashboardProvider({ children }: { children: React.ReactNode }) {
  const value = usePhotographerDashboard();

  return (
    <PhotographerDashboardContext.Provider value={value}>
      {children}
    </PhotographerDashboardContext.Provider>
  );
}

export function usePhotographerDashboardContext() {
  const context = useContext(PhotographerDashboardContext);
  return context;
}
