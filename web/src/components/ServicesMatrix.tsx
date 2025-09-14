import Link from "next/link";

const items = [
  { title: "Allenamento + Alimentazione", desc: "Percorso completo con check", href: "/services/allenamento-e-alimentazione" },
  { title: "Solo Allenamento", desc: "Programmi progressivi su misura", href: "/services/solo-allenamento" },
  { title: "Solo Alimentazione", desc: "Piani nutrizionali personalizzati", href: "/services/solo-alimentazione" },
  { title: "PT Premium", desc: "Coach dedicato e supporto priority", href: "/services/fitness-coaching-premium" },
];

export default function ServicesMatrix() {
  return (
    <section>
      <h2 className="heading-display text-2xl md:text-3xl text-foreground">Percorsi e servizi</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]">
            <p className="font-semibold text-foreground">{it.title}</p>
            <p className="text-sm text-muted">{it.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}


