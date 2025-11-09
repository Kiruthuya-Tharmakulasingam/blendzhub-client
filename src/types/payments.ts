export type PaymentItem = {
  _id: string;
  date: Date;
  method: string;
  amount: Number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};
