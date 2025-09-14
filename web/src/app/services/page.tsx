import Link from "next/link";
import Card from "@/components/Card";

async function getServices() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/services`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data as { id: string; title: string; shortDesc: string; priceOptions: unknown }[];
}

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="space-y-10">
      <header className="text-center">
        <h1 className="heading-display text-4xl md:text-5xl">Servizi</h1>
        <p className="mt-3 text-muted">
          Scegli il percorso più adatto a te con Gym Fonty.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const cheapest = Array.isArray(s.priceOptions)
            ? s.priceOptions[0]?.price
            : (s.priceOptions as { basic?: { price?: number } })?.basic?.price ?? undefined;
          const priceLabel = cheapest ? `da ${cheapest}€` : "su richiesta";
          return (
            <Card key={s.id}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-muted">{s.shortDesc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted">{priceLabel}</span>
                  <Link href={{ pathname: "/wizard", query: { prefill: s.id } }} className="btn btn-primary">
                    Scopri
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


