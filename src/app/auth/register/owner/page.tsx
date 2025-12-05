"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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

const registerOwner = async (data: any) => {
  try {
    const requestData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      businessName: data.businessName,
    };

    console.log("Sending registration data:", requestData);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const res = await fetch(`${apiUrl}/api/auth/register/owner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Response status:", res.status);

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log("Parsed response:", result);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!res.ok) {
      throw new Error(result.message || `Registration failed: ${res.status}`);
    }

    console.log("Registration successful:", result);
    return result;
  } catch (error) {
    console.error("Registration API error:", error);
    throw error;
  }
};

export default function OwnerRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("Owner Register Data:", data);

      const result = await registerOwner(data);
      console.log("Registration Result:", result);

      if (result.success) {
        setMessage(
          "Registration successful! Please wait for admin approval. You will receive an email once approved."
        );

        form.reset();

        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Become a Owner</CardTitle>
            <CardDescription>
              Register your business. Approval required from admin.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md">
                {message}
              </div>
            )}
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

              <Button type="submit" className="w-full mt-4">
                Register as Owner
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
