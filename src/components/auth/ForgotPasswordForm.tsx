"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
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

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function ForgotPasswordForm({
  onSuccess,
  onCancel,
  className,
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(data);

      if (response.success) {
        onSuccess(data.email);
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to send OTP. Please try again.";
      setError(errorMessage || "Failed to send OTP. Please try again.");
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
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
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
