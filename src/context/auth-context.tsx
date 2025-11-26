"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type HouseholdUserProfile = "Husband" | "Wife";

type AuthState = {
  profile: HouseholdUserProfile | null;
  isLoaded: boolean;
  setProfile: (profile: HouseholdUserProfile) => void;
  clearProfile: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "household.activeProfile";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Start with null on both server and client to avoid hydration mismatch
  const [profile, setProfileState] = useState<HouseholdUserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load profile from localStorage on client
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const profileValue = (stored === "Husband" || stored === "Wife") ? stored : null;
    setProfileState(profileValue);
    setIsLoaded(true);
  }, []);

  const setProfile = useCallback((next: HouseholdUserProfile) => {
    setProfileState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ profile, isLoaded, setProfile, clearProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

