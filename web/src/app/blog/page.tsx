export default function Page() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="heading-display text-3xl text-foreground">Blog & Risorse</h1>
        <p className="mt-3 text-muted max-w-3xl">
          Articoli su allenamento, nutrizione, mindset e lifestyle. Presto disponibili guide e video.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {[1,2,3].map((i) => (
          <article key={i} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-semibold text-foreground">Articolo {i}</h3>
            <p className="text-sm text-muted">Anteprima dell'articolo con consigli pratici.</p>
          </article>
        ))}
      </div>
    </div>
  );
}


