"use client";

import { ReactNode, useEffect, useRef } from "react";

export default function ScrollParallax({ children, strength = 16, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const center = rect.top + rect.height / 2;
      const delta = (center - vh / 2) / vh; // -0.5..0.5
      el.style.transform = `translateY(${(-delta * strength).toFixed(2)}px)`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ transition: "transform 240ms ease-out" }}>
      {children}
    </div>
  );
}


