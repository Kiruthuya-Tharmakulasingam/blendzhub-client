"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

// Client component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email");

  return (
    <main className="flex-1 flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/background-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
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
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email and create a new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResetPasswordForm
            email={emailFromQuery || ""}
            onSuccess={() => {
              setTimeout(() => {
                router.push("/auth/login");
              }, 2000);
            }}
          />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-foreground font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}

// Loading fallback component
function ResetPasswordFormLoading() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/background-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-4"></div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

// Main page component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />
      <Suspense fallback={<ResetPasswordFormLoading />}>
        <ResetPasswordContent />
      </Suspense>
      <Footer />
    </div>
  );
}
