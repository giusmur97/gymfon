"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const actions = [
    {
      id: "workout",
      label: "Crea Scheda Allenamento",
      icon: "💪",
      description: "Nuovo programma di allenamento per un cliente",
    },
    {
      id: "nutrition",
      label: "Crea Piano Alimentare",
      icon: "🥗",
      description: "Piano nutrizionale personalizzato",
    },
    {
      id: "session",
      label: "Programma Sessione",
      icon: "📅",
      description: "Prenota una sessione one-to-one",
    },
    {
      id: "course",
      label: "Crea Corso",
      icon: "🎓",
      description: "Nuovo corso online",
    },
  ];

  const handleActionClick = (actionId: string) => {
    setShowDropdown(false);
    
    switch (actionId) {
      case "course":
        router.push("/courses/manage");
        break;
      case "workout":
        // TODO: Navigate to workout creation page
        console.log("Navigate to workout creation");
        break;
      case "nutrition":
        // TODO: Navigate to nutrition plan creation page
        console.log("Navigate to nutrition creation");
        break;
      case "session":
        // TODO: Navigate to session scheduling page
        console.log("Navigate to session scheduling");
        break;
      default:
        console.log(`Navigate to create ${actionId}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        <span className="mr-2">⚡</span>
        Azioni Rapide
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-20">
            <div className="p-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-xl">{action.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="border-t border-border p-2">
              <button
                onClick={() => {
                  // TODO: Navigate to full creation menu
                  setShowDropdown(false);
                }}
                className="w-full text-center p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Visualizza tutte le opzioni →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}