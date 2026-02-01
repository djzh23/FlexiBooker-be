import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./AdminGate.css";

interface AdminGateProps {
  onUnlock: () => void;
  adminKey: string;
}

export function AdminGate({ onUnlock, adminKey }: AdminGateProps) {
  const { t } = useTranslation();
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey === adminKey) {
      setError("");
      setIsLocked(false);
      onUnlock();
    } else {
      setError(`❌ ${t("admin.wrongPassword")}`);
      setInputKey("");
    }
  };

  if (!isLocked) {
    return null; // Admin-Panel wird angezeigt
  }

  return (
    <div className="admin-gate-overlay">
      <div className="admin-gate-card">
        <div className="admin-gate-header">
          <h1>🔐 {t("admin.title")}</h1>
          <p>{t("admin.enterPassword")}</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-gate-form">
          <div className="form-group">
            <label>{t("admin.password")}</label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="z.B. dev-admin-key"
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="btn-unlock">
            🔓 {t("admin.login")}
          </button>
        </form>

        <div className="admin-gate-info">
          <p>
            <strong>{t("common.required")}:</strong> {t("messages.contactSupport")}
          </p>
        </div>
      </div>
    </div>
  );
}
