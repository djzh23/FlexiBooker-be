import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./LandingPage.css";
import { resolveTenant, ADMIN_KEY } from "../shared/config/env";
import { fetchSite, parseConfigJson } from "../modules/site/site.service";
import { applyTenantTheme } from "../modules/tenant/applyTheme";
import { LayoutRenderer } from "../modules/tenant/layoutRenderer";
import { AdminAccess } from "../modules/admin/AdminAccess";
import { LanguageSwitcher } from "../modules/common/LanguageSwitcher";
import { defaultTenantConfig } from "../modules/tenant/defaultConfig";
import type { SiteResponse } from "../modules/tenant/tenant.types";
import type { TenantConfig } from "../modules/tenant/tenant.types";

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string; code?: number }
  | { status: "ready" };

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error === "object" && error && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
};

/**
 * LandingPage – Unified Frontend für Multi-Tenant Restaurants
 * 
 * Workflow:
 * 1. resolveTenant() → bestimmt Slug aus Query-Param oder DEFAULT
 * 2. fetchSite(slug) → Single API Call zu GET /api/v1/public/site
 * 3. Backend liefert SiteResponse mit Tenant-Info + kategorisiertem Menü
 * 4. Frontend parsed configJson → Theme wird angewendet
 * 5. LayoutRenderer rendert basierend auf Config
 */
export default function LandingPage() {
  const { t } = useTranslation();
  const tenantSlug = useMemo(() => resolveTenant(), []);
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const [siteData, setSiteData] = useState<SiteResponse | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  
  // Check if admin mode is enabled via URL parameter
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isAdminMode = urlParams.get("admin") === "true";

  /**
   * Single API Call: Hole Site-Daten immer vom Backend (KEIN localStorage mehr!)
   * 
   * WICHTIG: Alle Admin-Änderungen gehen zu Backend → Backend speichert in DB
   * Frontend lädt immer frische Daten vom Backend (nach admin changes oder refresh)
   */
  useEffect(() => {
    (async () => {
      setState({ status: "loading" });
      try {
        // ✅ IMMER vom Backend holen (nicht aus localStorage!)
        // Single call: GET /api/v1/public/site?slug=X oder X-Tenant Header
        const site = await fetchSite(tenantSlug);
        
        console.log("[LandingPage] Loaded site from Backend:", {
          slug: tenantSlug,
          categories: site.categories.length,
          timestamp: new Date().toISOString()
        });

        // Parse configJson von String zu Objekt
        const config = parseConfigJson(site.tenant.configJson);

        // Speichere beide für späteren Zugriff
        setSiteData(site);
        setTenantConfig(config);

        // Wende Theme-Farben an
        applyTenantTheme(config);

        setState({ status: "ready" });
      } catch (error: unknown) {
        console.error("[LandingPage] Error fetching site:", error);
        const code = getStatusCode(error);

        // Fallback: Zeige Demo-Seite mit Default-Config
        if (code === 404 || code === 400 || !code) {
          console.log("[LandingPage] Using default config fallback (backend unreachable)");
          setTenantConfig(defaultTenantConfig);
          applyTenantTheme(defaultTenantConfig);
          setSiteData(null);
          setState({ status: "ready" });
        } else {
          // Echter Fehler: zeige Fehler-Meldung
          setState({
            status: "error",
            message: t("messages.networkError"),
            code
          });
        }
      }
    })();
  }, [tenantSlug, t]);

  // === LOADING STATE ===
  if (state.status === "loading") {
    return (
      <div className="landing-root">
        <div className="language-switcher-top">
          <LanguageSwitcher />
        </div>
        <LayoutRenderer layout={tenantConfig?.layout} menuCategories={[]} />
        <div className="tenant-empty">{t("messages.loading")}</div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (state.status === "error") {
    return (
      <div className="landing-root">
        <div className="language-switcher-top">
          <LanguageSwitcher />
        </div>
        <LayoutRenderer layout={tenantConfig?.layout} menuCategories={[]} />
        <section className="tenant-section">
          <div className="tenant-card">
            <div>
              <span className="tenant-pill">{t("common.error")}</span>
              <h1 className="tenant-card__title">{state.message}</h1>
              <p className="tenant-card__meta">
                Tenant: {tenantSlug} {state.code ? `(HTTP ${state.code})` : ""}
              </p>
            </div>
            <div className="tenant-card__actions">
              <button onClick={() => window.location.reload()}>{t("messages.tryAgain")}</button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // === READY STATE ===
  // Konvertiere Backend-Kategorien zu LayoutRenderer-Format
  const displayCategories = (siteData?.categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      name: item.name,
      price: item.price,
      description: item.description || "",
      image: item.imageUrl || "https://via.placeholder.com/400",
      tags: [] // Backend sendet keine Tags → empty Array
    }))
  }));

  // === ADMIN MODE ===
  if (isAdminMode) {
    return (
      <div className="landing-root">
        <div className="language-switcher-top">
          <LanguageSwitcher />
        </div>
        <AdminAccess
          tenantSlug={tenantSlug}
          adminKey={ADMIN_KEY}
          currentSite={siteData || undefined}
        />
      </div>
    );
  }

  return (
    <div className="landing-root">
      <div className="language-switcher-top">
        <LanguageSwitcher />
      </div>
      <LayoutRenderer layout={tenantConfig?.layout} menuCategories={displayCategories} />
    </div>
  );
}
