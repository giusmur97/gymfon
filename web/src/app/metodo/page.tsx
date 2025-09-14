export default function Page() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="heading-display text-3xl text-foreground">Metodo & Risultati</h1>
        <p className="mt-3 text-muted max-w-3xl">
          Un metodo basato su sicurezza, personalizzazione e progressività. Monitoriamo i tuoi
          progressi con strumenti semplici e dati chiari per ottimizzare ogni ciclo di lavoro.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Analisi iniziale</p>
          <p className="mt-1 font-semibold text-foreground">Obiettivi e anamnesi</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Programmazione</p>
          <p className="mt-1 font-semibold text-foreground">Piani su misura e progressività</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Monitoraggio</p>
          <p className="mt-1 font-semibold text-foreground">Check, adattamenti e risultati</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-foreground">Strumenti tecnologici</h2>
        <ul className="mt-2 text-sm text-muted space-y-1 list-disc list-inside">
          <li>App per programmi e check-in</li>
          <li>AI per generare ricette e ottimizzare i piani</li>
          <li>Report di avanzamento e statistiche di successo</li>
        </ul>
      </section>
    </div>
  );
}


