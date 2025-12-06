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
