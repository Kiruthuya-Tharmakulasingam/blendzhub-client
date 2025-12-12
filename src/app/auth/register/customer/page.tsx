"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Enter a valid email"),
  contact: z.string().min(8, "Phone number must be valid."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function CustomerRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { registerCustomer } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      await registerCustomer({
        name: data.name,
        email: data.email,
        password: data.password,
        contact: data.contact,
      });
      form.reset();
    } catch (err: unknown) {
      console.error("Registration error:", err);
      // Error is already handled by AuthContext with toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />
      <main className="flex-1 flex relative">
        {/* Left Panel - Decorative Section */}
        <div 
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.2 0.03 85) 0%, oklch(0.145 0 0) 50%, oklch(0.25 0.04 85) 100%)"
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            {/* Animated gradient orbs */}
            <div 
              className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse"
              style={{ background: "oklch(0.85 0.15 85)" }}
            />
            <div 
              className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
              style={{ background: "oklch(0.75 0.12 85)", animationDelay: "1s" }}
            />
            <div 
              className="absolute top-2/3 left-1/3 w-48 h-48 rounded-full opacity-10 blur-2xl animate-pulse"
              style={{ background: "oklch(0.9 0.18 85)", animationDelay: "2s" }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-center">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/noBgColor.png"
                alt="BlendzHub Logo"
                width={140}
                height={140}
                className="h-36 w-auto opacity-90"
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            {/* Welcome Text */}
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: "oklch(0.85 0.15 85)" }}
            >
              Welcome to BlendzHub
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-md leading-relaxed">
              Join thousands of customers who discover and book appointments at the best salons near them.
            </p>

            {/* Feature Pills */}
            <div className="space-y-3">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                style={{ 
                  background: "oklch(0.85 0.15 85 / 0.15)",
                  border: "1px solid oklch(0.85 0.15 85 / 0.3)"
                }}
              >
                <svg className="w-4 h-4" style={{ color: "oklch(0.85 0.15 85)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/90">Easy booking in seconds</span>
              </div>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                style={{ 
                  background: "oklch(0.85 0.15 85 / 0.15)",
                  border: "1px solid oklch(0.85 0.15 85 / 0.3)"
                }}
              >
                <svg className="w-4 h-4" style={{ color: "oklch(0.85 0.15 85)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/90">Discover top-rated salons</span>
              </div>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                style={{ 
                  background: "oklch(0.85 0.15 85 / 0.15)",
                  border: "1px solid oklch(0.85 0.15 85 / 0.3)"
                }}
              >
                <svg className="w-4 h-4" style={{ color: "oklch(0.85 0.15 85)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/90">Manage appointments easily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
          {/* Background pattern for consistency */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "url('/background-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundSize: "200px 200px"
            }}
          />

          {/* Form Container with Glassmorphism */}
          <div 
            className="w-full max-w-md relative z-10 p-8 rounded-3xl"
            style={{
              background: "oklch(0.2 0 0 / 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.85 0.15 85 / 0.2)",
              boxShadow: "0 8px 32px oklch(0 0 0 / 0.3)"
            }}
          >
            {/* Mobile Logo - Only visible on smaller screens */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Image
                src="/noBgColor.png"
                alt="BlendzHub Logo"
                width={80}
                height={80}
                className="h-20 w-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: "oklch(0.85 0.15 85)" }}
              >
                Create Your Account
              </h2>
              <p className="text-muted-foreground text-sm">
                Start your beauty journey with us
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input 
                    {...form.register("name")} 
                    placeholder="John Doe"
                    className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-[oklch(0.85_0.15_85)] transition-all duration-300"
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-[oklch(0.85_0.15_85)] transition-all duration-300"
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input 
                    {...form.register("contact")} 
                    placeholder="+1 234 567 890"
                    className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-[oklch(0.85_0.15_85)] transition-all duration-300"
                  />
                  <FieldError errors={[form.formState.errors.contact]} />
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="Create a secure password"
                    className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-[oklch(0.85_0.15_85)] transition-all duration-300"
                  />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>
              </FieldGroup>

              <Button 
                type="submit" 
                className="w-full mt-6 h-12 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.85 0.15 85) 0%, oklch(0.75 0.12 85) 100%)",
                  color: "oklch(0.145 0 0)"
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Get Started"
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: "oklch(0.85 0.15 85)" }}
                >
                  Sign In
                </Link>
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <p className="text-sm text-muted-foreground">
                Want to list your salon?{" "}
                <Link
                  href="/auth/register/owner"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: "oklch(0.85 0.15 85)" }}
                >
                  Register as Owner
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
