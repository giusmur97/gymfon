export default function Page() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="heading-display text-3xl text-foreground">Chi sono</h1>
        <p className="mt-3 text-muted max-w-3xl">
          Sono un Personal Trainer certificato, specializzato in ricomposizione corporea, forza e
          performance. La mia missione è aiutarti a costruire abitudini sostenibili per ottenere risultati
          concreti e duraturi, in modo sicuro e misurabile.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">Biografia & Visione</h2>
          <p className="mt-2 text-sm text-muted">
            Dopo anni tra palestra e studio, ho sviluppato un approccio che unisce scienza, esperienza e
            tecnologia. Credo nella personalizzazione, nella progressività e nel monitoraggio costante.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">Certificazioni</h2>
          <ul className="mt-2 text-sm text-muted space-y-1 list-disc list-inside">
            <li>PT Certificato (EPS/ASI o equivalente)</li>
            <li>Specializzazione in Strength & Conditioning</li>
            <li>Formazione in Nutrizione per lo Sport</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">Specializzazioni</h2>
          <ul className="mt-2 text-sm text-muted space-y-1 list-disc list-inside">
            <li>Ricomposizione corporea e dimagrimento</li>
            <li>Forza e bodybuilding</li>
            <li>Fitness funzionale e posturale</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">Collaborazioni</h2>
          <p className="mt-2 text-sm text-muted">
            Lavoro in rete con nutrizionisti e fisioterapisti per offrire un supporto completo e
            multidisciplinare quando necessario.
          </p>
        </div>
      </section>
    </div>
  );
}


