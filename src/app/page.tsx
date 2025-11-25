"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <nav className="flex w-full items-center justify-between px-8 py-4 bg-white dark:bg-black shadow-md">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          BlendzHub
        </h1>
        <div className="hidden sm:flex gap-6">
          <Button variant="ghost">
            <Link href="/auth/register/owner">Become a owner</Link>
          </Button>
          <Button variant="outline">
            <Link href="/auth/register/customer">Signup</Link>
          </Button>
          <Button variant="default">
            <Link href="/auth/login">Signin</Link>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="sm:hidden">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuItem>
              <Link href="/auth/register/owner">Become a owner</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/auth/register/customer">Signup</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/auth/login">Signin</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-8 py-16 sm:items-start sm:px-16">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Public Page
          </h1>
          <p className="max-w-md text-black/70 dark:text-white/70">
            Welcome to BlendzHub! Explore our services and book appointments
            easily.
          </p>
          <Button variant="default">Get Started</Button>
        </div>
      </main>
    </div>
  );
}
