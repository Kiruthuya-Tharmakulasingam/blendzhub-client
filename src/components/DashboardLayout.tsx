"use client";

import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "owner" | "customer";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BlendzHub Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
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
