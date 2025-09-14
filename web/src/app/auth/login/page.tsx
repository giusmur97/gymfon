import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Accedi alla tua account Gym Fonty",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Accedi al tuo account</h2>
          <p className="mt-2 text-muted-foreground">
            Benvenuto nella piattaforma Gym Fonty
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}