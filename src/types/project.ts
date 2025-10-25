export type ProjectSource = "default" | "local" | "server";

export type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string; // Legacy support for single image
  images?: string[]; // New: array of up to 5 images
  source?: ProjectSource;
};

export type ProjectFormData = {
  title: string;
  url: string;
  description: string;
  tags: string;
  images: string[];
};

export type AuthResponse = {
  authenticated: boolean;
  expiresAt?: number;
};

export type LoginResponse = {
  success: boolean;
  error?: string;
  expiresAt?: number;
};

export type LogoutResponse = {
  success: boolean;
};
