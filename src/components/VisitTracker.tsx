// EL FASL — Visit tracker: counts each real visitor once per browser session
// (one row per visitor per day in site_visits). Random id only, no personal
// data. Silent on any failure — tracking must never break the page.
"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("el-fasl-visit-tracked")) return;
      let visitorId = localStorage.getItem("el-fasl-visitor-id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("el-fasl-visitor-id", visitorId);
      }
      sessionStorage.setItem("el-fasl-visit-tracked", "1");
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, path: window.location.pathname }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Tracking is best-effort; ignore storage/network errors.
    }
  }, []);
  return null;
}
