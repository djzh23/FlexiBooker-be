-- ============================================================================
-- FLEXIBOOKER DATABASE SETUP
-- 
-- Dieses Script erstellt alle notwendigen Tabellen und Seeding-Daten
-- Kopiere alles in deine MySQL/PostgreSQL Datenbank
-- ============================================================================

-- ============================================================================
-- 1. CREATE DATABASE
-- ============================================================================

CREATE DATABASE IF NOT EXISTS flexibooker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flexibooker;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'MAD',
  timezone VARCHAR(255) NOT NULL DEFAULT 'Africa/Casablanca',
  configJson LONGTEXT NOT NULL COMMENT 'JSON string mit Brand/Layout Config',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_category (tenantId, name),
  INDEX idx_tenant (tenantId)
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoryId INT NOT NULL,
  tenantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl VARCHAR(1024),
  isAvailable BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES menu_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_category (categoryId),
  INDEX idx_tenant (tenantId)
);

-- ============================================================================
-- 3. INSERT TENANTS (mit konfiguriertem JSON)
-- ============================================================================

INSERT INTO tenants (slug, name, currency, timezone, configJson) VALUES

-- Tenant 1: Tacos Restaurant
('tacos-mohammedia', 'Makin Hir Tacos', 'MAD', 'Africa/Casablanca', '{
  "brand": {
    "primaryColor": "#FF6B35",
    "secondaryColor": "#004E89",
    "accentColor": "#1F77D2",
    "logoUrl": null
  },
  "contact": {
    "phone": "+212 6 12 34 56 78",
    "whatsapp": "+212 6 12 34 56 78",
    "email": "hello@makintar.com"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Makin Hir Tacos | Mohammedia",
      "title": "Le #1 French Tacos au Maroc",
      "description": "Komponiere dein Tacos in 5 Schritten, wähle aus 15+ artisanalen Sauces und lasse unsere Chefs es grillen.",
      "cta1": {"label": "Jetzt bestellen"},
      "cta2": {"label": "Vollständige Karte ansehen"},
      "stats": [
        {"label": "Sauces artisanales", "value": "15+"},
        {"label": "Signature Supplements", "value": "10"},
        {"label": "Service livraison", "value": "24h"}
      ],
      "backgroundImage": "https://images.unsplash.com/photo-1528732263440-4d74ae930053?auto=format&fit=crop&w=1600&q=80"
    },
    "menuSection": {
      "enabled": true,
      "badge": "Carte signature",
      "title": "Die beliebtesten Tacos",
      "description": "Rezepte inspiriert vom Original, modernisiert mit Premium-Look."
    },
    "steps": {
      "enabled": true,
      "badge": "Ritual",
      "title": "Dein Tacos in 5 Schritten",
      "steps": [
        {"title": "Schritt 1", "subtitle": "Wähle deine Größe", "detail": "L (1 Viande) - XL (2) - XXL (3)"},
        {"title": "Schritt 2", "subtitle": "Wähle deine Viande", "detail": "Tenders, Steak, Escalope, Kebab, Nuggets, Cordon Bleu..."},
        {"title": "Schritt 3", "subtitle": "Selektiere die Sauce", "detail": "Barbecue, Biggy, Fromagere, Algerienne, Samourai, Curry..."},
        {"title": "Schritt 4", "subtitle": "Füge Supplements hinzu", "detail": "Cheddar, Oignons Crispy, Bacon Dinde, Oeuf..."},
        {"title": "Schritt 5", "subtitle": "Fais gratiner", "detail": "Cheddar, Mozzarella ou Chevre Miel + 10 MAD"}
      ]
    },
    "gallery": {
      "enabled": true,
      "badge": "Ambiance",
      "title": "Shots disponibles pour ta landing",
      "images": [
        "https://images.unsplash.com/photo-1528832992873-5bb5781525d6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1605433247501-698725862cea?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1576866209830-589e1bfbb87b?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  }
}'),

-- Tenant 2: Pizza Restaurant
('pizzeria-roma', 'Pizzeria Roma', 'MAD', 'Africa/Casablanca', '{
  "brand": {
    "primaryColor": "#C1272D",
    "secondaryColor": "#FAD201",
    "accentColor": "#2D2D2D",
    "logoUrl": null
  },
  "contact": {
    "phone": "+212 6 98 76 54 32",
    "whatsapp": "+212 6 98 76 54 32",
    "email": "hello@pizzeria-roma.com"
  },
  "layout": {
    "showSampleShowcase": true,
    "hero": {
      "enabled": true,
      "badge": "Pizzeria Roma | Casablanca",
      "title": "Authentische Italienische #Pizzas",
      "description": "Handgemachte Pizzas mit original italienischen Zutaten, zubereitet in unserem Holzofen.",
      "cta1": {"label": "Pizza bestellen"},
      "cta2": {"label": "Menü ansehen"},
      "stats": [
        {"label": "Pizzas", "value": "30+"},
        {"label": "Toppings", "value": "25+"},
        {"label": "Lieferzeit", "value": "45min"}
      ],
      "backgroundImage": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1600&q=80"
    },
    "menuSection": {
      "enabled": true,
      "badge": "Specialties",
      "title": "Unsere beliebtesten Pizzas",
      "description": "Klassische und moderne Rezepte, alle mit bester Qualität zubereitet."
    },
    "steps": {
      "enabled": true,
      "badge": "Bestellprozess",
      "title": "Deine Pizza in 4 Schritten",
      "steps": [
        {"title": "Schritt 1", "subtitle": "Größe", "detail": "25cm (small) - 30cm (medium) - 35cm (large)"},
        {"title": "Schritt 2", "subtitle": "Pizza", "detail": "Klassisch oder Custom - Margherita bis Carnivora"},
        {"title": "Schritt 3", "subtitle": "Extras", "detail": "Zusätzliche Käsesorten, Gemüse, Fleisch..."},
        {"title": "Schritt 4", "subtitle": "Kasse", "detail": "Bezahlung und Lieferoption auswählen"}
      ]
    },
    "gallery": {
      "enabled": true,
      "badge": "Galerie",
      "title": "Unsere Pizzas",
      "images": [
        "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  }
}');

-- ============================================================================
-- 4. INSERT MENU CATEGORIES
-- ============================================================================

-- Tacos Restaurant (tenantId = 1)
INSERT INTO menu_categories (tenantId, name, sortOrder) VALUES
(1, 'Tacos', 1),
(1, 'Drinks', 2),
(1, 'Desserts', 3);

-- Pizza Restaurant (tenantId = 2)
INSERT INTO menu_categories (tenantId, name, sortOrder) VALUES
(2, 'Pizzas', 1),
(2, 'Pasta', 2),
(2, 'Drinks', 3),
(2, 'Desserts', 4);

-- ============================================================================
-- 5. INSERT MENU ITEMS
-- ============================================================================

-- Tacos (categoryId = 1, tenantId = 1)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(1, 1, 'Tacos Cordon Bleu', 'Cordon bleu croustillant, fromage gratine et sauce andalouse maison.', 55, 'https://images.unsplash.com/photo-1608039829574-6cffc50b1d5f?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Chevre Miel', 'Chevre fondant, touche de miel du Rif et noix torrefiees.', 55, 'https://images.unsplash.com/photo-1608039829743-23a84527b39b?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos 3 Fromages', 'Mozza, cheddar et emmental enveloppes dans une tortilla XL.', 54, 'https://images.unsplash.com/photo-1612874472202-0f535f04c9f0?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Shawarma ou Tenders', 'Poulet marie facon shawarma ou tenders croustillants.', 53, 'https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 1, 'Tacos Poulet ou Viande Hachee', 'Classique de la maison, salsa rouge et frites maison.', 44, 'https://images.unsplash.com/photo-1612197594794-9526bfea1a6a?auto=format&fit=crop&w=1200&q=80', TRUE);

-- Drinks (categoryId = 2, tenantId = 1)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(1, 2, 'Fresh Orange Juice', '100% fresh squeezed orange juice', 25, NULL, TRUE),
(1, 2, 'Coca Cola', 'Classic Coca Cola 33cl', 15, NULL, TRUE),
(1, 2, 'Water', 'Bottled mineral water', 5, NULL, TRUE),
(1, 2, 'Sprite', 'Sprite 33cl', 15, NULL, TRUE);

-- Desserts (categoryId = 3, tenantId = 1)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(1, 3, 'Chocolate Cake', 'Rich chocolate cake with ice cream', 40, NULL, TRUE),
(1, 3, 'Tiramisu', 'Classic Italian Tiramisu', 35, NULL, TRUE);

-- ============================================================================

-- Pizzas (categoryId = 4, tenantId = 2)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(2, 4, 'Margherita', 'Tomato, Fresh Mozzarella, Basil, Olive Oil', 80, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 4, 'Pepperoni', 'Tomato, Mozzarella, Italian Pepperoni', 90, 'https://images.unsplash.com/photo-1571407-5daf9e93fa40?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 4, 'Four Cheese', 'Mozzarella, Parmesan, Gorgonzola, Ricotta', 100, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 4, 'Vegetarian', 'Tomato, Mozzarella, Vegetables (Bell Pepper, Onion, Mushroom)', 85, NULL, TRUE),
(2, 4, 'Carnivora', 'Tomato, Mozzarella, Prosciutto, Bacon, Sausage', 110, NULL, TRUE);

-- Pasta (categoryId = 5, tenantId = 2)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(2, 5, 'Spaghetti Carbonara', 'Classic Italian pasta with bacon and cream', 75, NULL, TRUE),
(2, 5, 'Penne Arrabbiata', 'Spicy tomato sauce with garlic and chili', 70, NULL, TRUE),
(2, 5, 'Lasagna', 'Layered pasta with meat sauce and cheese', 90, NULL, TRUE);

-- Drinks (categoryId = 6, tenantId = 2)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(2, 6, 'Red Wine (Glass)', 'Italian Red Wine', 50, NULL, TRUE),
(2, 6, 'White Wine (Glass)', 'Italian White Wine', 45, NULL, TRUE),
(2, 6, 'Coca Cola', 'Coca Cola 33cl', 15, NULL, TRUE),
(2, 6, 'Sparkling Water', 'San Pellegrino', 20, NULL, TRUE);

-- Desserts (categoryId = 7, tenantId = 2)
INSERT INTO menu_items (tenantId, categoryId, name, description, price, imageUrl, isAvailable) VALUES
(2, 7, 'Panna Cotta', 'Italian cream dessert with berry sauce', 40, NULL, TRUE),
(2, 7, 'Tiramisu', 'Classic Italian Tiramisu', 45, NULL, TRUE),
(2, 7, 'Gelato', 'Italian ice cream (3 scoops)', 30, NULL, TRUE);

-- ============================================================================
-- 6. VERIFY DATA
-- ============================================================================

SELECT 'Tenants' as section;
SELECT id, slug, name, currency FROM tenants;

SELECT 'Categories' as section;
SELECT c.id, t.slug, c.name FROM menu_categories c JOIN tenants t ON c.tenantId = t.id;

SELECT 'Menu Items Count' as section;
SELECT COUNT(*) as total_items FROM menu_items;

SELECT 'Sample Items' as section;
SELECT m.name, m.price, c.name as category, t.slug as tenant 
FROM menu_items m 
JOIN menu_categories c ON m.categoryId = c.id 
JOIN tenants t ON m.tenantId = t.id 
LIMIT 5;
