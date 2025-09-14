"use client";

import { useState } from "react";
import Link from "next/link";

type Step = {
  key: string;
  title: string;
  desc: string;
};

const steps: Step[] = [
  { key: "goal", title: "Obiettivo", desc: "Dimagrimento, massa, performance" },
  { key: "diet", title: "Preferenze", desc: "Onnivora, veg, intolleranze" },
  { key: "time", title: "Tempo", desc: "3, 4 o 5 giorni a settimana" },
  { key: "coach", title: "Coach", desc: "Abbina il personal trainer ideale" },
];

export default function WizardTeaser() {
  const [active, setActive] = useState<number>(0);
  return (
    <section className="rounded-[var(--radius-lg)] bg-gradient-to-br from-brand-50 to-surface dark:from-brand-900/20 dark:to-surface p-6 sm:p-8 shadow-[var(--shadow-lg)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-display text-3xl md:text-4xl text-foreground">
            Crea il tuo piano intelligente
          </h2>
          <p className="mt-3 text-muted">
            Un teaser del nostro percorso guidato: in 60 secondi ottieni una proposta personalizzata su dieta e allenamento.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/services" className="btn btn-primary">Inizia ora</Link>
            <Link href="/products" className="btn btn-secondary">Scopri lo shop</Link>
          </div>
        </div>
        <div className="relative flex-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {steps.map((s, idx) => (
              <button
                key={s.key}
                onClick={() => setActive(idx)}
                className={`group rounded-2xl border border-border bg-surface/80 p-4 text-left shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] ${active===idx?"ring-2 ring-brand-500/50":""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 shrink-0 rounded-full transition-colors ${active===idx?"bg-brand-600":"bg-surface-2"}`} />
                  <div>
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted">{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="pointer-events-none mt-4 rounded-2xl border border-dashed border-brand-300/70 bg-surface/60 p-4 text-sm text-muted">
            Suggerimento: {steps[active].title} — {steps[active].desc}
          </div>
        </div>
      </div>
    </section>
  );
}


