import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";
import { msalInstance } from "../config/msalConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email, password) => {
    const res = await API.post("/auth/admin-login", { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const manualLogin = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    const wasAdmin = user?.role === "admin";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    const activeAccount = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (activeAccount) {
      msalInstance.logoutRedirect({ account: activeAccount });
    } else {
      window.location.href = wasAdmin ? "/admin/login" : "/login";
    }
  };

  const microsoftLogin = async (msalResponse) => {
    try {
      const res = await API.post("/auth/microsoft", {
        microsoftId: msalResponse.account.localAccountId,
        email: msalResponse.account.username,
        name: msalResponse.account.name,
      });
      const { token, user: userData } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, adminLogin, manualLogin, microsoftLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
