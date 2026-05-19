import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    const { data } = await authAPI.signup({ name, email, password, role });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};