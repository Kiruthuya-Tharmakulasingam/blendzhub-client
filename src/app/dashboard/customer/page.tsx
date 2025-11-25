"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-2xl p-10 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Customer Dashboard
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Welcome to your dashboard!
        </p>

        <div className="mt-8">
          <Link href="/auth/login">
            <Button className="w-full py-3 text-lg font-semibold bg-black text-white hover:bg-black/90">
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
