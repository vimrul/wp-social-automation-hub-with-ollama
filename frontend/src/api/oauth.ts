import api from "./axios";

export type OAuthConnectResponse = {
  authorization_url: string;
};

export async function getXConnectUrl(): Promise<OAuthConnectResponse> {
  const response = await api.get<OAuthConnectResponse>("/oauth/x/connect", {
    params: { redirect_after: "/social-accounts" },
  });
  return response.data;
}

export async function getFacebookConnectUrl(): Promise<OAuthConnectResponse> {
  const response = await api.get<OAuthConnectResponse>("/oauth/facebook/connect", {
    params: { redirect_after: "/social-accounts" },
  });
  return response.data;
}
