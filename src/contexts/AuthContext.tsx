"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  LoginRequest,
  RegisterCustomerRequest,
  RegisterOwnerRequest,
  AuthResponse,
} from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  registerCustomer: (data: RegisterCustomerRequest) => Promise<void>;
  registerOwner: (data: RegisterOwnerRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // Not authenticated - this is expected for public pages
          setUser(null);
        }
      } catch (error: any) {
        // Not authenticated or session expired - this is expected when not logged in
        // Only log if it's not a 401 (unauthorized) error
        if (error.response?.status !== 401) {
          console.error("Auth initialization error:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success("Login successful");

        switch (response.data.user.role) {
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "owner":
            router.push("/dashboard/owner");
            break;
          case "customer":
            router.push("/dashboard/customer");
            break;
          default:
            router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const registerCustomer = async (data: RegisterCustomerRequest) => {
    try {
      const response = await authService.registerCustomer(data);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success("Registration successful");
        router.push("/dashboard/customer");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const registerOwner = async (data: RegisterOwnerRequest) => {
    try {
      const response = await authService.registerOwner(data);
      if (response.success) {
        toast.success(
          "Registration successful. Please wait for admin approval."
        );
        router.push("/");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/auth/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      router.push("/auth/login");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerCustomer,
        registerOwner,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
