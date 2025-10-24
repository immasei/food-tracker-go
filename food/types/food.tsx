export type Food = {
  id: string;
  userId: string;
  name?: string | null;
  expiryDate?: string| null; // YYYY-MM-DD
  category?: string | null;
  createdAt: string;  // ISO datetime
  shared: boolean;
};