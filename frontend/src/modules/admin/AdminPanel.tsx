import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SiteResponse } from "../tenant/tenant.types";
import "./AdminPanel.css";

interface AdminPanelProps {
  tenantSlug: string;
  currentSite?: SiteResponse;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

type MenuCategory = SiteResponse["categories"][number];
type MenuItem = MenuCategory["items"][number];

const cloneSiteData = (site?: SiteResponse): SiteResponse | null => {
  if (!site) {
    return null;
  }

  // Simple deep clone so form edits never mutate props
  return JSON.parse(JSON.stringify(site)) as SiteResponse;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }
  }

  return String(error);
};

export function AdminPanel({ tenantSlug, currentSite, onSuccess, onError }: AdminPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dishes" | "hero" | "colors" | "layout" | "heroImage" | "typography">("dishes");
  const [loading, setLoading] = useState(false);

  // ===== TAB 1: GERICHTE VERWALTUNG (CRUD) =====
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishImage, setDishImage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentSite?.categories[0]?.id || ""
  );

  // Memoized siteData - clone currentSite to avoid accidental prop mutations
  const siteData = useMemo(() => cloneSiteData(currentSite), [currentSite]);

  // Form zurücksetzen
  const resetDishForm = () => {
    setDishName("");
    setDishPrice("");
    setDishDescription("");
    setDishImage("");
    setIsAvailable(true);
    setEditingItemId(null);
  };

  // Gericht hinzufügen ODER bearbeiten
  const handleAddOrUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice || !selectedCategory) {
      onError?.(t("admin.dishes.requiredFields"));
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const dishData = {
        name: dishName,
        price: parseFloat(dishPrice),
        description: dishDescription,
        imageUrl: dishImage || null,
        categoryId: selectedCategory,
        isAvailable,
      };

      let endpoint = "";
      let method = "POST";

      if (editingItemId) {
        // Update: PATCH
        endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items/${editingItemId}`;
        method = "PATCH";
      } else {
        // Create: POST
        endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items`;
        method = "POST";
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dishData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("admin.wrongPassword"));
        } else if (response.status === 404) {
          throw new Error(t("messages.notFound"));
        } else if (response.status === 400) {
          throw new Error(t("admin.dishes.error"));
        } else {
          throw new Error(t("messages.backendError"));

        }
      }

      await response.json();
      const action = editingItemId ? t("admin.dishes.editedSuccess") : t("admin.dishes.addedSuccess");
      onSuccess?.(`✅ ${action}`);
      resetDishForm();
      
      // Seite neu laden, um Daten vom Backend zu holen
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving dish:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Gericht löschen
  const handleDeleteDish = async (dishId: string, dishName: string) => {
    if (!window.confirm(t("admin.dishes.deleteConfirm"))) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}/items/${dishId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Falscher Admin-Key!");
        } else if (response.status === 404) {
          throw new Error(t("messages.notFound"));
        } else {
          throw new Error(t("messages.backendError"));
        }
      }

      onSuccess?.(`${dishName} ${t("admin.dishes.deletedSuccess")}!`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      onError?.(`${t("admin.dishes.error")}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Gericht zum Bearbeiten laden
  const handleEditDish = (dish: MenuItem) => {
    setDishName(dish.name);
    setDishPrice(dish.price.toString());
    setDishDescription(dish.description || "");
    setDishImage(dish.imageUrl || "");
    setIsAvailable(dish.isAvailable ?? true);
    setEditingItemId(dish.id);
    setTimeout(() => {
      const form = document.querySelector(".admin-form");
      if (form) {
        form.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // ===== TAB 2: HERO-SECTION ÄNDERN =====
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");

  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroBadge || !heroTitle || !heroDescription) {
      onError?.(t("common.required"));
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _mergeStrategy: "deep",
          layout: {
            hero: {
              badge: heroBadge,
              title: heroTitle,
              description: heroDescription,
            },
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("admin.wrongPassword"));
        } else if (response.status === 404) {
          throw new Error(t("messages.notFound"));
        } else {
          throw new Error(t("messages.backendError"));
        }
      }

      onSuccess?.(t("admin.hero.savedSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving hero:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ===== TAB 3: FARBEN ÄNDERN =====
  const [primaryColor, setPrimaryColor] = useState("#0066FF");
  const [accentColor, setAccentColor] = useState("#FF0000");

  // ===== TAB 4: LAYOUT KONFIGURATION =====
  const [showHero, setShowHero] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showGallery, setShowGallery] = useState(true);

  // ===== TAB 5: HERO IMAGE =====
  const [heroImageUrl, setHeroImageUrl] = useState("");

  // ===== TAB 6: TYPOGRAPHIE =====
  const [fontFamily, setFontFamily] = useState("Inter");
  const [headingFontFamily, setHeadingFontFamily] = useState("Poppins");
  const [fontSize, setFontSize] = useState("16");
  const [headingFontSize, setHeadingFontSize] = useState("32");

  const handleUpdateColors = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _mergeStrategy: "deep",
          brand: {
            colors: {
              primary: primaryColor,
              accent: accentColor,
            },
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("admin.wrongPassword"));
        } else if (response.status === 404) {
          throw new Error(t("messages.notFound"));
        } else {
          throw new Error(t("messages.backendError"));
        }
      }

      onSuccess?.(t("admin.colors.savedSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving colors:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ===== LAYOUT HANDLER =====
  const handleUpdateLayout = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}`;

      // WICHTIG: Sende nur die geänderten Felder mit _mergeStrategy flag
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _mergeStrategy: "deep", // Signal an Backend: Deep merge nur diese Felder
          layout: {
            hero: { enabled: showHero },
            menuSection: { enabled: showMenu },
            steps: { enabled: showSteps },
            gallery: { enabled: showGallery },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(t("messages.backendError"));
      }

      onSuccess?.(t("admin.layout.savedSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving layout:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ===== HERO IMAGE HANDLER =====
  const handleUpdateHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageUrl) {
      onError?.(t("admin.heroImage.required"));
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}`;

      // WICHTIG: Sende nur die geänderten Felder mit _mergeStrategy flag
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _mergeStrategy: "deep", // Signal an Backend: Deep merge nur diese Felder
          layout: {
            hero: {
              backgroundImage: heroImageUrl,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(t("messages.backendError"));
      }

      onSuccess?.(t("admin.heroImage.savedSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving hero image:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ===== TYPOGRAPHY HANDLER =====
  const handleUpdateTypography = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5081";
      const adminKey = import.meta.env.VITE_ADMIN_KEY || "dev-admin-key";

      const endpoint = `${apiUrl}/api/v1/admin/sites/${tenantSlug}`;

      // WICHTIG: Sende nur die geänderten Felder mit _mergeStrategy flag
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _mergeStrategy: "deep", // Signal an Backend: Deep merge nur diese Felder
          brand: {
            fontFamily,
            headingFontFamily,
            fontSizeBody: parseInt(fontSize),
            fontSizeHeading: parseInt(headingFontSize),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(t("messages.backendError"));
      }

      onSuccess?.(t("admin.typography.savedSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("Error saving typography:", err);
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin-Panel</h1>
        <p>Restaurant: <strong>{tenantSlug}</strong></p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        <button
          className={activeTab === "dishes" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("dishes")}
        >
          {t("admin.tabs.dishes")}
        </button>
        <button
          className={activeTab === "hero" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("hero")}
        >
          {t("admin.tabs.hero")}
        </button>
        <button
          className={activeTab === "colors" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("colors")}
        >
          {t("admin.tabs.colors")}
        </button>
        <button
          className={activeTab === "layout" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("layout")}
        >
          {t("admin.tabs.layout")}
        </button>
        <button
          className={activeTab === "heroImage" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("heroImage")}
        >
          {t("admin.tabs.heroImage")}
        </button>
        <button
          className={activeTab === "typography" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("typography")}
        >
          {t("admin.tabs.typography")}
        </button>
      </div>

      {/* TAB 1: GERICHTE */}
      {activeTab === "dishes" && (
        <div className="admin-tab-content">
          <h2>{t("admin.dishes.title")}</h2>
          
          <form onSubmit={handleAddOrUpdateDish} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t("admin.dishes.category")} *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">{t("admin.dishes.selectCategory")}</option>
                  {siteData?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t("admin.dishes.name")} *</label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="z.B. Margherita"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t("admin.dishes.price")} ({siteData?.tenant.currency || "EUR"}) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  placeholder="z.B. 9.50"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t("admin.dishes.image")}</label>
                <input
                  type="url"
                  value={dishImage}
                  onChange={(e) => setDishImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("admin.dishes.description")}</label>
              <textarea
                value={dishDescription}
                onChange={(e) => setDishDescription(e.target.value)}
                placeholder="z.B. Tomato, Mozzarella, Basil"
                maxLength={200}
              />
              <small>{dishDescription.length}/200 {t("admin.hero.chars")}</small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                {t("admin.dishes.available")}
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading
                  ? t("common.save") + "..."
                  : editingItemId
                  ? t("admin.dishes.edit")
                  : t("admin.dishes.addNew")}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={resetDishForm}
                  className="btn-secondary"
                >
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </form>

          {dishImage && (
            <div className="image-preview">
              <h3>{t("admin.colors.preview")}:</h3>
              <img
                src={dishImage}
                alt="Preview"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='200'%3E%3Crect fill='%23ddd' width='280' height='200'/%3E%3C/svg%3E";
                }}
                style={{ maxWidth: "280px", maxHeight: "200px" }}
              />
            </div>
          )}

          <div className="dishes-container">
            <h3>{t("admin.dishes.title")}:</h3>
            {siteData?.categories.map((cat: MenuCategory) => (
              <div key={cat.id} className="category-section">
                <h4>{cat.name}</h4>
                {cat.items && cat.items.length > 0 ? (
                  <div className="dishes-grid">
                    {cat.items.map((item: MenuItem) => (
                      <div key={item.id} className="dish-card">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='200'%3E%3Crect fill='%23ddd' width='280' height='200'/%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="dish-placeholder">{t("admin.dishes.noDescription")}</div>
                        )}
                        <div className="dish-info">
                          <h5>{item.name}</h5>
                          <p className="dish-price">
                            {item.price.toFixed(2)} {siteData?.tenant.currency || "EUR"}
                          </p>
                          {item.description && (
                            <p className="dish-description">{item.description}</p>
                          )}
                          <div className="dish-status">
                            {item.isAvailable ? (
                              <span className="badge-available">{t("admin.dishes.available")}</span>
                            ) : (
                              <span className="badge-unavailable">{t("admin.dishes.unavailable")}</span>
                            )}
                          </div>
                        </div>
                        <div className="dish-actions">
                          <button
                            onClick={() => handleEditDish(item)}
                            className="btn-edit"
                          >
                            {t("admin.dishes.edit")}
                          </button>
                          <button
                            onClick={() => handleDeleteDish(item.id, item.name)}
                            className="btn-delete"
                          >
                            {t("admin.dishes.delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items">{t("admin.dishes.title")}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HERO */}
      {activeTab === "hero" && (
        <div className="admin-tab-content">
          <h2>{t("admin.hero.title")}</h2>
          <form onSubmit={handleUpdateHero} className="admin-form">
            <div className="form-group">
              <label>{t("admin.hero.badgeLabel")} *</label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                placeholder="z.B. Bienvenue chez Le #1 French Tacos"
                maxLength={80}
                required
              />
              <small>{heroBadge.length}/80 {t("admin.hero.chars")}</small>
            </div>

            <div className="form-group">
              <label>{t("admin.hero.titleLabel")} *</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="z.B. Die besten Pizzas in Berlin"
                maxLength={60}
                required
              />
              <small>{heroTitle.length}/60 {t("admin.hero.chars")}</small>
            </div>

            <div className="form-group">
              <label>{t("admin.hero.descriptionLabel")} *</label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="z.B. Handgemachte Pizzas mit italienischen Zutaten"
                maxLength={150}
                required
              />
              <small>{heroDescription.length}/150 {t("admin.hero.chars")}</small>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("common.save") + "..." : t("common.save")}
            </button>
          </form>

          <div className="admin-preview">
            <h3>{t("admin.colors.preview")}:</h3>
            <div className="preview-hero">
              <p className="preview-badge">{heroBadge || t("admin.hero.previewBadge")}</p>
              <h2>{heroTitle || t("admin.hero.previewTitle")}</h2>
              <p>{heroDescription || t("admin.hero.previewDescription")}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FARBEN */}
      {activeTab === "colors" && (
        <div className="admin-tab-content">
          <h2>{t("admin.colors.title")}</h2>
          <form onSubmit={handleUpdateColors} className="admin-form">
            <div className="form-group">
              <label>{t("admin.colors.primary")}</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#0066FF"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t("admin.colors.accent")}</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#FF0000"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("common.save") + "..." : t("admin.colors.savedSuccess")}
            </button>
          </form>

          <div className="admin-preview">
            <h3>{t("admin.colors.preview")}:</h3>
            <div
              className="preview-colors"
              style={
                {
                  "--preview-primary": primaryColor,
                  "--preview-accent": accentColor,
                } as React.CSSProperties
              }
            >
              <button style={{ backgroundColor: primaryColor, color: "white" }}>
                {t("admin.colors.buttonPrimary")}
              </button>
              <button style={{ backgroundColor: accentColor, color: "white" }}>
                {t("admin.colors.buttonAccent")}
              </button>
              <div
                style={{
                  backgroundColor: primaryColor,
                  height: "40px",
                  borderRadius: "4px",
                }}
              >
                {t("admin.colors.headerPreview")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAYOUT */}
      {activeTab === "layout" && (
        <div className="admin-tab-content">
          <h2>{t("admin.layout.title")}</h2>
          <form onSubmit={handleUpdateLayout} className="admin-form">
            <p className="form-description">{t("admin.layout.description")}</p>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showHero}
                  onChange={(e) => setShowHero(e.target.checked)}
                />
                {t("admin.layout.showHero")}
              </label>
              <small>{t("admin.layout.heroDescription")}</small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showMenu}
                  onChange={(e) => setShowMenu(e.target.checked)}
                />
                {t("admin.layout.showMenu")}
              </label>
              <small>{t("admin.layout.menuDescription")}</small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                />
                {t("admin.layout.showSteps")}
              </label>
              <small>{t("admin.layout.stepsDescription")}</small>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showGallery}
                  onChange={(e) => setShowGallery(e.target.checked)}
                />
                {t("admin.layout.showGallery")}
              </label>
              <small>{t("admin.layout.galleryDescription")}</small>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("common.save") + "..." : t("common.save")}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: HERO IMAGE */}
      {activeTab === "heroImage" && (
        <div className="admin-tab-content">
          <h2>{t("admin.heroImage.title")}</h2>
          <form onSubmit={handleUpdateHeroImage} className="admin-form">
            <div className="form-group">
              <label>{t("admin.heroImage.imageUrl")} *</label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://..."
                required
              />
              <small>{t("admin.heroImage.urlDescription")}</small>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("common.save") + "..." : t("common.save")}
            </button>
          </form>

          {heroImageUrl && (
            <div className="image-preview">
              <h3>{t("admin.colors.preview")}:</h3>
              <img
                src={heroImageUrl}
                alt="Hero Preview"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23ddd' width='800' height='400'/%3E%3Ctext x='50%' y='50%' font-size='20' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage Error%3C/text%3E%3C/svg%3E";
                }}
                style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 6: TYPOGRAPHIE */}
      {activeTab === "typography" && (
        <div className="admin-tab-content">
          <h2>{t("admin.typography.title")}</h2>
          <form onSubmit={handleUpdateTypography} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t("admin.typography.bodyFont")}</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t("admin.typography.headingFont")}</label>
                <select
                  value={headingFontFamily}
                  onChange={(e) => setHeadingFontFamily(e.target.value)}
                >
                  <option value="Poppins">Poppins</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t("admin.typography.bodySize")} (px)</label>
                <input
                  type="number"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("admin.typography.headingSize")} (px)</label>
                <input
                  type="number"
                  min="24"
                  max="64"
                  value={headingFontSize}
                  onChange={(e) => setHeadingFontSize(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t("common.save") + "..." : t("common.save")}
            </button>
          </form>

          <div className="admin-preview">
            <h3>{t("admin.colors.preview")}:</h3>
            <div
              className="preview-typography"
              style={
                {
                  "--preview-font": fontFamily,
                  "--preview-heading-font": headingFontFamily,
                  "--preview-body-size": fontSize + "px",
                  "--preview-heading-size": headingFontSize + "px",
                } as React.CSSProperties
              }
            >
              <p style={{ fontSize: fontSize + "px", fontFamily }}>{t("admin.typography.bodyExample")}</p>
              <h2 style={{ fontSize: headingFontSize + "px", fontFamily: headingFontFamily }}>{t("admin.typography.headingExample")}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
