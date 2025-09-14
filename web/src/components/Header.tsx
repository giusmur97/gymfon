"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const [open, setOpen] = useState<boolean>(false);
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 reveal-in">
      <div className="container-page h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
          <span className="sr-only">Gym Fonty</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
          <Link href="/chi-sono" className="link hover:text-foreground transition-colors">Chi sono</Link>
          <Link href="/metodo" className="link hover:text-foreground transition-colors">Metodo</Link>
          <Link href="/services" className="link hover:text-foreground transition-colors">Servizi</Link>
          <Link href="/prezzi" className="link hover:text-foreground transition-colors">Prezzi</Link>
          <Link href="/testimonianze" className="link hover:text-foreground transition-colors">Testimonianze</Link>
          <Link href="/faq" className="link hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/blog" className="link hover:text-foreground transition-colors">Blog</Link>
          <Link href="/contatti" className="link hover:text-foreground transition-colors">Contatti</Link>
          {!user && (
            <>
              <Link href="/auth/login" className="link hover:text-foreground transition-colors">Accedi</Link>
              <Link href="/auth/register" className="link hover:text-foreground transition-colors">Registrati</Link>
            </>
          )}
          {user && (
            <>
              <Link href="/dashboard" className="link hover:text-foreground transition-colors">Dashboard</Link>
              <button onClick={logout} className="link hover:text-foreground transition-colors">Esci</button>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="md:hidden">
            <button
              aria-label="Apri menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <span className="i-heroicons-bars-3 w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-surface">
          <div className="container-page py-3 grid gap-2 text-sm">
            <Link href="/chi-sono" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Chi sono</Link>
            <Link href="/metodo" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Metodo</Link>
            <Link href="/services" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Servizi</Link>
            <Link href="/prezzi" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Prezzi</Link>
            <Link href="/testimonianze" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Testimonianze</Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">FAQ</Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Blog</Link>
            <Link href="/contatti" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Contatti</Link>
            {!user && (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Accedi</Link>
                <Link href="/auth/register" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Registrati</Link>
              </>
            )}
            {user && (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="link hover:text-foreground transition-colors py-2">Dashboard</Link>
                <button onClick={() => { setOpen(false); logout(); }} className="text-left py-2 link hover:text-foreground transition-colors">Esci</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


