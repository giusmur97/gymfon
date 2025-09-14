"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type MediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp?: string;
};

export default function FitRecipes({ limit = 8 }: { limit?: number }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`/api/instagram?limit=${limit}`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
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

  if (items === null) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-surface-2 animate-pulse" />)
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted">
        {error ? (
          <p>Non riesco a caricare le ricette ora. Prova più tardi.</p>
        ) : (
          <p>
            Nessuna ricetta trovata al momento. Apri il profilo Instagram per vedere i post: {" "}
            <a className="link" href="https://www.instagram.com/gi__erre__/" target="_blank" rel="noreferrer noopener">@gi__erre__</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <a
          key={it.id}
          href={it.permalink}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface"
        >
          <Image
            src={it.media_type === "VIDEO" ? (it.thumbnail_url || it.media_url) : it.media_url}
            alt={truncate(it.caption || "Ricetta" , 100)}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {it.media_type === "VIDEO" && (
            <span className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-[10px] text-foreground dark:bg-black/60 bg-white/80">VIDEO</span>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t dark:from-black/60 from-white/80 to-transparent p-3">
            <p className="line-clamp-2 text-xs text-foreground">{truncate(it.caption || "", 100)}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
