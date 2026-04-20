import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { api } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

interface User {
  _id: string;
  displayName: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  favoriteTeam: string;
  country: string;
  city: string;
  online: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    displayName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    if (token) {
      api<User>("/auth/me", { token })
        .then((userData) => {
          setUser(userData);
          connectSocket(token);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    connectSocket(data.token);
  }, []);

  const register = useCallback(
    async (regData: {
      displayName: string;
      username: string;
      email: string;
      password: string;
    }) => {
      const data = await api<{ user: User; token: string }>("/auth/register", {
        method: "POST",
        body: regData,
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      connectSocket(data.token);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
