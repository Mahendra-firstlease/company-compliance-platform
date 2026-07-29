/**
 * User & Business Profile Type Definitions
 */

export type UserRole = "CLIENT" | "EXECUTIVE" | "ADMIN";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessProfile {
  id?: string;
  userId: string;
  companyName: string;
  gstin?: string;
  panNumber?: string;
  businessType?: "PROPRIETORSHIP" | "PARTNERSHIP" | "LLP" | "PVT_LTD" | "PUBLIC_LTD" | "OTHER";
  registeredAddress?: string;
  state?: string;
  pincode?: string;
}
