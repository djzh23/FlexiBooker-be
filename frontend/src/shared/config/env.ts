export const API_BASE_URL = ""; // leer, wenn du Vite Proxy nutzt
// export const API_BASE_URL = "http://localhost:5081"; // falls ohne Proxy

export const DEFAULT_TENANT = "tacos-mohammedia";

/**
 * Admin Key für POST /api/v1/admin/sites (Provisioning)
 * Wird als X-Admin-Key Header gesendet
 * Sollte über Umgebungsvariable gesetzt werden (z.B. VITE_ADMIN_KEY)
 */
export const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || "";

export function resolveTenant(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get("tenant")?.trim() || DEFAULT_TENANT;
}

