import { createApiClient } from "../../shared/api/apiClient";
import type { SiteResponse, TenantConfig } from "../tenant/tenant.types";

/**
 * Unified API Call: GET /api/v1/public/site
 * 
 * Holt Tenant-Info + kategorisiertes Menü in einem Request.
 * Der Query-Param ?slug= (oder X-Tenant Header) bestimmt, welcher Tenant geladen wird.
 * 
 * @param tenant Slug des Tenants (z.B. "tacos-mohammedia")
 * @returns SiteResponse mit Tenant-Info + Kategorien/Items
 */
export async function fetchSite(tenant: string): Promise<SiteResponse> {
  const api = createApiClient({ tenant });
  
  try {
    const data = await api.request<SiteResponse>("/api/v1/public/site");
    return data;
  } catch (error) {
    console.error(`Failed to fetch site for tenant "${tenant}":`, error);
    throw error;
  }
}

/**
 * Parse ConfigJson String zu TenantConfig Objekt
 * 
 * Backend liefert configJson als String; dieser Helper macht JSON.parse() mit Fallback.
 * @param configJsonString Raw JSON String aus der SiteResponse
 * @returns Geparster TenantConfig oder leeres Objekt bei Fehler
 */
export function parseConfigJson(configJsonString: string): TenantConfig {
  try {
    return configJsonString ? JSON.parse(configJsonString) : {};
  } catch (error) {
    console.warn("Failed to parse configJson:", error);
    return {};
  }
}
