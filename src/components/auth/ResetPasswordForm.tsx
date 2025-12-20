"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ResetPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ResetPasswordForm({
  email,
  onSuccess,
  onCancel,
  className,
}: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.resetPassword(data);

      if (response.success) {
        setSuccessMessage(response.message || "Password reset successfully!");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(
          response.message || "Failed to reset password. Please try again."
        );
      }
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to reset password. Please try again.";
      setError(errorMessage || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-100 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    disabled={true}
                    value={email} // Force the email from props
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </Button>

          {onCancel && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-foreground hover:underline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
