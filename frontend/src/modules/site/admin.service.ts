import { ADMIN_KEY } from "../../shared/config/env";
import type { SiteResponse, SiteProvisionRequest } from "../tenant/tenant.types";

/**
 * Admin API: Provision / Update a Site
 * 
 * POST /api/v1/admin/sites mit X-Admin-Key Header
 * Erstellt neue Tenants oder überschreibt bestehende.
 * Alle bisherigen Kategorien/Items des Tenants werden gelöscht und durch die neuen Daten ersetzt.
 * 
 * @param request SiteProvisionRequest mit Tenant-Daten + Menu
 * @returns SiteResponse – der neue/aktualisierte Zustand
 */
export async function provisionSite(request: SiteProvisionRequest): Promise<SiteResponse> {
  if (!ADMIN_KEY) {
    throw new Error("ADMIN_KEY not configured in environment");
  }

  const response = await fetch("/api/v1/admin/sites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": ADMIN_KEY
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = null;
    }

    const statusText = response.statusText || "Unknown Error";
    const errorMsg =
      response.status === 401
        ? "Unauthorized: Invalid or missing X-Admin-Key header"
        : response.status === 400
          ? "Bad Request: Check slug, name, and menu items"
          : `HTTP ${response.status}: ${statusText}`;

    console.error("Provision failed:", errorMsg, details);
    throw new Error(errorMsg);
  }

  return (await response.json()) as SiteResponse;
}
