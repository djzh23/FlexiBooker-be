/**
 * Default Tenant Configuration Template
 * 
 * Dies wird angewendet wenn das Backend nicht erreichbar ist
 * FALLBACK-DEMO nur!
 */

import type { TenantConfig } from "./tenant.types";

export const defaultTenantConfig: TenantConfig = {
  brand: {
    logoUrl: null,
    primaryColor: "#FF6B35",    // Orange
    secondaryColor: "#004E89",  // Blau
    accentColor: "#1F77D2"
  },
  contact: {
    phone: "+212 6 12 34 56 78",
    whatsapp: "+212 6 12 34 56 78",
    email: "contact@example.com"
  },
  layout: {
    showSampleShowcase: true,
    
    // Hero/Banner Section
    hero: {
      enabled: true,
      badge: "🌮 Demo Restaurant",
      title: "Willkommen! #Demo Mode",
      description: "👈 Dies ist eine Demo-Seite. Das Backend antwortet nicht. Sobald du es konfigurierst, sieht die Seite anders aus!",
      cta1: { label: "Jetzt bestellen" },
      cta2: { label: "Menü ansehen" },
      stats: [
        { label: "Demo Items", value: "3" },
        { label: "Features", value: "100%" },
        { label: "Ready", value: "✓" }
      ],
      backgroundImage: "https://images.unsplash.com/photo-1528732263440-4d74ae930053?auto=format&fit=crop&w=1600&q=80"
    },

    // Menu Cards Section
    menuSection: {
      enabled: true,
      badge: "DEMO",
      title: "Demo Menu Items (Fallback)",
      description: "Diese Items kommen vom Frontend. Wenn das Backend läuft, siehst du echte Daten!"
    },

    // Steps/Customization Section
    steps: {
      enabled: true,
      badge: "Info",
      title: "Wie funktioniert das System?",
      steps: [
        {
          title: "1️⃣ Frontend",
          subtitle: "Dieses Interface",
          detail: "React + TypeScript + Vite"
        },
        {
          title: "2️⃣ Backend",
          subtitle: "Konfiguration & Daten",
          detail: "API unter /api/v1/public/tenant"
        },
        {
          title: "3️⃣ JSON Config",
          subtitle: "Alles anpassbar",
          detail: "Farben, Texte, Bilder via JSON"
        },
        {
          title: "4️⃣ Database",
          subtitle: "Tenant-Verwaltung",
          detail: "MySQL/PostgreSQL mit Seeding"
        },
        {
          title: "5️⃣ Live Deploy",
          subtitle: "Bereit für Produktion",
          detail: "Skalierbar für viele Kunden"
        }
      ]
    },

    // Gallery Section
    gallery: {
      enabled: true,
      badge: "Stack",
      title: "Tech Stack & Setup",
      images: [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80", // Code
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80", // Backend
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?auto=format&fit=crop&w=1200&q=80"  // Deploy
      ]
    }
  }
};

