import Card from "@/components/Card";
import AddToCartButton from "@/components/cart/AddToCartButton";

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/products`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data as { id: string; title: string; price: string | number }[];
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="heading-display text-3xl md:text-4xl">Shop prodotti</h1>
          <p className="mt-2 text-muted">Barrette, cookie, integratori e preparati.</p>
        </div>
        <div>
          <input
            placeholder="Cerca prodotti"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80"
          />
        </div>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const price = typeof p.price === "number" ? `${p.price.toFixed(2)}€` : `${p.price}`;
          return (
            <Card key={p.id}>
              <div className="aspect-[4/3] w-full rounded-t-[var(--radius-lg)] bg-surface-2" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <span className="text-sm text-muted">{price}</span>
                </div>
                <AddToCartButton id={p.id} title={p.title} price={Number(String(price).replace(/[^0-9.,]/g, "").replace(",", "."))} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


