"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Scissors,
  ShoppingBag,
  Armchair,
  MessageSquare,
  Store,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "owner";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const adminLinks = [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/salons", label: "Salons", icon: Store },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: Calendar },
  ];

  const ownerLinks = [
    { href: "/dashboard/owner", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/owner/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/owner/services", label: "Services", icon: Scissors },
    { href: "/dashboard/owner/products", label: "Products", icon: ShoppingBag },
    { href: "/dashboard/owner/equipments", label: "Equipments", icon: Armchair },
    { href: "/dashboard/owner/feedbacks", label: "Feedbacks", icon: MessageSquare },
    { href: "/dashboard/owner/salon", label: "My Salon", icon: Store },
  ];

  const links = role === "admin" ? adminLinks : ownerLinks;

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-900 sticky top-0">
      <div className="p-6 border-b">
        <Link href="/" className="text-2xl font-bold">
          BlendzHub
        </Link>
        <div className="mt-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {role} Portal
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-zinc-100 dark:bg-zinc-800"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
