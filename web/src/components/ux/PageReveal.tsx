"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageReveal() {
  const pathname = usePathname();
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 page-reveal"
      onAnimationEnd={() => setVisible(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-500 to-brand-700 opacity-95" />
      <div className="absolute -inset-24 rotate-6 bg-white/10 blur-3xl" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="reveal-mark" />
      </div>
    </div>
  );
}


