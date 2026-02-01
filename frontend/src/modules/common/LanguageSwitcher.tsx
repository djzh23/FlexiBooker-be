import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "en", name: t("common.english"), flag: "🇬🇧" },
    { code: "fr", name: t("common.french"), flag: "🇫🇷" },
    { code: "ar", name: t("common.darija"), flag: "🇲🇦" },
  ];

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`lang-button ${i18n.language === lang.code ? "active" : ""}`}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.name}
        >
          <span className="lang-flag">{lang.flag}</span>
          <span className="lang-code">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
