export interface Service {
  _id: string;
  name: string;
  price: number;
  description?: string;
  discount?: number;
  duration: number; // in minutes
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  price: number;
  description?: string;
  discount?: number;
  duration: number;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;
