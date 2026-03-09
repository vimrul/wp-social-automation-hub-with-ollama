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
