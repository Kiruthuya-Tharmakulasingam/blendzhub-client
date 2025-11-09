export type FeedbackItem = {
  _id: string;
  customerId: string;
  comments: string;
  rating: Number;
  salonId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
