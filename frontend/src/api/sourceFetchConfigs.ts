import api from "./axios";
import type {
  SourceFetchConfig,
  SourceFetchConfigPayload,
} from "../types/sourceFetchConfig";

export async function getSourceFetchConfigs(): Promise<SourceFetchConfig[]> {
  const response = await api.get<SourceFetchConfig[]>("/source-fetch-configs");
  return response.data;
}

export async function createSourceFetchConfig(
  payload: SourceFetchConfigPayload
): Promise<SourceFetchConfig> {
  const response = await api.post<SourceFetchConfig>("/source-fetch-configs", payload);
  return response.data;
}

export async function updateSourceFetchConfig(
  id: number,
  payload: SourceFetchConfigPayload
): Promise<SourceFetchConfig> {
  const response = await api.put<SourceFetchConfig>(`/source-fetch-configs/${id}`, payload);
  return response.data;
}

export async function deleteSourceFetchConfig(id: number): Promise<void> {
  await api.delete(`/source-fetch-configs/${id}`);
}

export async function testSourceFetchConfig(id: number): Promise<unknown> {
  const response = await api.post(`/source-fetch-configs/${id}/test`);
  return response.data;
}
