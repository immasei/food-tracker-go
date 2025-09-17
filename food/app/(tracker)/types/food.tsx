export type Food = {
  id: string;
  userId: string;
  name: string;
  expiryDate: string; // YYYY-MM-DD
  category: string;
  createdAt: string;  // ISO datetime
  shared: boolean;
};