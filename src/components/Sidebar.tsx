"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Scissors,
  ShoppingBag,
  Armchair,
  MessageSquare,
  Store,
  TrendingUp,
  X,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "owner" | "customer";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const adminLinks = [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/salons", label: "Salons", icon: Store },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: Calendar },
    { href: "/dashboard/admin/profile", label: "Profile", icon: Users },
  ];

  const ownerLinks = [
    { href: "/dashboard/owner", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/owner/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/owner/services", label: "Services", icon: Scissors },
    { href: "/dashboard/owner/products", label: "Products", icon: ShoppingBag },
    { href: "/dashboard/owner/equipment", label: "Equipment", icon: Armchair },
    { href: "/dashboard/owner/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/dashboard/owner/feedbacks", label: "Feedbacks", icon: MessageSquare },
    { href: "/dashboard/owner/salon", label: "My Salon", icon: Store },
    { href: "/dashboard/owner/profile", label: "Profile", icon: Users },
  ];

  const customerLinks = [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/salons", label: "Browse Salons", icon: Store },
    { href: "/dashboard/customer/appointments", label: "My Appointments", icon: Calendar },
    { href: "/dashboard/customer/feedback", label: "My Feedback", icon: MessageSquare },
    { href: "/dashboard/customer/profile", label: "Profile", icon: Users },
  ];

  // Use role prop first, fallback to user.role from auth context for robustness
  const effectiveRole = role || user?.role || "customer";
  const links = effectiveRole === "admin" ? adminLinks : effectiveRole === "owner" ? ownerLinks : customerLinks;

  const handleLinkClick = () => {
    // Close sidebar on mobile when clicking a link
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 flex-col border-r border-border bg-sidebar z-50 transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Always flex on desktop
          "md:flex"
        )}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <Image
              src="/noBgColor.png"
              alt="BlendzHub Logo"
              width={50}
              height={50}
              className="h-12 w-auto"
              style={{ width: "auto", height: "auto" }}
            />
            <span className="text-2xl font-bold text-sidebar-foreground">BlendzHub</span>
          </Link>
          {/* Close button - mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-1 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {role} Portal
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href} onClick={handleLinkClick}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
