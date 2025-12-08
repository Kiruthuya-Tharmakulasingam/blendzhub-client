export interface Service {
  _id: string;
  name: string;
  price: number;
  description?: string;
  discount?: number;
  duration: number; // in minutes
  imageUrl?: string;
  salonId?: string | { _id: string; name: string; location: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  description?: string;
  discount?: number;
  duration: number;
  imageUrl?: string;
  salonId?: string; // Optional - backend auto-sets for owners
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;
