export type UserRole = "personal" | "business" | "both";

export interface UserProfile {
  id: string;
  username: string; // fixed after registration
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;

  townId?: string | null;
  townName?: string | null;

  role: UserRole; // personal, business or both

  businessName?: string;
  businessCategory?: string; // e.g., restaurante, peluquería, fontanero
  businessAddress?: string;
  businessDescription?: string;

  language: "es" | "en" | "other";
  notificationsEnabled: boolean;
  marketingEmails: boolean;

  createdAt: string;
  updatedAt: string;
}
