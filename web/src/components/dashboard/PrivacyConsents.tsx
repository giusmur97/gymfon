export default function PrivacyConsents() {
  const consents = [
    { id: "privacy", label: "Privacy Policy", status: "ok", date: "2025-01-10" },
    { id: "responsibility", label: "Dichiarazione di responsabilità", status: "ok", date: "2025-01-10" },
    { id: "marketing", label: "Consenso marketing", status: "no", date: undefined },
  ];

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-medium">Privacy e Consensi</h3>
      <div className="rounded-2xl border border-border divide-y divide-border bg-card">
        {consents.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.date ? `Firmato il ${c.date}` : "Non firmato"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'ok' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'}`}>{c.status === 'ok' ? 'Completo' : 'Mancante'}</span>
              <a className="btn btn-outline btn-sm" href="#">Scarica</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


