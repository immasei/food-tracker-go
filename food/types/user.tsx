export type User = {
  id: string;
  userid?: string;
  username?: string | null;
  email?: string | null;
  phone_no?: string | null;
  location?: ULocation | null;
  pushEnabled?: boolean; 
  taste_pref?: string | null;
  allergy_info?: string | null;
};

export type ULocation = {
  placeId?: string | null;
  formatted?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: any;
};

export type UStats = {
  totalItems: number;
  expiringItems: number;
  expiredItems: number;
  sharedItems: number;
};