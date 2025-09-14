import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Registrazione",
  description: "Crea il tuo account Gym Fonty",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Crea il tuo account</h2>
          <p className="mt-2 text-muted-foreground">
            Unisciti alla community Gym Fonty
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}