"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  const key = "mds_session_id";
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(key, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const payload = {
      path: pathname,
      search: window.location.search,
      sessionId: getSessionId(),
      referrer: document.referrer || null,
      source: params.get("utm_source") || params.get("source"),
      medium: params.get("utm_medium") || params.get("medium"),
      campaign: params.get("utm_campaign") || params.get("campaign"),
      device: window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    };

    const body = JSON.stringify(payload);
    try {
      const existing = window.sessionStorage.getItem("mds_attr");
      if (!existing || payload.source || payload.campaign) {
        window.sessionStorage.setItem(
          "mds_attr",
          JSON.stringify({
            source: payload.source,
            medium: payload.medium,
            campaign: payload.campaign,
            referrer: payload.referrer,
          }),
        );
      }
    } catch {
      /* storage unavailable */
    }
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/page", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track/page", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  }, [pathname]);

  return null;
}
