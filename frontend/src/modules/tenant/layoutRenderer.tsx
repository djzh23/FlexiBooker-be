import React from "react";
import { useTranslation } from "react-i18next";
import type { LayoutConfig, HeroConfig, MenuSectionConfig, StepsConfig, GalleryConfig } from "./tenant.types";

type MenuDisplayItem = { name: string; price: number; description: string; image: string; tags: string[] };
type MenuDisplayCategory = { id?: string; name: string; items: MenuDisplayItem[] };

type LayoutRendererProps = {
  layout?: LayoutConfig;
  menuCategories?: MenuDisplayCategory[];
};

/**
 * Hero/Banner Section - wird von JSON konfiguriert
 * WICHTIG: Übersetzungen haben VORRANG vor Backend-Config!
 * Backend-Werte sind nur Custom-Überschreibungen für specific Restaurants
 */
export function HeroSection({ config }: { config?: HeroConfig }) {
  const { t } = useTranslation();
  
  if (!config?.enabled) return null;

  // ✅ Translation zuerst, dann Backend-Config als Fallback für Custom-Werte
  const badge = t("layout.hero.badge", { defaultValue: config.badge });
  const title = t("layout.hero.title", { defaultValue: config.title });
  const description = t("layout.hero.description", { defaultValue: config.description });
  const cta1Label = t("layout.hero.cta1", { defaultValue: config.cta1?.label });
  const cta2Label = t("layout.hero.cta2", { defaultValue: config.cta2?.label });

  return (
    <div className="sample-hero">
      <div className="sample-hero__content">
        {badge && <span className="sample-badge">{badge}</span>}
        {title && (
          <h1>
            {title.split("#").map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>#</span>}
                {part}
              </React.Fragment>
            ))}
          </h1>
        )}
        {description && <p>{description}</p>}

        {(config.cta1 || config.cta2) && (
          <div className="sample-hero__cta">
            {config.cta1 && <button type="button" className="primary">{cta1Label}</button>}
            {config.cta2 && <button type="button" className="ghost">{cta2Label}</button>}
          </div>
        )}

        {config.stats && config.stats.length > 0 && (
          <ul className="sample-hero__stats">
            {config.stats.map((stat, i) => (
              <li key={i}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {config.backgroundImage && (
        <div className="sample-hero__image">
          <img src={config.backgroundImage} alt="Hero" loading="lazy" />
        </div>
      )}
    </div>
  );
}

/**
 * Menu Cards Section - nutzt echte Menu-Items vom Backend
 * WICHTIG: Übersetzungen haben VORRANG vor Backend-Config!
 */
export function MenuSection({ config, categories }: { config?: MenuSectionConfig; categories?: MenuDisplayCategory[] }) {
  const { t } = useTranslation();
  
  if (!config?.enabled || !categories || categories.length === 0) return null;

  // ✅ Translation zuerst, dann Backend-Config als Fallback
  const badge = t("layout.menu.badge", { defaultValue: config.badge });
  const title = t("layout.menu.title", { defaultValue: config.title });
  const description = t("layout.menu.description", { defaultValue: config.description });

  return (
    <div className="sample-section">
      <div className="sample-section__header">
        {badge && <p className="sample-badge">{badge}</p>}
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </div>
      {categories.map((cat) => (
        <section key={cat.id ?? cat.name} className="sample-category">
          <h3 className="sample-category__title">{cat.name}</h3>
          <div className="sample-menu__grid">
            {cat.items.map((item) => (
              <article key={item.name} className="sample-card">
                <div className="sample-card__image">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="sample-card__body">
                  <div className="sample-card__top">
                    <h4>{item.name}</h4>
                    <span className="sample-price">{item.price} MAD</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="sample-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * WICHTIG: Übersetzungen haben VORRANG vor Backend-Config!
 */
export function StepsSection({ config }: { config?: StepsConfig }) {
  const { t } = useTranslation();
  
  if (!config?.enabled || !config.steps || config.steps.length === 0) return null;

  // ✅ Translation zuerst, dann Backend-Config als Fallback
  const badge = t("layout.steps.badge", { defaultValue: config.badge });
  const title = t("layout.steps.title", { defaultValue: config.title });

  return (
    <div className="sample-section">
      <div className="sample-section__header">
        {badge && <p className="sample-badge">{badge}</p>}
        {title && <h2>{title}</h2>}
      </div>
      <div className="sample-steps__grid">
        {config.steps.map((step) => (
          <article key={step.title} className="sample-step">
            <span className="sample-step__index">{step.title}</span>
            <h3>{step.subtitle}</h3>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * WICHTIG: Übersetzungen haben VORRANG vor Backend-Config!
 */
export function GallerySection({ config }: { config?: GalleryConfig }) {
  const { t } = useTranslation();
  
  if (!config?.enabled || !config.images || config.images.length === 0) return null;

  // ✅ Translation zuerst, dann Backend-Config als Fallback
  const badge = t("layout.gallery.badge", { defaultValue: config.badge });
  const title = t("layout.gallery.title", { defaultValue: config.title });

  return (
    <div className="sample-section sample-gallery">
      <div className="sample-section__header">
        {badge && <p className="sample-badge">{badge}</p>}
        {title && <h2>{title}</h2>}
      </div>
      <div className="sample-gallery__grid">
        {config.images.map((src, index) => (
          <figure key={src}>
            <img src={src} alt={`Gallery ${index + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Layout Renderer - orchestriert alle Sections basierend auf JSON-Config
 */
export function LayoutRenderer({ layout, menuCategories }: LayoutRendererProps) {
  if (!layout?.showSampleShowcase) {
    return null;
  }

  return (
    <section className="sample-shell">
      <HeroSection config={layout.hero} />
      <MenuSection config={layout.menuSection} categories={menuCategories} />
      <StepsSection config={layout.steps} />
      <GallerySection config={layout.gallery} />
    </section>
  );
}
