"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to their dashboard (only if not currently submitting)
  useEffect(() => {
    if (!loading && !isSubmitting && isAuthenticated && user) {
      // Determine dashboard path based on role
      let dashboardPath = "/";
      switch (user.role) {
        case "admin":
          dashboardPath = "/admin/dashboard";
          break;
        case "owner":
          dashboardPath = "/owner/dashboard";
          break;
        case "customer":
          dashboardPath = "/customer/dashboard";
          break;
        default:
          dashboardPath = "/";
      }
      router.push(dashboardPath);
    }
  }, [loading, isAuthenticated, user, router, isSubmitting]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login(data);
      // Login function in AuthContext handles redirect via router.push
      // No need to do anything here - the redirect happens in AuthContext
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : "Login failed";
      setError(errorMessage || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 relative">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url('/background-pattern.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px"
          }}
        />
        <Card className="w-full max-w-md relative z-10">
          <CardHeader className="text-center">
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
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="you@example.com"
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="Enter your password"
                  />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register/customer"
                className="text-foreground font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
