import React, { createContext, useState, useEffect } from "react";
import * as authApi from "../services/auth";
import {
  saveAccessToken,
  getAccessToken,
  clearTokens
} from "../services/authLocal";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  /* ================= LOGIN ================= */

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    saveAccessToken(res.data.access_token);
    await loadUser();
  };

  /* ================= REGISTER (FIX) ================= */

  const register = async (form) => {
  return authApi.register({
    full_name: form.full_name,
    email: form.email,
    password: form.password,
    department: form.department, // ✅ ADD
    role: form.role              // ✅ ADD
  });
};
  /* ================= LOGOUT ================= */

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register // ✅ EXPOSE REGISTER
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
