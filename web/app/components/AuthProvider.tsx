"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type User = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Static-export build (no Node/BFF), so the SPA holds the Sanctum bearer token
  // itself and calls the Laravel API directly. The token lives in localStorage;
  // the strict CSP (set in public_html/.htaccess) is the main XSS mitigation.
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = window.localStorage.getItem("auctionhub_user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as User;
    } catch {
      window.localStorage.removeItem("auctionhub_user");
      return null;
    }
  });

  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("auctionhub_token");
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (user) {
      window.localStorage.setItem("auctionhub_user", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("auctionhub_user");
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (token) {
      window.localStorage.setItem("auctionhub_token", token);
    } else {
      window.localStorage.removeItem("auctionhub_token");
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      setUser: setUserState,
      login: (nextUser: User, nextToken: string) => {
        setUserState(nextUser);
        setTokenState(nextToken);
      },
      logout: () => {
        // Best-effort token revocation on the server; clear locally regardless.
        if (token) {
          fetch(`${apiBaseUrl}/api/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          }).catch(() => {});
        }
        setUserState(null);
        setTokenState(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
