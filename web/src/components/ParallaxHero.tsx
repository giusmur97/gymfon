"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MagneticButton from "@/components/ux/MagneticButton";
import AnimatedGradientText from "@/components/ux/AnimatedGradientText";

export default function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Detect optional local assets so the component degrades gracefully if they don't exist
  useEffect(() => {
    let cancelled = false;
    async function checkVideo() {
      try {
        const res = await fetch("/hero.mp4", { method: "HEAD" });
        if (!cancelled) setHasVideo(res.ok);
      } catch {
        if (!cancelled) setHasVideo(false);
      }
    }
    checkVideo();
    return () => {
      cancelled = true;
    };
  }, []);

  // Parallax micro-interaction
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", String(x));
      el.style.setProperty("--my", String(y));
    }
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Keep video element state in sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
    if (isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isMuted, isPlaying]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-b from-brand-50 to-surface dark:from-brand-900/20 dark:to-surface p-8 sm:p-12 shadow-[var(--shadow-lg)]"
      style={{
        perspective: "1000px",
      }}
    >
      {/* Media background layer */}
      <div className="absolute inset-0 -z-10">
        {hasVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/hero.jpg"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-center bg-cover"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80)',
            }}
            aria-hidden
          />
        )}
        {/* Readability gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent dark:from-black/50" />
      </div>

      {/* Ambient blobs (kept, but toned down behind overlay) */}
      <div className="absolute inset-0 -z-10 opacity-60" aria-hidden>
        <div
          className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-brand-200 blur-3xl"
          style={{
            transform:
              "translate3d(calc(var(--mx,0)*10px), calc(var(--my,0)*-10px), 0)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-accent-500/40 blur-3xl"
          style={{
            transform:
              "translate3d(calc(var(--mx,0)*-16px), calc(var(--my,0)*14px), 0)",
          }}
        />
      </div>

      {/* Controls */}
      {hasVideo && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <button
            className="btn btn-secondary px-3 py-2"
            onClick={() => setIsMuted((v) => !v)}
            aria-label={isMuted ? "Attiva audio" : "Disattiva audio"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            className="btn btn-secondary px-3 py-2"
            onClick={() => setIsPlaying((v) => !v)}
            aria-label={isPlaying ? "Metti in pausa" : "Riproduci"}
          >
            {isPlaying ? "⏸" : "▶️"}
          </button>
        </div>
      )}

      <div
        className="relative will-change-transform"
        style={{
          transform:
            "rotateX(calc(var(--my,0)*6deg)) rotateY(calc(var(--mx,0)*-8deg))",
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ transform: "translateZ(40px)" }}>
          <h1 className="heading-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground">
            <AnimatedGradientText>
              Trasforma il tuo corpo, cambia la tua vita. Inizia oggi!
            </AnimatedGradientText>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl">
            Allenamenti e piani alimentari personalizzati, supervisione professionale. Online o dal vivo, con metodo e risultati misurabili.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <MagneticButton className="btn btn-primary">
              <Link href="/services">Scopri i programmi</Link>
            </MagneticButton>
            <MagneticButton className="btn btn-secondary">
              <Link href="/contatti">Prenota la tua consulenza</Link>
            </MagneticButton>
          </div>
        </div>

        <div
          className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
          style={{ transform: "translateZ(20px)" }}
        >
          {[
            ["Allenamento", "Progressivo e misurabile"],
            ["Alimentazione", "Ricette e piani smart"],
            ["Shop", "Prodotti selezionati"],
            ["Eventi", "Coaching Day"],
          ].map(([t, s]) => (
            <div key={t} className="glass rounded-2xl p-4">
              <p className="text-sm text-muted">{t}</p>
              <p className="mt-1 font-semibold text-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


