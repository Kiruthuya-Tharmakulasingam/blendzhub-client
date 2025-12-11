"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Calendar, Store, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard/customer", label: "Overview", icon: Home },
    { href: "/dashboard/customer/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/customer/salons", label: "Services", icon: Store },
    { href: "/dashboard/customer/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="flex w-full items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative overflow-hidden rounded-full transition-transform group-hover:scale-105">
          <Image
            src="/noBgColor.png"
            alt="BlendzHub Logo"
            width={50}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
          BlendzHub
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-border/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full px-4 transition-all duration-200",
                    isActive 
                      ? "bg-background shadow-sm text-primary font-medium" 
                      : "hover:bg-background/50 hover:text-foreground text-muted-foreground"
                  )}
                >
                  <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="flex flex-col items-end hidden lg:flex">
            <span className="text-sm font-medium leading-none">{user?.name}</span>
            <span className="text-xs text-muted-foreground">Customer</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => logout()}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="px-2 py-1.5 mb-2 border-b border-border">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Customer Dashboard</p>
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link 
                    href={link.href} 
                    className={cn(
                      "flex items-center w-full cursor-pointer rounded-md my-1",
                      isActive && "bg-secondary text-primary font-medium"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <div className="h-px bg-border my-2" />
            <DropdownMenuItem 
              onClick={() => logout()} 
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
