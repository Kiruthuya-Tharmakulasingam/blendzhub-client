"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignInModal({ 
  children, 
  redirectOnLogin = true,
  redirectTo
}: { 
  children: React.ReactNode;
  redirectOnLogin?: boolean;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
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
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : "Login failed";
      setError(errorMessage || "Login failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle className="text-2xl font-semibold tracking-tight">Login</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>

        <div>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...form.register("email")}
                  type="email"
                  placeholder="you@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  {...form.register("password")}
                  type="password"
                  placeholder="Enter your password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Hidden submit button to enable Enter key submission */}
            <button type="submit" className="hidden" />

            <button
              type="button"
              className="w-full mt-4 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
              disabled={form.formState.isSubmitting}
              onClick={(e) => {
                form.handleSubmit(onSubmit)(e);
              }}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
