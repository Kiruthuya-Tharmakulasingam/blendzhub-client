"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SignInModal } from "@/components/modals/SignInModal";
import { useAuth } from "@/hooks/useAuth";
import { salonService } from "@/services/salon.service";
import { Salon } from "@/types/salon.types";
import { serviceService } from "@/services/service.service";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { Service } from "@/types/service.types";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  ArrowLeft,
  DollarSign,
  Scissors,
  Loader2,
  Star,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";

export default function SalonDetailPage() {
  const params = useParams();
  const { isAuthenticated, user } = useAuth();
  const salonId = params.id as string;

  const [salon, setSalon] = React.useState<Salon | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Services pagination/filtering/sorting
  const [servicesPage, setServicesPage] = React.useState(1);
  const [servicesLimit] = React.useState(9);
  const [servicesTotal, setServicesTotal] = React.useState(0);
  const [servicesTotalPages, setServicesTotalPages] = React.useState(0);
  const [servicesSearch, setServicesSearch] = React.useState("");
  const [servicesSortBy, setServicesSortBy] = React.useState("createdAt");
  const [servicesSortOrder, setServicesSortOrder] = React.useState<
    "asc" | "desc"
  >("desc");

  // Feedbacks pagination/filtering/sorting
  const [feedbacksPage, setFeedbacksPage] = React.useState(1);
  const [feedbacksLimit] = React.useState(6);
  const [feedbacksTotal, setFeedbacksTotal] = React.useState(0);
  const [feedbacksTotalPages, setFeedbacksTotalPages] = React.useState(0);
  const [feedbacksSearch, setFeedbacksSearch] = React.useState("");
  const [feedbacksFilterRating, setFeedbacksFilterRating] = React.useState("");
  const [feedbacksSortBy, setFeedbacksSortBy] = React.useState("createdAt");
  const [feedbacksSortOrder, setFeedbacksSortOrder] = React.useState<
    "asc" | "desc"
  >("desc");

  React.useEffect(() => {
    if (salonId) {
      fetchSalon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  React.useEffect(() => {
    if (salonId) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    salonId,
    servicesPage,
    servicesSearch,
    servicesSortBy,
    servicesSortOrder,
  ]);

  React.useEffect(() => {
    if (salonId) {
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    salonId,
    feedbacksPage,
    feedbacksSearch,
    feedbacksFilterRating,
    feedbacksSortBy,
    feedbacksSortOrder,
  ]);

  const fetchSalon = async () => {
    try {
      const response = await salonService.getSalonById(salonId);
      if (response.success && response.data) {
        setSalon(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch salon:", error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: {
        salonId: string;
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
      } = {
        salonId,
        page: servicesPage,
        limit: servicesLimit,
        sortBy: servicesSortBy,
        sortOrder: servicesSortOrder,
      };
      if (servicesSearch.trim()) {
        params.search = servicesSearch;
      }
      const response = await serviceService.getServices(params);
      if (response.success && response.data) {
        setServices(response.data);
        setServicesTotal(response.total || 0);
        setServicesTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params: {
        salonId: string;
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        rating?: string;
      } = {
        salonId,
        page: feedbacksPage,
        limit: feedbacksLimit,
        sortBy: feedbacksSortBy,
        sortOrder: feedbacksSortOrder,
      };
      if (feedbacksSearch.trim()) {
        params.search = feedbacksSearch;
      }
      if (feedbacksFilterRating) {
        params.rating = feedbacksFilterRating;
      }
      const response = await feedbackService.getFeedbacks(params);
      if (response.success && response.data) {
        setFeedbacks(response.data);
        setFeedbacksTotal(response.total || 0);
        setFeedbacksTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = (): string => {
    if (feedbacks.length === 0) return "0";
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  if (loading && !salon) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-primary">Salon not found</h1>
            <Link href="/">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">Go back to home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="py-12 px-8 sm:px-16 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Salons
              </Button>
            </Link>

            {salon.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={salon.imageUrl}
                  alt={salon.name}
                  className="w-full h-64 md:h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-primary">{salon.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {salon.location}
                  </div>
                  {salon.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      {salon.phone}
                    </div>
                  )}
                  {salon.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      {salon.email}
                    </div>
                  )}
                  {salon.openingHours && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      {salon.openingHours}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium capitalize">
                    {salon.type}
                  </span>
                </div>
              </div>

              {isAuthenticated && user?.role === "customer" ? (
                <Link href="/auth/login">
                  <Button size="lg" className="w-full md:w-auto text-base px-8">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </Link>
              ) : (
                <SignInModal>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full md:w-auto text-base px-8 text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </SignInModal>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-8 sm:px-16">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Services Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Services Offered</h2>
              <FilterAndSort
                searchValue={servicesSearch}
                onSearchChange={(value) => {
                  setServicesSearch(value);
                  setServicesPage(1);
                }}
                searchPlaceholder="Search services..."
                showSearch={true}
                showFilter={false}
                showSort={true}
                sortLabel="Sort by"
                sortValue={servicesSortBy}
                sortOptions={[
                  { value: "name", label: "Name" },
                  { value: "price", label: "Price" },
                  { value: "duration", label: "Duration" },
                  { value: "createdAt", label: "Date Added" },
                ]}
                onSortChange={(value) => {
                  setServicesSortBy(value);
                  setServicesPage(1);
                }}
                sortOrder={servicesSortOrder}
                onSortOrderChange={(order) => {
                  setServicesSortOrder(order);
                  setServicesPage(1);
                }}
                triggerClassName="text-primary border-primary"
                inputClassName="text-foreground border-primary placeholder:text-primary"
                iconClassName="text-primary"
              />
              {services.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {services.map((service) => (
                      <Card
                        key={service._id}
                        className="bg-gradient-to-br from-card to-surface border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        {service.imageUrl ? (
                          <div className="w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML =
                                    '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.952-1.172-5.119 0-7.072 1.172-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                            <Scissors className="h-16 w-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between text-primary">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                              <DollarSign className="h-5 w-5" />
                              {service.price}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration} min
                            </div>
                            {service.discount && service.discount > 0 && (
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {service.discount}% OFF
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {servicesTotalPages > 1 && (
                    <Pagination
                      currentPage={servicesPage}
                      totalPages={servicesTotalPages}
                      onPageChange={setServicesPage}
                      limit={servicesLimit}
                      total={servicesTotal}
                    />
                  )}
                </>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No services available
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Feedbacks/Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-primary">Customer Reviews</h2>
                  {feedbacks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {renderStars(
                          Math.round(parseFloat(calculateAverageRating())),
                          "lg"
                        )}
                      </div>
                      <span className="text-lg font-semibold text-foreground">
                        {calculateAverageRating()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({feedbacksTotal}{" "}
                        {feedbacksTotal === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <FilterAndSort
                searchValue={feedbacksSearch}
                onSearchChange={(value) => {
                  setFeedbacksSearch(value);
                  setFeedbacksPage(1);
                }}
                searchPlaceholder="Search reviews..."
                showSearch={true}
                showFilter={true}
                filterLabel="Filter by Rating"
                filterValue={feedbacksFilterRating}
                filterOptions={[
                  { value: "5", label: "5 Stars" },
                  { value: "4", label: "4 Stars" },
                  { value: "3", label: "3 Stars" },
                  { value: "2", label: "2 Stars" },
                  { value: "1", label: "1 Star" },
                ]}
                onFilterChange={(value) => {
                  setFeedbacksFilterRating(value);
                  setFeedbacksPage(1);
                }}
                showSort={true}
                sortLabel="Sort by"
                sortValue={feedbacksSortBy}
                sortOptions={[
                  { value: "rating", label: "Rating" },
                  { value: "createdAt", label: "Date" },
                ]}
                onSortChange={(value) => {
                  setFeedbacksSortBy(value);
                  setFeedbacksPage(1);
                }}
                sortOrder={feedbacksSortOrder}
                onSortOrderChange={(order) => {
                  setFeedbacksSortOrder(order);
                  setFeedbacksPage(1);
                }}
                triggerClassName="text-primary border-primary"
                inputClassName="text-foreground border-primary placeholder:text-primary"
                iconClassName="text-primary"
              />
              {feedbacks.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {feedbacks.map((feedback) => (
                      <Card
                        key={feedback._id}
                        className="bg-card border-border hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {renderStars(feedback.rating, "md")}
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {feedback.rating}/5
                                  </span>
                                </div>
                                {feedback.customerId &&
                                  typeof feedback.customerId === "object" && (
                                    <span className="text-sm font-medium text-foreground">
                                      {feedback.customerId.name}
                                    </span>
                                  )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    feedback.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {feedback.comments && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {feedback.comments}
                                </p>
                              )}
                              {feedback.reply && (
                                <div className="bg-muted p-3 rounded-md border-l-2 border-primary mt-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">
                                      Owner Response:
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {feedback.reply}
                                  </p>
                                  {feedback.repliedAt && (
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                      {new Date(
                                        feedback.repliedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {feedbacksTotalPages > 1 && (
                    <Pagination
                      currentPage={feedbacksPage}
                      totalPages={feedbacksTotalPages}
                      onPageChange={setFeedbacksPage}
                      limit={feedbacksLimit}
                      total={feedbacksTotal}
                    />
                  )}
                </>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-20 text-primary" />
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Be the first to review this salon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
