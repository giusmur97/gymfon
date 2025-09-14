"use client";

import { useAuth } from "@/providers/AuthProvider";

type ProgramStatus = "in_attesa" | "in_lavorazione" | "in_corso";

export default function ClientProfileSummary() {
  const { user } = useAuth();

  const programStatus: ProgramStatus = "in_attesa";
  const programManager = "Coach Assegnato";
  const birthDateLabel = "—";

  const statusChip = {
    in_attesa: { label: "In attesa", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
    in_lavorazione: { label: "In lavorazione", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    in_corso: { label: "In corso", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  }[programStatus];

  return (
    <section className="rounded-lg border border-border p-6 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Ciao, {user?.name || "Cliente"}!</h2>
          <p className="text-sm text-muted-foreground">Benvenuto nella tua area personale.</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusChip.className}`}>
          Stato programma: {statusChip.label}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground">Nome e cognome</p>
          <p className="mt-1 font-medium">{user?.name || "—"}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground">Responsabile programma</p>
          <p className="mt-1 font-medium">{programManager}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground">Data di nascita</p>
          <p className="mt-1 font-medium">{birthDateLabel}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="mt-1 font-medium">{user?.email || "—"}</p>
        </div>
      </div>
    </section>
  );
}


