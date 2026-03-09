import api from "./axios";
import type { SourceSite, SourceSitePayload } from "../types/sourceSite";

export async function getSourceSites(): Promise<SourceSite[]> {
  const response = await api.get<SourceSite[]>("/source-sites");
  return response.data;
}

export async function createSourceSite(payload: SourceSitePayload): Promise<SourceSite> {
  const response = await api.post<SourceSite>("/source-sites", payload);
  return response.data;
}

export async function updateSourceSite(
  id: number,
  payload: SourceSitePayload
): Promise<SourceSite> {
  const response = await api.put<SourceSite>(`/source-sites/${id}`, payload);
  return response.data;
}

export async function deleteSourceSite(id: number): Promise<void> {
  await api.delete(`/source-sites/${id}`);
}
