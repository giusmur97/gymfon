"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("Richiesta consulenza/Informazioni");
    const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}`);
    window.location.href = `mailto:info@gymfonty.fit?subject=${subject}&body=${body}`;
  }

  return (
    <section>
      <h1 className="heading-display text-2xl md:text-3xl text-foreground">Contatti</h1>
      <p className="mt-2 text-muted">Scrivimi per consulenze, preventivi o informazioni sui programmi.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-muted">Nome e cognome</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Mario Rossi" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-muted">Email</span>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mario@email.com" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-muted">Messaggio</span>
              <textarea className="textarea" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Raccontami i tuoi obiettivi..." />
            </label>
            <button type="submit" className="btn btn-primary">Invia richiesta</button>
          </div>
        </form>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] space-y-4 text-sm">
          <div>
            <p className="text-foreground font-medium">Contatti rapidi</p>
            <p className="text-muted">Email: info@gymfonty.fit</p>
            <p className="text-muted">Tel: +39 333 000 0000</p>
            <p className="text-muted">Orari: Lun-Ven 9:00 - 18:00</p>
          </div>
          <div>
            <p className="text-foreground font-medium">Sede</p>
            <p className="text-muted">Via Esempio 10, Milano</p>
            <div className="mt-2 rounded-lg border border-border bg-surface-2 p-4 text-muted">[Mappa in arrivo]</div>
          </div>
        </div>
      </div>
    </section>
  );
}


