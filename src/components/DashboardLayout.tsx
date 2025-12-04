"use client";

import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "owner" | "customer";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-zinc-500">Welcome back, {user?.name}</p>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
