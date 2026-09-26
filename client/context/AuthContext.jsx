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
    const cachedUser = localStorage.getItem("mp_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {}
    }

    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("mp_user", JSON.stringify(res.data));
      })
      .catch((err) => {
        // Only invalidate session if backend explicitly responds with 401 Unauthorized
        if (err?.response?.status === 401) {
          localStorage.removeItem("mp_token");
          localStorage.removeItem("mp_user");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("mp_token", token);
    if (userData) {
      localStorage.setItem("mp_user", JSON.stringify(userData));
    }
    setUser(userData);
  }

  function updateUser(userData) {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem("mp_user", JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    localStorage.removeItem("mp_token");
    localStorage.removeItem("mp_user");
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
