import Card from "@/components/Card";
import Link from "next/link";

export default function CartPage() {
  const items = [
    { id: 1, title: "Barretta Proteica", price: 3.5, qty: 2 },
    { id: 2, title: "Integratore Omega-3", price: 12.9, qty: 1 },
  ];
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="p-6">
          <h1 className="heading-display text-2xl">Carrello</h1>
          <div className="mt-4 divide-y">
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">{i.title}</p>
                  <p className="text-sm text-muted">Quantità: {i.qty}</p>
                </div>
                <div className="font-semibold text-foreground">{(i.price * i.qty).toFixed(2)}€</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-foreground">Totale</p>
            <p className="text-xl font-bold text-foreground">{total.toFixed(2)}€</p>
          </div>
          <Link href="/checkout" className="btn btn-primary mt-4 w-full">
            Procedi al checkout
          </Link>
        </div>
      </Card>
    </div>
  );
}


