export type StaffItem = {
  _id: string;
  userId: string;
  salonId: string;
  name: string;
  role: string;
  skillLevel?: string;
  trainingStatus?: string;
  specializations?: string[];
  isApprovedByOwner?: boolean;
  approvedByOwner: string;
  approvedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

