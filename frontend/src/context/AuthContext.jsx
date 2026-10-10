import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
    if (user) localStorage.setItem("swcms_user", JSON.stringify(user));
    else localStorage.removeItem("swcms_user");
  }, [user]);

  const login = async (email, password, role) => {
    if (!email || !password) throw new Error("Email and password are required.");

    const account = {
      email,
      name: role === "admin" ? "System Administrator" : "Municipal Authority",
      role
    };

    setUser(account);
    return account;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}