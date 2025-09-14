import PricingTable from "@/components/PricingTable";

export default function Page() {
  return (
    <div className="space-y-8">
      <PricingTable />
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-foreground">Domande sui pacchetti?</h2>
        <p className="mt-1 text-sm text-muted">Scrivimi e ti aiuto a scegliere la soluzione migliore per te.</p>
        <a className="btn btn-secondary mt-4" href="/contatti">Contattami</a>
      </section>
    </div>
  );
}


