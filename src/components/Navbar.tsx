"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { SignInModal } from "./modals/SignInModal";
import { SignUpModal } from "./modals/SignUpModal";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="flex w-full items-center justify-between px-8 py-4 bg-white dark:bg-black shadow-sm border-b sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-black dark:text-white">
        BlendzHub
      </Link>

      <div className="hidden sm:flex gap-4 items-center">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user?.name}</span>
            <Link href={`/dashboard/${user?.role}`}>
              <Button variant="outline" size="sm">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link href="/auth/register/owner">
              <Button variant="ghost">Become an Owner</Button>
            </Link>
            <SignUpModal>
              <Button variant="outline">Sign Up</Button>
            </SignUpModal>
            <SignInModal>
              <Button variant="default">Sign In</Button>
            </SignInModal>
          </>
        )}
      </div>

      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/${user?.role}`} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <div className="p-2 flex flex-col gap-2">
                  <Link href="/auth/register/owner" className="w-full">
                    <Button variant="ghost" className="w-full justify-start">Become an Owner</Button>
                  </Link>
                  <SignUpModal>
                    <Button variant="outline" className="w-full justify-start">Sign Up</Button>
                  </SignUpModal>
                  <SignInModal>
                    <Button variant="default" className="w-full">Sign In</Button>
                  </SignInModal>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
