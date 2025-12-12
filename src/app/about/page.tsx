"use client";

import * as React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HeroSection } from "@/components/ui/hero-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Users, Star, Shield, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          title={
            <>
              Redefining Your <br />
              <span className="text-primary">Beauty Experience</span>
            </>
          }
          description="BlendzHub is more than just a booking platform. We are a community dedicated to connecting you with the best beauty and wellness professionals."
          background="gradient"
          image={{
            src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop",
            alt: "Team of beauty professionals",
          }}
        />

        {/* Mission & Vision Section */}
        <section className="py-20 px-8 sm:px-16 bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                To empower beauty professionals and simplify the booking experience for clients. We strive to create a seamless ecosystem where talent meets convenience, ensuring every appointment is a step towards confidence and well-being.
              </p>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To be the world&apos;s most trusted and innovative platform for salon and spa services, setting new standards for quality, accessibility, and customer satisfaction in the beauty industry.
              </p>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
                alt="Salon interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-8 sm:px-16 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-primary">Our Core Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These principles guide every decision we make and every interaction we have.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="h-8 w-8 text-primary" />,
                  title: "Trust & Safety",
                  description: "We verify every salon and professional to ensure a safe and reliable experience for our users.",
                },
                {
                  icon: <Heart className="h-8 w-8 text-primary" />,
                  title: "Customer First",
                  description: "Your satisfaction is our top priority. We are dedicated to providing exceptional support and service.",
                },
                {
                  icon: <Zap className="h-8 w-8 text-primary" />,
                  title: "Innovation",
                  description: "We continuously improve our platform with the latest technology to make your life easier.",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="p-8 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-8 sm:px-16 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-primary">What We Offer</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive solutions for both customers and business owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-8 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  For Customers
                </h3>
                <ul className="space-y-4">
                  {[
                    "Instant 24/7 online booking",
                    "Verified reviews and ratings",
                    "Easy rescheduling and cancellations",
                    "Exclusive deals and offers",
                    "Secure payment options",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/#salons">
                    <Button size="lg" className="w-full sm:w-auto">
                      Find a Salon
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <Star className="h-6 w-6 text-primary" />
                  For Business Owners
                </h3>
                <ul className="space-y-4">
                  {[
                    "Complete appointment management system",
                    "Staff and schedule management",
                    "Business analytics and insights",
                    "Marketing and promotion tools",
                    "Secure payment processing",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/auth/register/owner">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-primary border-primary hover:bg-primary hover:text-primary-foreground">
                      Partner With Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8 sm:px-16 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Ready to Experience the Best?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of satisfied users who trust BlendzHub for their beauty and wellness needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="px-8 text-lg h-12">
                  Book an Appointment
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="px-8 text-lg h-12">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
