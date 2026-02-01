import type { TenantConfig } from "./tenant.types";

export function applyTenantTheme(config: TenantConfig) {
  const primary = config.brand?.primaryColor;
  const accent = config.brand?.accentColor;

  if (primary) document.documentElement.style.setProperty("--brand-primary", primary);
  if (accent) document.documentElement.style.setProperty("--brand-accent", accent);
}
