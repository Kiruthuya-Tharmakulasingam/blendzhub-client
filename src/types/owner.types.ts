export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  supplier?: string;
  qualityRating?: number;
  status: "active" | "out-of-stock" | "discontinued";
  salonId: string | { _id: string; name: string; location: string };
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  _id: string;
  name: string;
  description?: string;
  status: "available" | "in-use" | "maintenance" | "unavailable";
  lastSterlizedDate?: string;
  salonId: string | { _id: string; name: string; location: string };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  serviceId: {
    _id: string;
    name: string;
    price: number;
  };
  salonId: string | {
    _id: string;
    name: string;
    location: string;
  };
  date: string;
  time: string;
  amount: number;
  status: "pending" | "accepted" | "rejected" | "in-progress" | "completed" | "cancelled" | "no-show";
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  status?: "active" | "out-of-stock" | "discontinued";
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateEquipmentRequest {
  name: string;
  status: "available" | "in-use" | "maintenance" | "unavailable";
  lastSterlizedDate?: string;
}

export interface UpdateEquipmentRequest extends Partial<CreateEquipmentRequest> {}
