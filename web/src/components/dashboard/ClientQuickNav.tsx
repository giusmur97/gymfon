import Link from "next/link";

const items = [
  { href: "/account", label: "Profilo", icon: "👤" },
  { href: "/dashboard/client?tab=programs", label: "Programma", icon: "📋" },
  { href: "/dashboard/client?tab=progress", label: "Misurazioni", icon: "📏" },
  { href: "/clients/1/photos", label: "Foto", icon: "📸" },
  { href: "/clients/1/documents", label: "Documenti", icon: "📄" },
  { href: "/notifications", label: "Notifiche", icon: "🔔" },
];

export default function ClientQuickNav() {
  return (
    <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow text-center"
        >
          <div className="text-2xl" aria-hidden>{it.icon}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{it.label}</div>
        </Link>
      ))}
    </nav>
  );
}


