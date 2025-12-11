"use client";

import Sidebar from "./Sidebar";
import CustomerNavbar from "./CustomerNavbar";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "owner" | "customer";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isCustomer = role === "customer";

  if (isCustomer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <CustomerNavbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8">
          <header className="mb-8 flex items-center justify-between">
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
          {children}
        </div>
      </main>
    </div>
  );
}
