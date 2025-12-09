"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

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
  FieldGroup,
  FieldError,
} from "@/components/ui/field";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  businessName: z
    .string()
    .min(3, "Business name must be at least 3 characters."),
});

export default function OwnerRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const { registerOwner } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      await registerOwner({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        businessName: data.businessName,
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
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
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
            <CardTitle>Become a Owner</CardTitle>
            <CardDescription>
              Register your business. Approval required from admin.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    {...form.register("name")}
                    placeholder="Enter your name"
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field>
                  <FieldLabel>Business Name</FieldLabel>
                  <Input
                    {...form.register("businessName")}
                    placeholder="Enter your business name"
                  />
                  <FieldError errors={[form.formState.errors.businessName]} />
                </Field>

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="Enter your email"
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    {...form.register("phone")}
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                  <FieldError errors={[form.formState.errors.phone]} />
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

              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register as Owner"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-black font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
