import { Metadata } from "next";
import RoleSelection from "@/components/onboarding/RoleSelection";

export const metadata: Metadata = {
  title: "Selezione Ruolo",
  description: "Scegli il tuo ruolo nella piattaforma Gym Fonty",
};

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Scegli il tuo ruolo</h2>
          <p className="mt-2 text-muted-foreground">
            Seleziona come vuoi utilizzare la piattaforma
          </p>
        </div>
        <RoleSelection />
      </div>
    </div>
  );
}