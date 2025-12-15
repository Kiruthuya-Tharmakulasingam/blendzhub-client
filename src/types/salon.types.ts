export interface OperatingHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface SalonOperatingHours {
  monday: OperatingHours;
  tuesday: OperatingHours;
  wednesday: OperatingHours;
  thursday: OperatingHours;
  friday: OperatingHours;
  saturday: OperatingHours;
  sunday: OperatingHours;
  // Index signature to allow indexing with string
  [key: string]: OperatingHours;
}

export interface Salon {
  _id: string;
  name: string;
  location: string;
  type?: "men" | "women" | "unisex";
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  openingHours?: string;
  imageUrl?: string;
  ownerId: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  operatingHours?: SalonOperatingHours;
}

export interface CreateSalonRequest {
  name: string;
  location: string;
  type?: "men" | "women" | "unisex";
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  openingHours?: string;
  imageUrl?: string;
}

export type UpdateSalonRequest = Partial<CreateSalonRequest>;
