"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SignInModal } from "@/components/modals/SignInModal";
import { BecomeOwnerModal } from "@/components/modals/BecomeOwnerModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { salonService } from "@/services/salon.service";
import { Salon } from "@/types/salon.types";
import { MapPin, Phone, Mail, Clock, Calendar, RefreshCw } from "lucide-react";
import { AxiosError } from "axios";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";
import { HeroSection } from "@/components/ui/hero-section";
import { AlertBanner } from "@/components/ui/alert-banner";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [salons, setSalons] = React.useState<Salon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(9);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, router]);

  React.useEffect(() => {
    fetchSalons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, filterType, sortBy, sortOrder]);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        type?: string;
      } = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      if (filterType) {
        params.type = filterType;
      }
      const response = await salonService.getSalons(params);
      if (response.success && response.data) {
        setSalons(response.data);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
        setError(null);
      } else {
        setError(response.message || "Failed to load salons. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Failed to fetch salons:", error);
      // Provide user-friendly error messages
      if (error instanceof AxiosError) {
        // Network error or timeout
        if (!error.response) {
          if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
            setError("Request took too long. Please check your internet connection and try again.");
          } else {
            setError("Network error. Please check your internet connection and try again.");
          }
        } else {
          // Server responded with error
          const status = error.response.status;
          if (status >= 500) {
            setError("Server error. Please try again later.");
          } else if (status === 404) {
            setError("Service unavailable. Please try again later.");
          } else {
            const errorMessage = (error.response.data as { message?: string })?.message;
            setError(errorMessage || "Failed to load salons. Please try again.");
          }
        }
      } else {
        setError("Failed to load salons. Please try again.");
      }
      // Clear salons on error
      setSalons([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          title={
            <>
              Book Your Next <br />
              <span className="bg-gradient-to-r from-muted-foreground/80 to-muted-foreground/60 bg-clip-text text-transparent">
                Salon Experience
              </span>
            </>
          }
          description="Discover top-rated salons and spas near you. Book appointments seamlessly and manage your beauty routine with BlendzHub."
          actions={
            <>
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
            </>
          }
          image={{
            src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
            alt: "Modern salon interior",
          }}
          background="gradient"
        />


        {/* Salons Section */}
        <section className="py-20 px-8 sm:px-16 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Salons</h2>
              <p className="text-muted-foreground">Discover top-rated salons and book your appointment</p>
            </div>

            <FilterAndSort
              searchValue={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setPage(1);
              }}
              searchPlaceholder="Search salons by name, location, or type..."
              showSearch={true}
              showFilter={true}
              filterLabel="Filter by Type"
              filterValue={filterType}
              filterOptions={[
                { value: "men", label: "Men" },
                { value: "women", label: "Women" },
                { value: "unisex", label: "Unisex" },
              ]}
              onFilterChange={(value) => {
                setFilterType(value);
                setPage(1);
              }}
              showSort={true}
              sortLabel="Sort by"
              sortValue={sortBy}
              sortOptions={[
                { value: "name", label: "Name" },
                { value: "location", label: "Location" },
                { value: "type", label: "Type" },
                { value: "createdAt", label: "Date Added" },
              ]}
              onSortChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              sortOrder={sortOrder}
              onSortOrderChange={(order) => {
                setSortOrder(order);
                setPage(1);
              }}
            />

            {error ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertBanner
                  variant="error"
                  title="Unable to Load Salons"
                  description={error}
                  className="max-w-md w-full"
                >
                  <Button
                    onClick={() => fetchSalons()}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </AlertBanner>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-6 bg-muted rounded-xl animate-pulse h-64" />
                ))}
              </div>
            ) : salons.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {salons.map((salon) => (
                  <Link
                    key={salon._id}
                    href={`/salons/${salon._id}`}
                    className="group p-6 bg-gradient-to-br from-card to-surface rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                  >
                    {salon.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={salon.imageUrl}
                          alt={salon.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-foreground/80 transition-colors">
                        {salon.name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {salon.location}
                      </div>
                      <div className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium capitalize mb-3">
                        {salon.type}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      {salon.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {salon.phone}
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{salon.email}</span>
                        </div>
                      )}
                      {salon.openingHours && (
                        <div className="flex items-start text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 mt-0.5" />
                          <span className="text-xs">{salon.openingHours}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                      {isAuthenticated && user?.role === "customer" ? (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push('/dashboard/customer/salons');
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Now
                        </Button>
                      ) : (
                        <SignInModal>
                          <Button className="w-full" size="lg" variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Sign in to Book
                          </Button>
                        </SignInModal>
                      )}
                    </div>
                  </Link>
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  limit={limit}
                  total={total}
                />
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No salons available at the moment
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 sm:px-16 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose BlendzHub?</h2>
              <p className="text-muted-foreground">Everything you need for a perfect salon experience</p>
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
                <div key={i} className="p-8 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
