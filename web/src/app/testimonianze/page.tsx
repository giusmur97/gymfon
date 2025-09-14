import Testimonials from "@/components/Testimonials";

export default function Page() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="heading-display text-3xl text-foreground">Testimonianze</h1>
        <p className="mt-3 text-muted max-w-3xl">
          Storie di persone reali che hanno trasformato il loro percorso con metodo e costanza.
        </p>
      </section>
      <Testimonials />
    </div>
  );
}


