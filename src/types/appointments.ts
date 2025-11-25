export type AppointmentItem = {
  _id: string;
  date: Date;
  time: string;
  amount: number;
  discount: number;
  createdAt?: Date;
  updatedAt?: Date;

  customerId?: {
    _id: string;
    name: string;
    email: string;
  };

  staffId?: {
    _id: string;
    name: string;
    role: string;
  };

  serviceId?: {
    _id: string;
    name: string;
    price: number;
  };

  salonId?: {
    _id: string;
    name: string;
    location: string;
  };

  status?: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  notes?: string;
};
