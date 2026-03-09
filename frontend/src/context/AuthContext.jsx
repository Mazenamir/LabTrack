import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ─── Load user on app start if token exists ──────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get("/users/me");
          setUser(res.data.user);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // ─── Login ───────────────────────────────────────────────────
  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
    setUser(userData);
  };

  // ─── Logout ──────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom hook ──────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);