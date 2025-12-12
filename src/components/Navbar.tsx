"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, LogOut, LayoutDashboard, X, User, Calendar } from "lucide-react";
import { SignInModal } from "./modals/SignInModal";
import { SignUpModal } from "./modals/SignUpModal";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="flex w-full items-center justify-between px-8 py-4 bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <Link href={isAuthenticated && user?.role === "customer" ? "/dashboard/customer" : "/"} className="flex items-center gap-2 z-50">
        <Image
          src="/noBgColor.png"
          alt="BlendzHub Logo"
          width={60}
          height={60}
          className="h-14 w-auto"
          style={{ width: "auto", height: "auto" }}
          priority
        />
        <span className="text-2xl font-bold text-foreground">BlendzHub</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-4 items-center">
        <Link href={isAuthenticated && user?.role === "customer" ? "/dashboard/customer" : "/"}>
          <Button variant="ghost" className="text-primary">Home</Button>
        </Link>
        <Link href="/about">
          <Button variant="ghost" className="text-primary">About Us</Button>
        </Link>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Welcome, {user?.name}</span>
            {user?.role === "customer" ? (
              <>
                <Link href="/dashboard/customer/appointments">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Appointments
                  </Button>
                </Link>
                <Link href="/dashboard/customer/profile">
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={`/dashboard/${user?.role}`}>
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link href="/auth/register/owner">
              <Button variant="ghost" className="text-primary">Become an Owner</Button>
            </Link>
            <SignUpModal>
              <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">Sign Up</Button>
            </SignUpModal>
            <SignInModal>
              <Button variant="default">Sign In</Button>
            </SignInModal>
          </>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          className="text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex flex-col gap-2 pb-4 border-b border-border">
                <span className="text-lg font-semibold">Welcome, {user?.name}</span>
                <span className="text-sm text-muted-foreground capitalize">{user?.role}</span>
              </div>
              
              {user?.role === "customer" ? (
                <>
                  <Link href="/dashboard/customer" onClick={closeMenu}>
                    <Button variant="outline" className="w-full justify-start h-12 text-base">
                      <LayoutDashboard className="mr-3 h-5 w-5" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/dashboard/customer/appointments" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base text-primary">
                      <Calendar className="mr-3 h-5 w-5" />
                      My Appointments
                    </Button>
                  </Link>
                  <Link href="/dashboard/customer/profile" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base text-primary">
                      <User className="mr-3 h-5 w-5" />
                      My Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/dashboard/${user?.role}`} onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start h-12 text-base">
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="w-full justify-start h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/about" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base text-foreground">
                  About Us
                </Button>
              </Link>
              <Link href="/auth/register/owner" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start h-12 text-base text-primary">
                  Become an Owner
                </Button>
              </Link>
              
              <div onClick={closeMenu}>
                <SignUpModal>
                  <Button variant="outline" className="w-full justify-start h-12 text-base text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                    Sign Up
                  </Button>
                </SignUpModal>
              </div>
              
              <div onClick={closeMenu}>
                <SignInModal>
                  <Button variant="default" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </SignInModal>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
