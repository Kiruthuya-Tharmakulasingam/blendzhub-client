export type AppointmentItem = {
  _id: string;
  date: Date;
  customerId: string;
  salonId: string;
  serviceId: string;
  time: string;
  amount: Number;
  discount: Number;
  createdAt?: Date;
  updatedAt?: Date;
};
