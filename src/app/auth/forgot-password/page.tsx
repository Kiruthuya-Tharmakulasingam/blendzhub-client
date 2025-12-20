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
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />
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
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you an OTP to reset
              your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ForgotPasswordForm
              onSuccess={(email) => {
                router.push(
                  `/auth/reset-password?email=${encodeURIComponent(email)}`
                );
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
      <Footer />
    </div>
  );
}
