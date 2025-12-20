"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { LoginFormData, loginSchema } from "@/lib/validations/auth.schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface SignInModalProps {
  children: React.ReactNode;
  redirectOnLogin?: boolean;
  redirectTo?: string;
}

export function SignInModal({
  children,
  redirectOnLogin = true,
  redirectTo,
}: SignInModalProps) {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // State to manage which form to show
  const [currentView, setCurrentView] = useState<
    "login" | "forgotPassword" | "resetPassword"
  >("login");
  const [emailForReset, setEmailForReset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Login Form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onLoginSubmit(data: LoginFormData) {
    setError(null);
    setIsLoading(true);
    try {
      // If we have a specific redirect path, don't let auth context redirect automatically
      const shouldContextRedirect = redirectTo ? false : redirectOnLogin;

      await login(data, shouldContextRedirect);

      setOpen(false);

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Login failed";
      setError(errorMessage || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset form when switching views
  const switchToLogin = () => {
    setCurrentView("login");
    setError(null);
  };

  const switchToForgotPassword = () => {
    setCurrentView("forgotPassword");
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        // Reset form when closing
        if (!isOpen) {
          setCurrentView("login");
          setError(null);
          loginForm.reset();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] home-theme bg-card text-card-foreground border-border z-[100]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/noBgColor.png"
              alt="BlendzHub Logo"
              width={90}
              height={90}
              className="h-24 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {currentView === "login" && "Login"}
            {currentView === "forgotPassword" && "Forgot Password"}
            {currentView === "resetPassword" && "Reset Password"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {currentView === "login" &&
              "Enter your credentials to access your account"}
            {currentView === "forgotPassword" &&
              "Enter your email address and we'll send you an OTP to reset your password"}
            {currentView === "resetPassword" &&
              "Enter the OTP sent to your email and create a new password"}
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* Login Form */}
          {currentView === "login" && (
            <>
              {error && (
                <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loginForm.handleSubmit(onLoginSubmit)(e);
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...loginForm.register("email")}
                      type="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      {...loginForm.register("password")}
                      type="password"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Hidden submit button to enable Enter key submission */}
                <button type="submit" className="hidden" />

                <Button
                  type="button"
                  className="w-full mt-4"
                  disabled={isLoading}
                  onClick={(e) => {
                    loginForm.handleSubmit(onLoginSubmit)(e);
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-foreground hover:underline"
                    onClick={switchToForgotPassword}
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
              <div className="flex justify-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register/customer"
                    className="text-foreground font-semibold hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Forgot Password Form */}
          {currentView === "forgotPassword" && (
            <ForgotPasswordForm
              onSuccess={(email) => {
                setEmailForReset(email);
                setCurrentView("resetPassword");
              }}
              onCancel={switchToLogin}
            />
          )}

          {/* Reset Password Form */}
          {currentView === "resetPassword" && (
            <ResetPasswordForm
              email={emailForReset}
              onSuccess={() => {
                setTimeout(() => {
                  setOpen(false);
                  switchToLogin();
                }, 2000);
              }}
              onCancel={switchToLogin}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
