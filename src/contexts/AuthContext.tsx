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
  login: (credentials: LoginCredentials, shouldRedirect?: boolean) => Promise<void>;
  registerCustomer: (data: RegisterCustomerData) => Promise<void>;
  registerOwner: (data: RegisterOwnerData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
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
        // Merge customer/owner profile data into user object
        const mergedUser = { ...response.data.user };
        if (response.data.customer) {
          mergedUser.phone = response.data.customer.contact || response.data.customer.phone;
        }
        if (response.data.owner) {
          mergedUser.phone = response.data.owner.phone;
        }
        setUser(mergedUser);
        // Store user in cookie for middleware access with proper options
        // Don't clear existing cookies - just update user cookie
        const isProduction = process.env.NODE_ENV === "production";
        Cookies.set("user", JSON.stringify(mergedUser), { 
          expires: 30, // Match backend cookie expiry
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/"
        });
      } else {
        setUser(null);
        // Only clear cookies if authentication actually failed
        Cookies.remove("user");
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      // Only clear cookies on actual errors
      Cookies.remove("user");
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Store user in cookie for middleware access with proper options
    // Don't clear token cookie - just update user cookie
    const isProduction = process.env.NODE_ENV === "production";
    Cookies.set("user", JSON.stringify(updatedUser), { 
      expires: 30, // Match backend cookie expiry
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/"
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data?.user) {
          // Merge customer/owner profile data into user object
          const mergedUser = { ...response.data.user };
          if (response.data.customer) {
            mergedUser.phone = response.data.customer.contact || response.data.customer.phone;
          }
          if (response.data.owner) {
            mergedUser.phone = response.data.owner.phone;
          }
          setUser(mergedUser);
          // Store user in cookie with proper options
          const isProduction = process.env.NODE_ENV === "production";
          Cookies.set("user", JSON.stringify(mergedUser), { 
            expires: 7,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/"
          });
        } else {
          // 401 is expected when user is not authenticated - don't treat as error
          setUser(null);
          // Don't clear cookies here - they might be valid but user just not logged in
        }
      } catch (error: unknown) {
        // This should rarely happen since getCurrentUser handles 401 gracefully
        const apiError = error as ApiError;
        // Only log non-401 errors
        if (apiError.response?.status !== 401) {
          console.error("Auth initialization error:", error);
        }
        setUser(null);
        // Don't clear cookies on initialization errors - let middleware handle auth
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials, shouldRedirect: boolean = true) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        // Backend sets httpOnly cookie automatically via Set-Cookie header
        // We don't need to manually set token cookie - it's handled by the backend
        // The token is stored in httpOnly cookie which is secure and not accessible via JavaScript
        
        // Merge customer/owner profile data into user object
        const mergedUser = { ...response.data.user };
        if (response.data.customer) {
          mergedUser.phone = response.data.customer.contact || response.data.customer.phone;
        }
        if (response.data.owner) {
          mergedUser.phone = response.data.owner.phone;
        }
        
        // Set user state immediately
        setUser(mergedUser);
        
        // Store user in cookie with proper options (for middleware access)
        const isProduction = process.env.NODE_ENV === "production";
        Cookies.set("user", JSON.stringify(mergedUser), { 
          expires: 30, // Match backend cookie expiry (30 days)
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/"
        });
        
        toast.success("Login successful");

        if (shouldRedirect) {
          // Use dashboardPath from response, or determine based on role
          const redirectPath = response.dashboardPath || (() => {
            switch (response.data.user.role) {
              case "admin":
                return "/admin/dashboard";
              case "owner":
                return "/owner/dashboard";
              case "customer":
                return "/customer/dashboard";
              default:
                return "/";
            }
          })();

          // Wait a moment to ensure state is set, then redirect
          // Use router.push for client-side navigation (faster than window.location.href)
          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
        }
      } else {
        // If response is not successful or missing user data, throw error
        throw new Error(response.message || "Login failed: Invalid response");
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
        // Backend sets httpOnly cookie automatically
        // Merge customer profile data into user object
        const mergedUser = { ...response.data.user };
        if (response.data.customer) {
          mergedUser.phone = response.data.customer.contact || response.data.customer.phone;
        }
        setUser(mergedUser);
        
        const isProduction = process.env.NODE_ENV === "production";
        Cookies.set("user", JSON.stringify(mergedUser), { 
          expires: 30, // Match backend cookie expiry
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          path: "/"
        });
        toast.success("Registration successful");
        setTimeout(() => {
          router.push("/customer/dashboard");
        }, 100);
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
        updateUser,
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
