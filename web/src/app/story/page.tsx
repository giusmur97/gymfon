import Scrolly from "@/components/Scrolly";

const steps = [
  {
    title: "Ascoltiamo i tuoi obiettivi",
    body: "Definisci target e preferenze: il sistema adatta dieta e allenamento.",
  },
  {
    title: "Generiamo il piano intelligente",
    body: "Progressioni, ricette e integrazione si combinano in modo dinamico.",
  },
  {
    title: "Monitora e migliora",
    body: "Metriche, check e coaching per mantenere i risultati nel tempo.",
  },
];

export default function StoryPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="heading-display text-4xl md:text-5xl">Come funziona</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">Uno storytelling interattivo stile Apple: testo che si attiva in sequenza e visual sticky sincronizzati.</p>
      </header>

      <Scrolly
        steps={steps}
        renderVisual={(active) => (
          <div className="relative h-full w-full">
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-40 w-40 rounded-full bg-brand-200 blur-xl" style={{ opacity: active===0?1:0, transition: "opacity 300ms" }} />
              <div className="h-60 w-44 rounded-2xl bg-brand-400/70" style={{ transform: `translateY(${active*10}px)`, transition: "transform 300ms" }} />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-48 w-48 rounded-full bg-blue-500/40 blur-xl" style={{ opacity: active===1?1:0, transition: "opacity 300ms" }} />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-24 w-72 rounded-xl bg-green-500/40" style={{ opacity: active===2?1:0, transition: "opacity 300ms" }} />
            </div>
          </div>
        )}
      />
    </div>
  );
}


