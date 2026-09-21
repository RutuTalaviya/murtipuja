"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mp_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("mp_token");
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("mp_token", token);
    setUser(userData);
  }

  function updateUser(userData) {
    setUser((prev) => ({ ...prev, ...userData }));
  }

  function logout() {
    localStorage.removeItem("mp_token");
    setUser(null);
  }

  function openLoginModal() {
    setLoginModalOpen(true);
  }

  function closeLoginModal() {
    setLoginModalOpen(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
