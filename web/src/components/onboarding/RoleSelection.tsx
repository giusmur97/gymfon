"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { selectRole } = useAuth();
  const router = useRouter();

  const roles = [
    {
      id: "admin",
      title: "Amministratore/Trainer",
      description: "Accesso completo per gestire clienti, creare programmi e gestire la piattaforma",
      icon: "👨‍💼",
      features: [
        "Gestione completa clienti",
        "Creazione schede allenamento",
        "Piani alimentari personalizzati",
        "Calendario e sessioni",
        "Analisi e reportistica",
        "Gestione GDPR e documenti"
      ]
    },
    {
      id: "staff",
      title: "Staff/Assistente",
      description: "Accesso limitato per assistere con allenamenti e calendario",
      icon: "👨‍🏫",
      features: [
        "Creazione schede allenamento",
        "Gestione calendario",
        "Visualizzazione clienti",
        "Assistenza sessioni"
      ]
    },
    {
      id: "client",
      title: "Cliente",
      description: "Accesso personalizzato per seguire i tuoi programmi e monitorare i progressi",
      icon: "🏃‍♂️",
      features: [
        "Visualizzazione programmi personalizzati",
        "Tracciamento progressi",
        "Prenotazione sessioni",
        "Accesso corsi acquistati",
        "Diario alimentare"
      ]
    }
  ];

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError("Seleziona un ruolo per continuare");
      return;
    }

    setLoading(true);
    setError("");

    const result = await selectRole(selectedRole);
    
    if (result.success) {
      // Redirect to profile completion
      const profileType = (selectedRole === 'admin' || selectedRole === 'staff') ? 'trainer' : 'client';
      router.push(`/onboarding/${profileType}`);
    } else {
      setError(result.error || "Errore nella selezione del ruolo");
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              selectedRole === role.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              
              <div className="text-left">
                <h4 className="text-sm font-medium mb-2">Funzionalità incluse:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Salvataggio..." : "Continua"}
        </button>
      </div>
    </div>
  );
}