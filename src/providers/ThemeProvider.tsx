"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SiteTheme = "indigo" | "emerald" | "violet" | "amber" | "rose";

interface ThemeContextType {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>("indigo");

  // Sync preference on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("site_theme") as SiteTheme;
      if (saved) {
        setThemeState(saved);
        updateBodyClass(saved);
      } else {
        updateBodyClass("indigo");
      }
    }
  }, []);

  const setTheme = (newTheme: SiteTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("site_theme", newTheme);
    updateBodyClass(newTheme);
  };

  const updateBodyClass = (activeTheme: SiteTheme) => {
    if (typeof document !== "undefined") {
      const body = document.body;
      // Remove any existing theme- classes
      const classesToRemove = Array.from(body.classList).filter((c) =>
        c.startsWith("theme-")
      );
      classesToRemove.forEach((c) => body.classList.remove(c));
      // Add active class
      body.classList.add(`theme-${activeTheme}`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
