"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService, User } from "./AuthService";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la app
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const user = await AuthService.validateToken();
        setUser(user);
      } catch (error) {
        console.error("Error al validar token:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      setUser(response.user);
      router.push("/feed");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push("/");
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      await AuthService.register(userData);
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Error al registrar:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
