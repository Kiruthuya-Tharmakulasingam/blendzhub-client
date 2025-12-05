export interface Salon {
  _id: string;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
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
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateSalonRequest extends Partial<CreateSalonRequest> {}
