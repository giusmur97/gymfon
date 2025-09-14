"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type Step = {
  title: string;
  body: string;
};

export default function Scrolly({
  steps,
  renderVisual,
}: {
  steps: Step[];
  renderVisual: (activeIndex: number) => ReactNode;
}) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, idx) => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(idx);
          });
        },
        { root: null, threshold: 0.6 }
      );
      if (el) io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [steps.length]);

  return (
    <div ref={containerRef} className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="sticky top-20 h-[70vh] rounded-[var(--radius-lg)] border border-border bg-white p-4 shadow-[var(--shadow-md)]">
        <div className="h-full w-full overflow-hidden rounded-[var(--radius-md)] bg-surface-2">
          {renderVisual(active)}
        </div>
      </div>
      <div className="space-y-[60vh]">
        {steps.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) stepRefs.current[i] = el;
            }}
            className={`rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-sm)] ${
              active === i ? "bg-brand-50 border-brand-200" : "bg-white border-border"
            }`}
          >
            <h3 className="heading-display text-2xl text-slate-900">{s.title}</h3>
            <p className="mt-2 text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


