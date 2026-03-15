import api from "./axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  photo_url: string | null;
  git_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  facebook_url: string | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export type ProfileUpdatePayload = {
  full_name: string;
  phone?: string;
  photo_url?: string;
  git_url?: string;
  linkedin_url?: string;
  x_url?: string;
  facebook_url?: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await api.get<MeResponse>("/auth/me");
  return response.data;
}

export async function getMyProfile(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/users/me");
  return response.data;
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<AuthUser> {
  const response = await api.put<AuthUser>("/users/me", payload);
  return response.data;
}