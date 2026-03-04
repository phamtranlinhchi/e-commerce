// =============================================================================
// User-related type definitions
// =============================================================================

export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}
