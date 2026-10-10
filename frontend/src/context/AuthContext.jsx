import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("swcms_user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("swcms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("swcms_user");
      localStorage.removeItem("swcms_token");
    }
  }, [user]);

  const login = async (emailOrUsername, password, role) => {
    if (!emailOrUsername || !password) {
      throw new Error("Username/Email and password are required.");
    }

    const data = await authService.login(emailOrUsername, password, role);
    if (data.token) {
      localStorage.setItem("swcms_token", data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("swcms_token");
    localStorage.removeItem("swcms_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}