"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
  shopName: z.string().min(3, "Shop name must be at least 3 characters."),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function OwnerRegister() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Seller Register Form:", data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Become a Owner</CardTitle>
          <CardDescription>
            Register your shop. Approval required from admin.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Salon Name</FieldLabel>
                <Input
                  {...form.register("shopName")}
                  placeholder="Enter your salon name"
                />
                <FieldError errors={[form.formState.errors.shopName]} />
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
    </div>
  );
}
