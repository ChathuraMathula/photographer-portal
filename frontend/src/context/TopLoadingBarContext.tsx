"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface TopLoadingBarContextType {
  start: () => void;
  done: () => void;
}

const TopLoadingBarContext = createContext<TopLoadingBarContextType | null>(null);

export function TopLoadingBarProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Reset/done whenever route path changes
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const start = () => {
    setVisible(true);
    setProgress(15);
  };

  const done = () => {
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  useEffect(() => {
    if (visible && progress < 90) {
      const timer = setTimeout(() => {
        setProgress((prev) => prev + (90 - prev) * 0.15);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible, progress]);

  // Intercept all local anchor clicks to start the progress bar automatically
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        const targetAttr = anchor.getAttribute("target");
        
        // Ensure it's a valid local route navigation and not an external / same page / blank target link
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("/#") &&
          targetAttr !== "_blank" &&
          href !== pathname
        ) {
          start();
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [pathname]);

  return (
    <TopLoadingBarContext.Provider value={{ start, done }}>
      {children}
      {visible && (
        <div
          className="fixed top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-700 z-[9999] transition-all duration-300 ease-out shadow-[0_1px_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
        />
      )}
    </TopLoadingBarContext.Provider>
  );
}

export function useTopLoadingBar() {
  const context = useContext(TopLoadingBarContext);
  if (!context) {
    throw new Error("useTopLoadingBar must be used within a TopLoadingBarProvider");
  }
  return context;
}
