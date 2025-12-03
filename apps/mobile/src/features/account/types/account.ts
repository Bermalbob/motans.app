export type UserRole = "user" | "business" | "admin";

export interface UserProfile {
  id: string;
  username: string; // fijo tras registro
  fullName: string;
  email?: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl?: string | null;

  town: string; // nombre del pueblo principal
  regionRadiusKm: number; // 0-20 por defecto

  role: UserRole;
  language: "es" | "en" | string;

  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  businessId: string;
  ownerUserId: string;
  businessName: string;
  businessType: string; // hostelería, servicios, tienda, etc.
  description?: string;
  address?: string;
  locationTown: string; // por defecto igual que town del user
  openHours?: string;
  websiteUrl?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  isVerifiedBusiness: boolean;
  subscriptionPlan: "free" | "basic" | "plus" | "pro";
}
