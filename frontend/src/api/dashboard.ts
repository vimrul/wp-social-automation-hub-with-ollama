import api from "./axios";
import type { DashboardSummaryResponse, HealthResponse } from "../types/dashboard";

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/health");
  return response.data;
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const response = await api.get<DashboardSummaryResponse>("/dashboard/summary");
  return response.data;
}
