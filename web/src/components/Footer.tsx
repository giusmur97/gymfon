import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-surface reveal-in">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo className="h-7 w-auto" />
          <p className="text-sm text-muted max-w-xs">
            Benessere a 360°: programmi di allenamento e alimentazione, shop e
            prenotazioni eventi. Gym Fonty.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pagine</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/services" className="link">Servizi</Link></li>
            <li><Link href="/products" className="link">Prodotti</Link></li>
            <li><Link href="/events" className="link">Eventi</Link></li>
            <li><Link href="/account" className="link">Account</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Supporto</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/faq" className="link">FAQ</Link></li>
            <li><Link href="/privacy" className="link">Privacy</Link></li>
            <li><Link href="/terms" className="link">Termini</Link></li>
            <li><Link href="/contacts" className="link">Contatti</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Newsletter</h3>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="La tua email"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
            />
            <button className="btn btn-primary whitespace-nowrap">Iscriviti</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-page py-4 text-xs text-muted flex items-center justify-between">
          <p>© {new Date().getFullYear()} Gym Fonty. Tutti i diritti riservati.</p>
          <p>Made with Next.js</p>
        </div>
      </div>
    </footer>
  );
}


