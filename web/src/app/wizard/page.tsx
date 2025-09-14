"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Step = {
  key: string;
  title: string;
  options: string[];
};

const steps: Step[] = [
  { key: "goal", title: "Obiettivo", options: ["Dimagrimento", "Massa", "Performance"] },
  { key: "diet", title: "Preferenze alimentari", options: ["Onnivora", "Vegetariana", "Vegana", "Intolleranze"] },
  { key: "days", title: "Giorni di allenamento", options: ["3 giorni", "4 giorni", "5 giorni"] },
  { key: "coach", title: "Supporto coach", options: ["Base", "Plus", "Premium"] },
];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = steps[step];
  const progress = useMemo(() => Math.round(((step) / (steps.length)) * 100), [step]);

  function selectOption(opt: string) {
    setAnswers((a) => ({ ...a, [current.key]: opt }));
  }

  const isLast = step === steps.length - 1;

  return (
    <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-brand-600" style={{ width: `${progress}%` }} />
        </div>

        <h1 className="heading-display text-3xl">{current.title}</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => selectOption(opt)}
              className={`rounded-xl border p-4 text-left shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] ${answers[current.key]===opt?"border-brand-600 bg-brand-50 dark:bg-brand-900/20":"border-border bg-surface hover:bg-surface-2"}`}
            >
              <p className="font-medium text-slate-900">{opt}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button disabled={step===0} onClick={() => setStep((s) => Math.max(0, s-1))} className="btn btn-secondary disabled:opacity-50">Indietro</button>
          {!isLast ? (
            <button onClick={() => setStep((s) => Math.min(steps.length-1, s+1))} className="btn btn-primary">Avanti</button>
          ) : (
            <Link href={{ pathname: "/services", query: answers }} className="btn btn-primary">Vedi il tuo piano</Link>
          )}
        </div>
      </div>

      <aside className="rounded-[var(--radius-lg)] border border-border bg-white p-5 shadow-[var(--shadow-md)]">
        <h2 className="font-semibold text-slate-900">Anteprima del tuo piano</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div><span className="text-slate-500">Obiettivo:</span> {answers.goal ?? "–"}</div>
          <div><span className="text-slate-500">Preferenze:</span> {answers.diet ?? "–"}</div>
          <div><span className="text-slate-500">Allenamenti settimanali:</span> {answers.days ?? "–"}</div>
          <div><span className="text-slate-500">Supporto coach:</span> {answers.coach ?? "–"}</div>
        </div>
        <div className="mt-6 rounded-xl bg-surface-2 p-4 text-xs text-slate-600">
          Suggerimento dinamico: in base alle risposte, ti proporremo un mix di ricette e schede con progressione automatica e check mensili.
        </div>
      </aside>
    </div>
  );
}


