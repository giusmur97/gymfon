import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Online Starter",
    price: "€79/mese",
    description: "Programma personalizzato online con check mensile",
    features: [
      "Questionario iniziale e anamnesi",
      "Piano allenamento personalizzato",
      "Linee guida alimentari",
      "Check 1x/mese via app",
    ],
    ctaLabel: "Inizia ora",
    ctaHref: "/checkout",
  },
  {
    name: "Premium Coaching",
    price: "€149/mese",
    description: "Allenamento + nutrizione, supporto continuo",
    features: [
      "Piani allenamento e nutrizione",
      "Chat prioritaria e adattamenti settimanali",
      "Monitoraggio progressi e report",
      "Ricette fit generate via AI",
    ],
    ctaLabel: "Prenota consulenza",
    ctaHref: "/contatti",
    highlighted: true,
  },
  {
    name: "PT Live",
    price: "Da €45/sessione",
    description: "Sessioni dal vivo in palestra o a domicilio",
    features: [
      "Tecnica e sicurezza garantite",
      "Progressione su misura",
      "Body check periodici",
      "Programma ibrido live + online",
    ],
    ctaLabel: "Richiedi preventivo",
    ctaHref: "/contatti",
  },
];

export default function PricingTable() {
  return (
    <section>
      <h1 className="heading-display text-2xl md:text-3xl text-foreground">Prezzi e pacchetti</h1>
      <p className="mt-2 text-muted">Scegli il percorso che meglio si adatta ai tuoi obiettivi e al tuo stile di vita.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] ${tier.highlighted ? "ring-2 ring-brand-500" : ""}`}
          >
            <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">{tier.price}</p>
            <p className="mt-1 text-sm text-muted">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="i-heroicons-check-circle-20-solid text-brand-500 mt-0.5" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href={tier.ctaHref} className={`btn ${tier.highlighted ? "btn-primary" : "btn-secondary"}`}>{tier.ctaLabel}</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted">
        <p>
          Sconti per acquisto multiplo e possibilità di rateizzare su pacchetti trimestrali e semestrali. Garanzia soddisfatto o rimborsato entro 14 giorni per i piani online.
        </p>
      </div>
    </section>
  );
}


