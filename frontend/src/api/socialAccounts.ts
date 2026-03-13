import api from "./axios";
import type { SocialAccount, SocialAccountPayload } from "../types/socialAccount";

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  const response = await api.get<SocialAccount[]>("/social-accounts");
  return response.data;
}

export async function createSocialAccount(
  payload: SocialAccountPayload
): Promise<SocialAccount> {
  const response = await api.post<SocialAccount>("/social-accounts", payload);
  return response.data;
}

export async function updateSocialAccount(
  id: number,
  payload: SocialAccountPayload
): Promise<SocialAccount> {
  const response = await api.put<SocialAccount>(`/social-accounts/${id}`, payload);
  return response.data;
}

export async function deleteSocialAccount(id: number): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/social-accounts/${id}`
  );
  return response.data;
}

export async function validateSocialAccount(
  id: number
): Promise<{ success: boolean; platform: string; social_account_id: number; message: string }> {
  const response = await api.post(
    `/social-accounts/${id}/validate`
  );
  return response.data;
}