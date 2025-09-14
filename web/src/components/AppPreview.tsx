"use client";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export default function AppPreview() {
  const { user } = useAuth();
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8 shadow-[var(--shadow-md)]">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="heading-display text-2xl md:text-3xl text-foreground">App Gym Fonty</h2>
          <p className="mt-3 text-muted">Sincronizza piani, traccia allenamenti, salva ricette e ricevi notifiche smart.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/wizard" className="btn btn-secondary">Inizia il wizard</Link>
            <Link href="/account" className="btn btn-primary">{user ? "Vai alla tua area" : "Crea il tuo profilo"}</Link>
          </div>
        </div>
        <div className="relative h-80 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 dark:from-brand-800 dark:to-brand-600">
          <div className="absolute inset-6 rounded-xl border border-white/50 dark:border-white/30 bg-white/70 dark:bg-white/10 shadow-[var(--shadow-lg)]" />
          <div className="absolute right-6 top-6 h-16 w-16 rounded-xl border border-white/60 dark:border-white/40 bg-white/80 dark:bg-white/20 shadow-[var(--shadow-md)]" />
          <div className="absolute bottom-6 left-6 h-24 w-36 rounded-xl border border-white/60 dark:border-white/40 bg-white/80 dark:bg-white/20 shadow-[var(--shadow-md)]" />
        </div>
      </div>
    </section>
  );
}


