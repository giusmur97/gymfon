import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="heading-display text-3xl text-foreground">Accedi</h1>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input type="password" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <button className="btn btn-primary mt-2">Accedi</button>
          <Link href="/account/forgot" className="text-sm link">Password dimenticata?</Link>
        </form>

        <div className="mt-8">
          <div className="relative my-4 h-px bg-border">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted">oppure</span>
          </div>
          <div className="grid gap-3">
            <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/auth/google`} className="btn bg-surface border border-border hover:bg-surface-2 text-foreground">
              Accedi con Google
            </a>
            <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/auth/apple`} className="btn bg-black text-white hover:bg-slate-900">
              Accedi con Apple
            </a>
            <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/auth/facebook`} className="btn bg-[#1877F2] text-white hover:brightness-95">
              Accedi con Facebook
            </a>
          </div>
        </div>
      </div>
      <div>
        <h2 className="heading-display text-3xl text-foreground">Crea account</h2>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input type="password" className="rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors hover:border-border/80" />
          </div>
          <button className="btn btn-secondary mt-2">Registrati</button>
        </form>
      </div>
    </div>
  );
}


