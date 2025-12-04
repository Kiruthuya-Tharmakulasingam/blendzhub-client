export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "customer" | "owner" | "admin" | "staff";
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface Customer {
  _id: string;
  userId: string;
  name: string;
  email: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  status: "pending" | "approved" | "rejected";
  approvedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterCustomerRequest {
  name: string;
  email: string;
  password: string;
  contact: string;
}

export interface RegisterOwnerRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  businessName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    user: User;
    customer?: Customer;
    owner?: Owner;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
}
