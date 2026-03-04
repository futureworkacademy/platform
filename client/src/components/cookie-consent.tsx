import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

declare global {
  interface Window {
    "ga-disable-G-Y13X8BC4MW"?: boolean;
  }
}

const CONSENT_KEY = "fwa-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(CONSENT_KEY, "all");
    (window as Record<string, unknown>)["ga-disable-G-Y13X8BC4MW"] = false;
    if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=G-Y13X8BC4MW";
      document.head.appendChild(s);
      if (typeof window.gtag === "function") {
        window.gtag("js", new Date());
        window.gtag("config", "G-Y13X8BC4MW");
      }
    }
    setVisible(false);
  }

  function essentialOnly() {
    localStorage.setItem(CONSENT_KEY, "essential");
    (window as Record<string, unknown>)["ga-disable-G-Y13X8BC4MW"] = true;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t bg-card p-4 shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="banner-cookie-consent"
    >
      <div className="container mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            We use cookies for essential site functionality and analytics. You can accept all cookies or limit to essential-only.{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 text-foreground"
              data-testid="link-cookie-privacy"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={essentialOnly}
            data-testid="button-cookie-essential"
          >
            Essential Only
          </Button>
          <Button
            size="sm"
            onClick={acceptAll}
            data-testid="button-cookie-accept"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
