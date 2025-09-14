"use client";

import { useEffect, useRef, useState } from "react";
import TagembedWidget from "@/components/recipes/TagembedWidget";

type MediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp?: string;
};

export default function InstagramCarousel({ limit = 12, autoplayMs = 3500 }: { limit?: number; autoplayMs?: number }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const tagembedWidgetId = process.env.NEXT_PUBLIC_TAGEMBED_WIDGET_ID;

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/instagram?limit=${limit}`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setConfigured(Boolean(json?.configured));
        if (!res.ok) {
          setError(json?.error || "Errore nel caricamento");
          setItems([]);
          return;
        }
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e) {
        if (!alive) return;
        setError(String(e));
        setItems([]);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [limit]);

  useEffect(() => {
    if (paused || items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), autoplayMs);
    return () => clearInterval(id);
  }, [paused, items.length, autoplayMs]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (!slide) return;
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const target = Math.max(0, slideCenter - el.clientWidth / 2);
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [index]);

  if ((configured === false || items.length === 0) && tagembedWidgetId) {
    return <TagembedWidget widgetId={tagembedWidgetId} height={420} />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted">
        {error ? "Non riesco a caricare i post Instagram ora." : "Nessun post da mostrare al momento."}
      </div>
    );
  }

  return (
    <div className="instagram-carousel">
      <div
        className="flex gap-4 overflow-x-auto snap-x pb-2"
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {items.map((it) => (
          <a
            key={it.id}
            href={it.permalink}
            target="_blank"
            rel="noreferrer noopener"
            className="snap-center shrink-0 w-64"
          >
            <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-sm)] card-motion">
              <div className="relative aspect-square overflow-hidden rounded-t-xl">
                <img
                  src={it.media_type === "VIDEO" ? (it.thumbnail_url || it.media_url) : it.media_url}
                  alt={truncate(it.caption || "Post Instagram", 100)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-foreground dark:bg-black/60 bg-white/80">
                  <span className="i-logos-instagram-icon" aria-hidden />
                  <span>@gi__erre__</span>
                </div>
                {it.media_type === "VIDEO" && (
                  <span className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-[10px] text-foreground dark:bg-black/60 bg-white/80">VIDEO</span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-xs text-muted">{truncate(it.caption || "", 110)}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Vai alla slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-brand-600" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
