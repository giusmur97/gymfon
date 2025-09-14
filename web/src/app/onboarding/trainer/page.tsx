import { Metadata } from "next";
import TrainerProfileForm from "@/components/onboarding/TrainerProfileForm";

export const metadata: Metadata = {
  title: "Completa Profilo Trainer",
  description: "Completa il tuo profilo trainer",
};

export default function TrainerProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Completa il tuo profilo</h2>
          <p className="mt-2 text-muted-foreground">
            Racconta ai tuoi clienti chi sei e cosa offri
          </p>
        </div>
        <TrainerProfileForm />
      </div>
    </div>
  );
}