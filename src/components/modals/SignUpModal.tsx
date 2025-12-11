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
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useAuth } from "@/hooks/useAuth";
import {
  CustomerRegisterFormData,
  customerRegisterSchema,
} from "@/lib/validations/auth.schema";
import { useState } from "react";

export function SignUpModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { registerCustomer } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: CustomerRegisterFormData) {
    setError(null);
    try {
      await registerCustomer({
        name: data.name,
        email: data.email,
        contact: data.contact,
        password: data.password,
      });
      setOpen(false);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : "Registration failed";
      setError(errorMessage || "Registration failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] home-theme bg-card text-card-foreground border-border max-h-[90vh] overflow-y-auto">
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "url('/background-pattern.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px"
          }}
        />
        <DialogHeader className="text-center relative z-10">
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
          <DialogTitle className="text-2xl font-semibold tracking-tight">Create Account</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sign up as a customer
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10">
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input {...form.register("name")} placeholder="John Doe" />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

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
                <FieldLabel>Phone</FieldLabel>
                <Input {...form.register("contact")} placeholder="1234567890" />
                <FieldError errors={[form.formState.errors.contact]} />
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

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  {...form.register("confirmPassword")}
                  type="password"
                  placeholder="Confirm your password"
                />
                <FieldError errors={[form.formState.errors.confirmPassword]} />
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex justify-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-foreground font-semibold hover:underline"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
