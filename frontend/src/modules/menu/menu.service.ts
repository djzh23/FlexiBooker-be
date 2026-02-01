import { createApiClient } from "../../shared/api/apiClient";
import type { MenuResponse } from "./menu.types";

export async function fetchMenu(tenant: string): Promise<MenuResponse> {
  const api = createApiClient({ tenant });
  const data = await api.request<MenuResponse>("/api/v1/public/menu");

  // sort categories by sortOrder
  data.categories = [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return data;
}
