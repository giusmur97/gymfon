import { Metadata } from "next";
import ClientProfileForm from "@/components/onboarding/ClientProfileForm";

export const metadata: Metadata = {
  title: "Completa Profilo Cliente",
  description: "Completa il tuo profilo cliente",
};

export default function ClientProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Completa il tuo profilo</h2>
          <p className="mt-2 text-muted-foreground">
            Aiutaci a creare il programma perfetto per te
          </p>
        </div>
        <ClientProfileForm />
      </div>
    </div>
  );
}