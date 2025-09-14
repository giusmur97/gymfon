"use client";

import { useEffect, useId } from "react";

export default function TagembedWidget({ widgetId, height = 360 }: { widgetId: string; height?: number }) {
  const uid = useId();
  useEffect(() => {
    if (!widgetId) return;
    const scriptId = "tagembed-embed-script";
    if (document.getElementById(scriptId)) return; // already loaded
    const s = document.createElement("script");
    s.id = scriptId;
    s.async = true;
    s.src = "https://widget.tagembed.com/embed.min.js";
    s.type = "text/javascript";
    document.body.appendChild(s);
    return () => {
      // keep script cached for navigation performance
    };
  }, [widgetId]);

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-3"
      style={{ minHeight: height }}
    >
      <div
        id={`tagembed-container-${uid}`}
        className="tagembed-widget"
        data-tagembed-widget={widgetId}
        style={{ width: "100%", minHeight: height - 24 }}
      />
    </div>
  );
}
