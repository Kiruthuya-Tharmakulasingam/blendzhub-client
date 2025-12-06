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
import { productService } from "@/services/product.service";
import { equipmentService } from "@/services/equipment.service";
import { feedbackService, Feedback } from "@/services/feedback.service";
import { Service } from "@/types/service.types";
import { Product, Equipment } from "@/types/owner.types";
import { MapPin, Phone, Mail, Clock, Calendar, ArrowLeft, DollarSign, Package, Wrench, Scissors, Loader2, Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterAndSort } from "@/components/FilterAndSort";
import { Pagination } from "@/components/Pagination";

export default function SalonDetailPage() {
  const params = useParams();
  const { isAuthenticated, user } = useAuth();
  const salonId = params.id as string;

  const [salon, setSalon] = React.useState<Salon | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Services pagination/filtering/sorting
  const [servicesPage, setServicesPage] = React.useState(1);
  const [servicesLimit] = React.useState(9);
  const [servicesTotal, setServicesTotal] = React.useState(0);
  const [servicesTotalPages, setServicesTotalPages] = React.useState(0);
  const [servicesSearch, setServicesSearch] = React.useState("");
  const [servicesSortBy, setServicesSortBy] = React.useState("createdAt");
  const [servicesSortOrder, setServicesSortOrder] = React.useState<"asc" | "desc">("desc");

  // Products pagination/filtering/sorting
  const [productsPage, setProductsPage] = React.useState(1);
  const [productsLimit] = React.useState(9);
  const [productsTotal, setProductsTotal] = React.useState(0);
  const [productsTotalPages, setProductsTotalPages] = React.useState(0);
  const [productsSearch, setProductsSearch] = React.useState("");
  const [productsFilterStatus, setProductsFilterStatus] = React.useState("");
  const [productsSortBy, setProductsSortBy] = React.useState("createdAt");
  const [productsSortOrder, setProductsSortOrder] = React.useState<"asc" | "desc">("desc");

  // Equipment pagination/filtering/sorting
  const [equipmentPage, setEquipmentPage] = React.useState(1);
  const [equipmentLimit] = React.useState(9);
  const [equipmentTotal, setEquipmentTotal] = React.useState(0);
  const [equipmentTotalPages, setEquipmentTotalPages] = React.useState(0);
  const [equipmentSearch, setEquipmentSearch] = React.useState("");
  const [equipmentFilterStatus, setEquipmentFilterStatus] = React.useState("");
  const [equipmentSortBy, setEquipmentSortBy] = React.useState("createdAt");
  const [equipmentSortOrder, setEquipmentSortOrder] = React.useState<"asc" | "desc">("desc");

  // Feedbacks pagination/filtering/sorting
  const [feedbacksPage, setFeedbacksPage] = React.useState(1);
  const [feedbacksLimit] = React.useState(6);
  const [feedbacksTotal, setFeedbacksTotal] = React.useState(0);
  const [feedbacksTotalPages, setFeedbacksTotalPages] = React.useState(0);
  const [feedbacksSearch, setFeedbacksSearch] = React.useState("");
  const [feedbacksFilterRating, setFeedbacksFilterRating] = React.useState("");
  const [feedbacksSortBy, setFeedbacksSortBy] = React.useState("createdAt");
  const [feedbacksSortOrder, setFeedbacksSortOrder] = React.useState<"asc" | "desc">("desc");

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
  }, [salonId, servicesPage, servicesSearch, servicesSortBy, servicesSortOrder]);

  React.useEffect(() => {
    if (salonId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, productsPage, productsSearch, productsFilterStatus, productsSortBy, productsSortOrder]);

  React.useEffect(() => {
    if (salonId) {
      fetchEquipment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, equipmentPage, equipmentSearch, equipmentFilterStatus, equipmentSortBy, equipmentSortOrder]);

  React.useEffect(() => {
    if (salonId) {
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, feedbacksPage, feedbacksSearch, feedbacksFilterRating, feedbacksSortBy, feedbacksSortOrder]);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: {
        salonId: string;
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        status?: string;
      } = {
        salonId,
        page: productsPage,
        limit: productsLimit,
        sortBy: productsSortBy,
        sortOrder: productsSortOrder,
      };
      if (productsSearch.trim()) {
        params.search = productsSearch;
      }
      if (productsFilterStatus) {
        params.status = productsFilterStatus;
      }
      const response = await productService.getProducts(params);
      if (response.success && response.data) {
        setProducts(response.data);
        setProductsTotal(response.total || 0);
        setProductsTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params: {
        salonId: string;
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
        search?: string;
        status?: string;
      } = {
        salonId,
        page: equipmentPage,
        limit: equipmentLimit,
        sortBy: equipmentSortBy,
        sortOrder: equipmentSortOrder,
      };
      if (equipmentSearch.trim()) {
        params.search = equipmentSearch;
      }
      if (equipmentFilterStatus) {
        params.status = equipmentFilterStatus;
      }
      const response = await equipmentService.getEquipment(params);
      if (response.success && response.data) {
        setEquipment(response.data);
        setEquipmentTotal(response.total || 0);
        setEquipmentTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
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
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
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
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Salon not found</h1>
            <Link href="/">
              <Button variant="outline">Go back to home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="py-12 px-8 sm:px-16 bg-white dark:bg-zinc-950 border-b">
          <div className="max-w-7xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Salons
              </Button>
            </Link>

            {salon.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
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
                <h1 className="text-4xl font-bold mb-4">{salon.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-zinc-600 dark:text-zinc-400">
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
                  <span className="inline-block px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium capitalize">
                    {salon.type}
                  </span>
                </div>
              </div>

              {isAuthenticated && user?.role === "customer" ? (
                <Link href="/dashboard/customer/salons">
                  <Button size="lg" className="w-full md:w-auto">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              ) : (
                <SignInModal>
                  <Button size="lg" variant="outline" className="w-full md:w-auto">
                    <Calendar className="mr-2 h-4 w-4" />
                    Sign in to Book
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
              <h2 className="text-3xl font-bold mb-6">Services Offered</h2>
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
              />
              {services.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {services.map((service) => (
                      <Card key={service._id} className="hover:shadow-lg transition-shadow">
                        {service.imageUrl ? (
                          <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800">
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
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.952-1.172-5.119 0-7.072 1.172-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Scissors className="h-16 w-16 text-zinc-400" />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400">
                              <DollarSign className="h-5 w-5" />
                              {service.price}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {service.description && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration} min
                            </div>
                            {service.discount && service.discount > 0 && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
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
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No services available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Products Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Products Available</h2>
              <FilterAndSort
                searchValue={productsSearch}
                onSearchChange={(value) => {
                  setProductsSearch(value);
                  setProductsPage(1);
                }}
                searchPlaceholder="Search products..."
                showSearch={true}
                showFilter={true}
                filterLabel="Filter by Status"
                filterValue={productsFilterStatus}
                filterOptions={[
                  { value: "active", label: "Active" },
                  { value: "out-of-stock", label: "Out of Stock" },
                  { value: "discontinued", label: "Discontinued" },
                ]}
                onFilterChange={(value) => {
                  setProductsFilterStatus(value);
                  setProductsPage(1);
                }}
                showSort={true}
                sortLabel="Sort by"
                sortValue={productsSortBy}
                sortOptions={[
                  { value: "name", label: "Name" },
                  { value: "price", label: "Price" },
                  { value: "supplier", label: "Supplier" },
                  { value: "status", label: "Status" },
                  { value: "createdAt", label: "Date Added" },
                ]}
                onSortChange={(value) => {
                  setProductsSortBy(value);
                  setProductsPage(1);
                }}
                sortOrder={productsSortOrder}
                onSortOrderChange={(order) => {
                  setProductsSortOrder(order);
                  setProductsPage(1);
                }}
              />
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {products.map((product) => (
                    <Card key={product._id} className="hover:shadow-lg transition-shadow">
                      {product.imageUrl ? (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Package className="h-16 w-16 text-zinc-400" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span>{product.name}</span>
                          <div className="flex items-center gap-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                            <DollarSign className="h-5 w-5" />
                            Rs. {product.price}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {product.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                            {product.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          {product.category && (
                            <div className="text-sm">
                              <span className="font-medium">Category: </span>
                              <span className="text-zinc-600 dark:text-zinc-400">{product.category}</span>
                            </div>
                          )}
                          {product.supplier && (
                            <div className="text-sm">
                              <span className="font-medium">Supplier: </span>
                              <span className="text-zinc-600 dark:text-zinc-400">{product.supplier}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
                              <Package className="h-4 w-4" />
                              <span>Stock: {product.stock}</span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                product.status === "active"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : product.status === "out-of-stock"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                  : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {product.status === "active"
                                ? "Available"
                                : product.status === "out-of-stock"
                                ? "Out of Stock"
                                : "Discontinued"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                  {productsTotalPages > 1 && (
                    <Pagination
                      currentPage={productsPage}
                      totalPages={productsTotalPages}
                      onPageChange={setProductsPage}
                      limit={productsLimit}
                      total={productsTotal}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No products available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Equipment Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Equipment Used</h2>
              <FilterAndSort
                searchValue={equipmentSearch}
                onSearchChange={(value) => {
                  setEquipmentSearch(value);
                  setEquipmentPage(1);
                }}
                searchPlaceholder="Search equipment..."
                showSearch={true}
                showFilter={true}
                filterLabel="Filter by Status"
                filterValue={equipmentFilterStatus}
                filterOptions={[
                  { value: "available", label: "Available" },
                  { value: "in-use", label: "In Use" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "unavailable", label: "Unavailable" },
                ]}
                onFilterChange={(value) => {
                  setEquipmentFilterStatus(value);
                  setEquipmentPage(1);
                }}
                showSort={true}
                sortLabel="Sort by"
                sortValue={equipmentSortBy}
                sortOptions={[
                  { value: "name", label: "Name" },
                  { value: "status", label: "Status" },
                  { value: "lastSterlizedDate", label: "Last Sterilized" },
                  { value: "createdAt", label: "Date Added" },
                ]}
                onSortChange={(value) => {
                  setEquipmentSortBy(value);
                  setEquipmentPage(1);
                }}
                sortOrder={equipmentSortOrder}
                onSortOrderChange={(order) => {
                  setEquipmentSortOrder(order);
                  setEquipmentPage(1);
                }}
              />
              {equipment.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {equipment.map((item) => (
                    <Card key={item._id} className="hover:shadow-lg transition-shadow">
                      {item.imageUrl ? (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Wrench className="h-16 w-16 text-zinc-400" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          {!item.imageUrl && (
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                              <Wrench className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                          )}
                          {item.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {item.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500 dark:text-zinc-500">Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "available"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : item.status === "in-use"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : item.status === "maintenance"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        {item.lastSterlizedDate && (
                          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                            Last sterilized: {new Date(item.lastSterlizedDate).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                  {equipmentTotalPages > 1 && (
                    <Pagination
                      currentPage={equipmentPage}
                      totalPages={equipmentTotalPages}
                      onPageChange={setEquipmentPage}
                      limit={equipmentLimit}
                      total={equipmentTotal}
                    />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No equipment listed</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Feedbacks/Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Customer Reviews</h2>
                  {feedbacks.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {renderStars(Math.round(parseFloat(calculateAverageRating())), "lg")}
                      </div>
                      <span className="text-lg font-semibold">{calculateAverageRating()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({feedbacksTotal} {feedbacksTotal === 1 ? 'review' : 'reviews'})
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
              />
              {feedbacks.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {feedbacks.map((feedback) => (
                      <Card key={feedback._id} className="hover:shadow-md transition-shadow">
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
                                {feedback.customerId && typeof feedback.customerId === 'object' && (
                                  <span className="text-sm font-medium">
                                    {feedback.customerId.name}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {feedback.comments && (
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
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
                                      {new Date(feedback.repliedAt).toLocaleDateString()}
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
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
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

