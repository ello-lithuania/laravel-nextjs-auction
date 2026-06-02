"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  city?: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  // The Sanctum token is no longer held in the browser — it lives in an
  // httpOnly cookie managed by the Next.js BFF routes, so `login` only needs
  // the (non-secret) user object.
  login: (user: User) => void;
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

  // Only the non-sensitive user profile is persisted client-side, purely so the
  // UI can render the logged-in state on reload. The auth token is never here.
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

  const value = useMemo(
    () => ({
      user,
      setUser: setUserState,
      login: (nextUser: User) => {
        setUserState(nextUser);
      },
      logout: () => {
        // Clears the httpOnly cookie server-side (and revokes the token).
        // Same-origin request, so the cookie is sent automatically.
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setUserState(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
