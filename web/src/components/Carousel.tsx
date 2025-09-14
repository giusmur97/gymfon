"use client";

import { useEffect, useRef, useState } from "react";
import Tilt from "@/components/Tilt";
import Image from "next/image";

type Item = { id: number; title: string; subtitle: string; price?: string; imageUrl?: string };

export default function Carousel({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const [paused, setPaused] = useState(false);

  // Auto-advance only when visible and not paused
  useEffect(() => {
    if (!inView || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, [items.length, inView, paused]);

  // Detect visibility in viewport to avoid page jumping when out of view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setInView(e.isIntersecting));
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Smooth horizontal centering without affecting page vertical scroll
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;
    const childCenter = child.offsetLeft + child.offsetWidth / 2;
    const target = Math.max(0, childCenter - container.clientWidth / 2);
    container.scrollTo({ left: target, behavior: "smooth" });
  }, [index]);

  return (
    <div>
      <div
        ref={ref}
        className="flex snap-x gap-4 overflow-x-auto pb-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {items.map((it) => (
          <Tilt key={it.id} className="snap-center shrink-0 w-72">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] card-motion">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-2 relative">
                {it.imageUrl ? (
                  <Image
                    src={it.imageUrl}
                    alt={it.title}
                    fill
                    sizes="(max-width: 768px) 70vw, 288px"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
              <div className="mt-3">
                <p className="font-semibold text-foreground">{it.title}</p>
                <p className="text-sm text-muted">{it.subtitle}</p>
                {it.price && <p className="mt-1 text-sm font-semibold text-brand-700">{it.price}</p>}
              </div>
            </div>
          </Tilt>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 w-2 rounded-full ${i===index?"bg-brand-600":"bg-border"}`} />
        ))}
      </div>
    </div>
  );
}


