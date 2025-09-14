"use client";

import { useState } from "react";

export default function Questionnaire() {
  const [open, setOpen] = useState<null | string>(null);

  const sections = [
    { id: "generali", title: "Informazioni generali", fields: ["Professione", "Stile di vita", "Qualità sonno", "Turni di lavoro"] },
    { id: "sportiva", title: "Anamnesi sportiva", fields: ["Esperienze", "Tipo allenamento", "Esperienze con PT"] },
    { id: "fisiologica", title: "Anamnesi fisiologica", fields: ["Intestino", "Ciclo", "Acqua", "Fumo/Alcool"] },
    { id: "patologica", title: "Anamnesi patologica e allergie", fields: ["Patologie", "DCA", "Traumi/Interventi", "Farmaci", "Allergie"] },
  ];

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Questionario & Anamnesi</h3>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {sections.map((s) => (
          <details key={s.id} className="group" open={open === s.id} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open ? s.id : null)}>
            <summary className="list-none cursor-pointer select-none p-4 flex items-center justify-between">
              <span className="font-medium">{s.title}</span>
              <span className="i-heroicons-chevron-down-20-solid text-muted transition-transform group-open:rotate-180" />
            </summary>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = Object.fromEntries(new FormData(form).entries());
                const clientId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : '';
                const sectionMap: Record<string, string> = {
                  generali: 'personalInfo',
                  sportiva: 'sportsHistory',
                  fisiologica: 'physiologicalHistory',
                  patologica: 'pathologicalHistory',
                };
                const sectionKey = sectionMap[s.id];
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/clients/${clientId}/profile/${sectionKey}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) throw new Error('Errore salvataggio');
                  alert('Sezione salvata');
                } catch (e) {
                  console.error(e);
                  alert('Errore durante il salvataggio');
                }
              }}
              className="p-4 grid gap-3 sm:grid-cols-2"
            >
              {s.fields.map((f) => (
                <label key={f} className="grid gap-1">
                  <span className="text-xs text-muted-foreground">{f}</span>
                  <input name={f} className="input" placeholder="Compila..." />
                </label>
              ))}
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary">Salva</button>
              </div>
            </form>
          </details>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Dichiarazioni di responsabilità e privacy già sottoscritte disponibili nell'area documenti.</p>
    </section>
  );
}


