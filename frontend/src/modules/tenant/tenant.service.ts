import { createApiClient } from "../../shared/api/apiClient";
import type { TenantConfig, SiteResponse } from "./tenant.types";

export async function fetchTenant(tenant: string): Promise<{
  tenant: SiteResponse["tenant"];
  config: TenantConfig;
}> {
  const api = createApiClient({ tenant });

  // Use unified site endpoint (returns tenant + categories)
  const data = await api.request<SiteResponse>("/api/v1/public/site");

  let config: TenantConfig = {};
  try {
    config = data.tenant?.configJson ? JSON.parse(data.tenant.configJson) : {};
  } catch {
    config = {};
  }

  return { tenant: data.tenant, config };
}
