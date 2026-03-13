import api from "./axios";
import type { PublishPostPayload, PublishPostResponse } from "../types/publishing";

export async function publishPost(
  payload: PublishPostPayload
): Promise<PublishPostResponse> {
  const response = await api.post<PublishPostResponse>("/publishing/publish", payload);
  return response.data;
}
