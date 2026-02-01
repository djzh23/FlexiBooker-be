import { useState, useEffect } from "react";
import { AdminGate } from "./AdminGate";
import { AdminPanel } from "./AdminPanel";
import type { SiteResponse } from "../tenant/tenant.types";

interface AdminAccessProps {
  tenantSlug: string;
  adminKey: string;
  currentSite?: SiteResponse;
}

export function AdminAccess({ tenantSlug, adminKey, currentSite }: AdminAccessProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-clear notifications nach 4 Sekunden
  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  return (
    <div>
      {!isUnlocked && <AdminGate onUnlock={() => setIsUnlocked(true)} adminKey={adminKey} />}

      {isUnlocked && (
        <>
          {notification && (
            <div
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                padding: "15px 20px",
                background: notification.type === "success" ? "#4caf50" : "#f44336",
                color: "white",
                borderRadius: "4px",
                zIndex: 10000,
                maxWidth: "400px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {notification.message}
            </div>
          )}

          <AdminPanel
            tenantSlug={tenantSlug}
            currentSite={currentSite}
            onSuccess={(msg) => setNotification({ type: "success", message: msg })}
            onError={(err) => setNotification({ type: "error", message: err })}
          />
        </>
      )}
    </div>
  );
}
