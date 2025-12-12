"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import CustomerNavbar from "./CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "owner" | "customer";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isCustomer = role === "customer";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  if (isCustomer) {
    return (
      <div className="min-h-screen bg-background text-foreground home-theme flex flex-col">
        <CustomerNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground home-theme">
      <Sidebar 
        role={role} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile Header - only visible on mobile */}
        <div className="sticky top-0 z-30 bg-background border-b border-border p-4 flex items-center justify-between md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Image
              src="/noBgColor.png"
              alt="BlendzHub Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="text-lg font-bold text-foreground">BlendzHub</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Desktop Header - hidden on mobile */}
          <header className="mb-8 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/noBgColor.png"
                alt="BlendzHub Logo"
                width={60}
                height={60}
                className="h-14 w-auto"
                style={{ width: "auto", height: "auto" }}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
            </div>
          </header>
          {/* Mobile Welcome - only visible on mobile */}
          <div className="mb-6 md:hidden">
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
