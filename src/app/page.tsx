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
import { salonService, Salon } from "@/services/salon.service";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [salons, setSalons] = React.useState<Salon[]>([]);
  const [loading, setLoading] = React.useState(true);
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
  }, [page, searchQuery, filterType, sortBy, sortOrder]);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const params: any = {
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
      }
    } catch (error) {
      console.error("Failed to fetch salons:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-8 sm:px-16 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900 border-b">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
                Book Your Next <br />
                <span className="bg-gradient-to-r from-zinc-600 to-zinc-400 dark:from-zinc-400 dark:to-zinc-200 bg-clip-text text-transparent">
                  Salon Experience
                </span>
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg">
                Discover top-rated salons and spas near you. Book appointments seamlessly and manage your beauty routine with BlendzHub.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <SignInModal>
                  <Button size="lg" className="text-base px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    Get Started
                  </Button>
                </SignInModal>
                <BecomeOwnerModal>
                  <Button variant="outline" size="lg" className="text-base px-8 border-2">
                    For Business
                  </Button>
                </BecomeOwnerModal>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                alt="Modern salon interior"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.className = "relative h-[400px] bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl";
                    target.parentElement.innerHTML = '<div class="text-zinc-400 text-xl">Salon Experience</div>';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
          </div>
        </section>


        {/* Salons Section */}
        <section className="py-20 px-8 sm:px-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Salons</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Discover top-rated salons and book your appointment</p>
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

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse h-64" />
                ))}
              </div>
            ) : salons.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {salons.map((salon) => (
                  <Link
                    key={salon._id}
                    href={`/salons/${salon._id}`}
                    className="group p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                  >
                    {salon.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
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
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {salon.name}
                      </h3>
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {salon.location}
                      </div>
                      <div className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium capitalize mb-3">
                        {salon.type}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      {salon.phone && (
                        <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                          <Phone className="h-4 w-4 mr-2" />
                          {salon.phone}
                        </div>
                      )}
                      {salon.email && (
                        <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{salon.email}</span>
                        </div>
                      )}
                      {salon.openingHours && (
                        <div className="flex items-start text-zinc-600 dark:text-zinc-400">
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
              <div className="text-center py-12 text-zinc-500">
                No salons available at the moment
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8 sm:px-16 bg-zinc-50 dark:bg-zinc-950">
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
                <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
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
