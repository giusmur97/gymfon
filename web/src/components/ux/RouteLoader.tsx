"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    setProgress(10);
    const t1 = setTimeout(() => setProgress(60), 120);
    const t2 = setTimeout(() => setProgress(85), 360);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setProgress(100);
      const tDone = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 260);
      return () => clearTimeout(tDone);
    }, 600);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[var(--gold-500)] via-[var(--color-brand-500)] to-[var(--gold-400)] shadow-[0_0_12px_rgba(47,109,210,0.6)]"
        style={{ width: `${progress}%`, transition: "width 240ms ease" }}
      />
    </div>
  );
}


