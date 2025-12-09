"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Phone number must be valid."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function CustomerRegister() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Customer Signup:", data);
  };

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
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up as a customer</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input {...form.register("fullName")} placeholder="John Doe" />
                  <FieldError errors={[form.formState.errors.fullName]} />
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
                  <Input {...form.register("phone")} placeholder="+1234567890" />
                  <FieldError errors={[form.formState.errors.phone]} />
                </Field>

                <Field>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    {...form.register("address")}
                    placeholder="123 Main St, City, Country"
                  />
                  <FieldError errors={[form.formState.errors.address]} />
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
                Sign Up
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
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
