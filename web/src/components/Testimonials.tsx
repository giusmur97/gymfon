type Testimonial = { name: string; text: string; role?: string };

const data: Testimonial[] = [
  { name: "Valentina", role: "Percorso dimagrimento", text: "Ho perso 7kg in 10 settimane, senza rinunciare alla vita sociale." },
  { name: "Marco", role: "PT Premium", text: "Piani precisi e progressi misurabili: performance in salita ogni mese." },
  { name: "Luca", role: "Massa pulita", text: "Ricette smart e integrazione mirata: +4kg con ottimo shape." },
];

export default function Testimonials() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-surface to-brand-50/40 dark:to-brand-900/10 p-6 sm:p-8 shadow-[var(--shadow-md)]">
      <h2 className="heading-display text-2xl md:text-3xl text-foreground">Storie reali</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data.map((t) => (
          <figure key={t.name} className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
            <blockquote className="text-foreground">&ldquo;{t.text}&rdquo;</blockquote>
            <figcaption className="mt-3 text-sm text-muted">{t.name} · {t.role}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}