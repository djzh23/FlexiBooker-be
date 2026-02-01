#!/usr/bin/env node

/**
 * 🚀 Tenant Setup Generator
 * 
 * Nutze dieses Script um schnell neue Tenant-Konfigurationen zu erstellen
 * 
 * Verwendung:
 * node scripts/create-tenant.js --slug=pizzeria-casablanca --name="Pizzeria Roma"
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
/** @type {Record<string, string>} */
const params = {};

// Parse CLI arguments
args.forEach((arg) => {
  const [key, value] = arg.split("=");
  params[key.replace("--", "")] = value;
});

if (!params.slug || !params.name) {
  console.error("❌ Fehler: --slug und --name sind erforderlich");
  console.error("\nBeispiel:");
  console.error(
    'node scripts/create-tenant.js --slug=tacos-marrakech --name="Tacos El Maha" --restaurant-type=tacos'
  );
  process.exit(1);
}

const { slug, name, "restaurant-type": restaurantType = "general" } = params;

// Template basierend auf Restauranttyp
/**
 * @param {string} type
 */
function getTemplate(type) {
  const baseTemplate = {
    brand: {
      primaryColor: "#FF6B35",
      secondaryColor: "#004E89",
      accentColor: "#1F77D2",
      logoUrl: null
    },
    contact: {
      phone: "+212 6 XX XX XX XX",
      whatsapp: "+212 6 XX XX XX XX",
      email: `contact@${slug.split("-")[0]}.com`
    },
    layout: {
      showSampleShowcase: true,
      hero: {
        enabled: true,
        badge: `${name} | Stadt`,
        title: `Welcome to ${name}`,
        description: "Entdecke unser Menü",
        cta1: { label: "Jetzt bestellen" },
        cta2: { label: "Vollständige Karte" },
        stats: [
          { label: "Artisanale Gerichte", value: "20+" },
          { label: "Tägliche Specials", value: "5" },
          { label: "Schnelle Lieferung", value: "30min" }
        ],
        backgroundImage: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1600&q=80"
      },
      menuSection: {
        enabled: true,
        badge: "Unser Menü",
        title: "Die beliebtesten Gerichte",
        description: "Frisch zubereitet mit besten Zutaten"
      },
      steps: {
        enabled: true,
        badge: "Prozess",
        title: "Dein Bestellprozess",
        steps: [
          { title: "Schritt 1", subtitle: "Wähle Größe", detail: "S, M, L" },
          { title: "Schritt 2", subtitle: "Zutaten", detail: "Wähle deine Favoriten" },
          { title: "Schritt 3", subtitle: "Extras", detail: "Optionale Supplements" },
          { title: "Schritt 4", subtitle: "Sauce", detail: "Verschiedene Saucen" },
          { title: "Schritt 5", subtitle: "Kasse", detail: "Bezahlung & Lieferung" }
        ]
      },
      gallery: {
        enabled: true,
        badge: "Galerie",
        title: "Impressionen",
        images: [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80"
        ]
      }
    }
  };

  // Type-spezifische Anpassungen
  if (type === "tacos") {
    baseTemplate.brand.primaryColor = "#FF6B35";
    baseTemplate.hero.title = `Le #1 ${name}`;
    baseTemplate.hero.stats = [
      { label: "Sauces artisanales", value: "15+" },
      { label: "Supplements", value: "10+" },
      { label: "Livraison 24h", value: "✓" }
    ];
    baseTemplate.steps.steps = [
      { title: "Schritt 1", subtitle: "Größe", detail: "L, XL, XXL" },
      { title: "Schritt 2", subtitle: "Proteine", detail: "Tenders, Steak, Kebab..." },
      { title: "Schritt 3", subtitle: "Sauce", detail: "15+ Optionen" },
      { title: "Schritt 4", subtitle: "Extras", detail: "Käse, Bacon, Crispy..." },
      { title: "Schritt 5", subtitle: "Gratinieren", detail: "Cheddar, Mozza, Ziege" }
    ];
  } else if (type === "pizza") {
    baseTemplate.brand.primaryColor = "#C1272D";
    baseTemplate.brand.secondaryColor = "#FAD201";
    baseTemplate.hero.title = `Authentische Pizzas bei ${name}`;
    baseTemplate.steps.steps = [
      { title: "Schritt 1", subtitle: "Größe", detail: "25, 30, 35cm" },
      { title: "Schritt 2", subtitle: "Belag", detail: "Klassisch oder Custom" },
      { title: "Schritt 3", subtitle: "Extras", detail: "Käse, Kräuter..." },
      { title: "Schritt 4", subtitle: "Zusätze", detail: "Getränke, Desserts" }
    ];
  } else if (type === "burger") {
    baseTemplate.brand.primaryColor = "#8B6F47";
    baseTemplate.hero.title = `Handmade Burgers - ${name}`;
  }

  return baseTemplate;
}

const template = getTemplate(restaurantType);

// Erstelle Ausgabedatei
const outputDir = path.join(__dirname, "..", "tenant-configs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `${slug}.json`);
const configJson = JSON.stringify(template, null, 2);

fs.writeFileSync(outputFile, configJson);

console.log("✅ Tenant-Konfiguration erstellt!");
console.log(`📁 Datei: ${outputFile}`);
console.log(`\n📋 Konfiguration für: ${name} (${slug})`);
console.log(`\n🎨 Farben: ${template.brand.primaryColor} / ${template.brand.secondaryColor}`);
console.log(`\n🔧 Layout Sections:`);
console.log(`   - Hero: ${template.layout.hero.enabled ? "✓" : "✗"}`);
console.log(`   - Menu: ${template.layout.menuSection.enabled ? "✓" : "✗"}`);
console.log(`   - Steps: ${template.layout.steps.enabled ? "✓" : "✗"}`);
console.log(`   - Gallery: ${template.layout.gallery.enabled ? "✓" : "✗"}`);

console.log(`\n📤 Nächster Schritt: Diese JSON ins Backend hochladen:` );
console.log(`
POST /api/v1/admin/tenants
{
  "slug": "${slug}",
  "name": "${name}",
  "currency": "MAD",
  "timezone": "Africa/Casablanca",
  "configJson": ${JSON.stringify(configJson)}
}
`);

console.log("✨ Fertig! Das Frontend wird die Konfiguration automatisch laden.");
