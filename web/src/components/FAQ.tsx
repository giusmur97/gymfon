type QA = { q: string; a: string };

const faqs: QA[] = [
  { q: "Come funziona il coaching online?", a: "Compili un questionario iniziale, pianifichiamo obiettivi e ricevi un programma personalizzato con check regolari e adattamenti in base ai tuoi progressi." },
  { q: "Quali sono i tempi di consegna dei piani?", a: "Il primo piano viene consegnato entro 3-5 giorni lavorativi dalla compilazione del questionario e valutazione iniziale." },
  { q: "Posso rateizzare?", a: "Sì, per pacchetti trimestrali e semestrali sono disponibili piani di pagamento rateizzati." },
  { q: "Che differenza c'è tra programma online e live?", a: "L'online prevede gestione via app e check da remoto; il live include sessioni in presenza con focus su tecnica, intensità e sicurezza, integrabili con un programma ibrido." },
  { q: "Come gestite sicurezza e privacy?", a: "Le schede sono costruite con principio di progressività e sicurezza; i dati sono trattati nel rispetto GDPR e accessibili solo al team autorizzato." },
];

export default function FAQ() {
  return (
    <section>
      <h1 className="heading-display text-2xl md:text-3xl text-foreground">Domande frequenti</h1>
      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {faqs.map((item, idx) => (
          <details key={idx} className="group">
            <summary className="list-none cursor-pointer select-none p-4 sm:p-5 flex items-center justify-between">
              <span className="font-medium text-foreground">{item.q}</span>
              <span className="i-heroicons-chevron-down-20-solid text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 sm:px-5 text-sm text-muted">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}


