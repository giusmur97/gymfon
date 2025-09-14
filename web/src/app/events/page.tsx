import Card from "@/components/Card";
import Link from "next/link";

async function getEvents() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const res = await fetch(`${base}/api/events`, { next: { revalidate: 120 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data as { id: string; title: string; city: string; date: string }[];
}

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="heading-display text-4xl">Eventi & Prenotazioni</h1>
        <p className="mt-2 text-muted">Tour e date disponibili nelle principali città.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => {
          const date = new Date(e.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
          return (
            <Card key={e.id}>
              <div className="p-6">
                <p className="text-sm text-muted">{e.city}</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{e.title}</h3>
                <p className="mt-1 text-muted">{date}</p>
                <Link href={`/events/${e.id}`} className="btn btn-primary mt-4">Prenota</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


