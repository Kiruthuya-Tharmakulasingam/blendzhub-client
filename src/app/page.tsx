"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SignInModal } from "@/components/modals/SignInModal";
import { SignUpModal } from "@/components/modals/SignUpModal";
import { BecomeOwnerModal } from "@/components/modals/BecomeOwnerModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-8 sm:px-16 bg-white dark:bg-zinc-900 border-b">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
                Book Your Next <br />
                <span className="text-zinc-500">Salon Experience</span>
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg">
                Discover top-rated salons and spas near you. Book appointments seamlessly and manage your beauty routine with BlendzHub.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <SignInModal>
                  <Button size="lg" className="text-base px-8">
                    Get Started
                  </Button>
                </SignInModal>
                <BecomeOwnerModal>
                  <Button variant="outline" size="lg" className="text-base px-8">
                    For Business
                  </Button>
                </BecomeOwnerModal>
              </div>
            </div>
            <div className="relative h-[400px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-zinc-400 text-xl">
                {/* Placeholder for Hero Image */}
                Hero Image
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose BlendzHub?</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Everything you need for a perfect salon experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Easy Booking",
                  description: "Book appointments 24/7 with instant confirmation."
                },
                {
                  title: "Top Professionals",
                  description: "Connect with verified and rated beauty experts."
                },
                {
                  title: "Manage Schedule",
                  description: "Reschedule or cancel appointments with ease."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
