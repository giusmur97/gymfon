export default function CheckoutPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="heading-display text-2xl">Checkout</h1>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Indirizzo</label>
            <input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">Città</label>
              <input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">CAP</label>
              <input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Metodo di pagamento</label>
            <div className="rounded-md border border-border px-3 py-4 text-sm text-slate-600">
              Campo placeholder per Stripe Elements
            </div>

          </div>
          <button className="btn btn-primary mt-2">Paga ora</button>
        </form>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-border p-6 bg-surface">
        <h2 className="font-semibold">Riepilogo ordine</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span>Subtotale</span><span>20,90€</span></div>
          <div className="flex justify-between"><span>Spedizione</span><span>4,90€</span></div>
          <div className="flex justify-between font-semibold text-slate-900"><span>Totale</span><span>25,80€</span></div>
        </div>
      </div>
    </div>
  );
}



