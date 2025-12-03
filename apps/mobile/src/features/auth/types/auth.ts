export type RegisterRole = "user" | "business";

export interface RegisterDataBase {
  username: string;
  email?: string;
  phone?: string;
  password: string;
  town: string;
  fullName?: string;
  language?: string;
  acceptTerms: boolean;
  isAdult: boolean;
  marketing?: boolean;
}

export interface RegisterDataBusiness extends RegisterDataBase {
  role: "business";
  businessName: string;
  businessType: string;
  description?: string;
  address?: string;
  websiteUrl?: string;
  socialInstagram?: string;
  socialFacebook?: string;
}

export interface RegisterDataUser extends RegisterDataBase {
  role: "user";
}

export type RegisterData = RegisterDataUser | RegisterDataBusiness;
