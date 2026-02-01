**Projektübersicht (für Nicht-IT / Designer / Stakeholder)**

Ziel: Kurze, klare Beschreibung des Projekts, Struktur und warum es so gebaut wurde — verständlich für nicht-technische Leser.

---

**1) Was ist das Projekt?**

FlexiBooker ist eine webbasierte, multi-restaurant Plattform (Frontend + Backend). Sie erlaubt mehreren Restaurants, dieselbe Web-App zu nutzen, aber jedes Restaurant zeigt eigene Farben, Inhalte und Menüs.

Beispiel: "Tacos Mohammedia" und "Blublu Pizza" verwenden dieselbe App, sehen aber unterschiedlich aus und haben unterschiedliche Speisekarten.

---

**2) Hauptziel / Nutzen**

- Schnell neue Restaurant-Seiten bereitstellen, ohne Code zu ändern.
- Einheitliches Nutzererlebnis bei individuellen Markenauftritten.
- Geringere Entwicklungs- und Wartungskosten: eine Codebasis für viele Restaurants.
- Schnelle A/B-Tests und einfache Anpassungen (Design, Texte, Bilder).

---

**3) Wichtige Komponenten (einfach erklärt)**

- Frontend (die Webseite, die Gäste sehen): Lädt Daten vom Backend, setzt Farben/Logo und zeigt Menü und Bilder.
- Backend (Server & Datenbank): Speichert alle Restaurants, Menüs und Design-Einstellungen. Liefert die Daten an das Frontend in einem einzigen, strukturierten Paket.
- Admin-API: Ermöglicht das Erstellen/Ändern von Restaurants über einen sicheren Endpunkt (nur mit Admin-Schlüssel).

---

**4) Wie Frontend & Backend zusammenarbeiten (in 3 Schritten)**

1. Besucher öffnet die Webseite mit einem Parameter (z. B. „?tenant=blublu-pizza“).
2. Frontend fragt das Backend: „Gib mir die Daten für diesen Restaurant-Slug“.
3. Backend antwortet mit allem (Infos, Farben, Kategorien, Items). Frontend zeigt die Seite entsprechend an.

Technisch: Dieser Austausch ist eine einzelne Anfrage (weniger Verzögerung, weniger Fehlerquellen).

---

**5) Warum so gebaut? (Begründung / Design-Entscheidungen)**

- Single API Response: Einfacher Zustand, weniger Netzwerkanfragen → schneller und robuster.
- configJson (Design als Daten): Designer können Farben, Titel und Bilder als Daten steuern, ohne Entwickler.
- Multi-tenant Ansatz: Skalierbar — eine Codebasis bedient viele Restaurants.
- Fallback/Demo-Config: Wenn Backend ausfällt, zeigt die Seite eine Demo, damit Designer/Tester weiterarbeiten können.

---

**6) Was du als Designer ändern kannst (ohne Code zu schreiben)**

- Farben (primary, accent): im Tenant-Config JSON (Backend / Admin UI)
- Hero-Titel, Beschreibung, Bilder: Tenant-Config
- Menü-Inhalte (Kategorien, Artikel, Preise): Datenbank / Admin API

Kurz: 95% der visuellen Anpassungen sind reine Datenänderungen — keine Code-Deployments nötig.

---

**7) Wie man ein neues Restaurant erstellt (High-level für Nicht-IT)**

1. Designer erstellt Inhalt & Bilder (Titel, Texte, 3-4 Hero-/Gallery-Bilder).
2. Product/Dev setzt diese Inhalte in eine JSON-Vorlage (wir unterstützen dabei).
3. Admin (oder DevOps) sendet die JSON an unseren Admin-Endpunkt (sichere Anfrage).
4. Nach wenigen Sekunden ist die Seite unter `/?tenant=neuer-slug` erreichbar.

---

**8) Warum ist das nützlich / Business-Vorteile**

- Schnelle Markteinführung (Time-to-market): Restaurants starten in Minuten.
- Niedrige Kosten: Ein Team pflegt eine Codebasis für viele Kunden.
- Einfache White-Labeling-Angebote: Rebranding für Franchises ohne App-Projekte.
- Upsell-Möglichkeiten: Admin-UI, Premium-Templates, Analytics, Bestellintegration.

---

**9) Vermarktungsideen / Monetarisierung (Theorien)**

- SaaS-Modell (Subscription): Basisplan (Hosting + Standard-Template), Premium (Custom Themes, Analytics).
- One-time Setup + Monthly Hosting: Einmalige Onboarding-Gebühr + monatlicher Betrieb.
- Marketplace für Templates: Designer verkaufen fertige Themes.
- Transaction Fee: Bei Bestellung/Bezahlung über das System kleine Gebühr.
- White-Label für Agenturen: Agenturen vertreiben gebrandete Instanzen an lokale Restaurants.

---

**10) Metriken & Erfolgskriterien (für Produkt/Marketing)**

- Anzahl aktivierter Restaurants (Monat)
- Conversion: Besucher → Bestellung (falls Bestellfunktion)
- Zeit bis Live (Onboarding Duration)
- Churn Rate (Kündigungsquote)
- Durchschnittlicher Umsatz pro Restaurant

---

**11) Beispiele für einfache Designer-Workflows**

- Variante A (Schnell): Designer stellt 3 Bilder + 3 Farben + kurze Texte. Dev führt POST (Admin) aus. Live in 5–10 Minuten.
- Variante B (Iterativ): Designer ändert Texte & Farben per Admin-UI und testet live A/B-Varianten.

---

**12) Kurz-Zusammenfassung (eine Seite)**

FlexiBooker ist eine schlanke Plattform, die es ermöglicht, viele Restaurant-Webseiten mit einem gemeinsamen Code zu betreiben, wobei jedes Restaurant sein eigenes Branding, Menü und Inhalte hat. Designer können die visuelle Identität eines Restaurants über Daten (JSON) steuern — keine Codeänderungen nötig. Für das Business ergibt das niedrige Kosten, schnelle Launches und mehrere Monetarisierungswege.

---

Wenn du willst, erstelle ich eine Design-Übersichtsvorlage (eine JSON-Vorlage) und eine kurze Checkliste, die Designer nutzen können, um Inhalte bereitzustellen (z.B. Bildgrößen, Text-Längen, Farben).