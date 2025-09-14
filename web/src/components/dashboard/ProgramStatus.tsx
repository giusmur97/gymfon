export default function ProgramStatus({ status }: { status: "in_attesa" | "in_lavorazione" | "pronto" }) {
  const map = {
    in_attesa: { label: "In attesa – il PT sta preparando il tuo programma", className: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-300" },
    in_lavorazione: { label: "In lavorazione – quasi pronto", className: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-300" },
    pronto: { label: "Programma pronto – visualizza o scarica", className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-300" },
  } as const;

  const cfg = map[status];

  return (
    <div className={`rounded-lg border p-4 ${cfg.className}`}>
      <p className="text-sm font-medium">{cfg.label}</p>
      {status === "pronto" && (
        <div className="mt-3 flex gap-2">
          <a className="btn btn-primary btn-sm" href="#">Apri nell'app</a>
          <a className="btn btn-secondary btn-sm" href="#">Scarica PDF</a>
        </div>
      )}
    </div>
  );
}


