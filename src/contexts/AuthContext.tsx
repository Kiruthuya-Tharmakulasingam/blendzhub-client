"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { User } from "@/types/user";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginCredentials, RegisterCustomerData, RegisterOwnerData } from "@/types/user";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerCustomer: (data: RegisterCustomerData) => Promise<void>;
  registerOwner: (data: RegisterOwnerData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        // Store user in cookie for middleware access
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
        } else {
          // 401 is expected when user is not authenticated - don't treat as error
          setUser(null);
        }
      } catch (error: unknown) {
        // This should rarely happen since getCurrentUser handles 401 gracefully
        const apiError = error as ApiError;
        // Only log non-401 errors
        if (apiError.response?.status !== 401) {
          console.error("Auth initialization error:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        // Store token in cookie if provided
        if (response.token) {
          Cookies.set("token", response.token, { expires: 7 });
        }
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
        toast.success("Login successful");

        // Redirect based on role
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
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Login error:", error);
      toast.error(apiError.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const registerCustomer = async (data: RegisterCustomerData) => {
    try {
      const response = await authService.registerCustomer(data);
      if (response.success && response.data?.user) {
        if (response.token) {
          Cookies.set("token", response.token, { expires: 7 });
        }
        setUser(response.data.user);
        Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });
        toast.success("Registration successful");
        router.push("/dashboard/customer");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Registration error:", error);
      toast.error(apiError.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const registerOwner = async (data: RegisterOwnerData) => {
    try {
      const response = await authService.registerOwner(data);
      if (response.success) {
        toast.success("Registration successful. Please wait for admin approval.");
        router.push("/");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("Registration error:", error);
      toast.error(apiError.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    try {
      authService.logout();
    } catch {
      // Ignore errors
    } finally {
      Cookies.remove("token");
      Cookies.remove("user");
      setUser(null);
      router.push("/auth/login");
      toast.success("Logged out successfully");
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
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
