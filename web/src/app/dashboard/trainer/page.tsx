import { Metadata } from "next";
import TrainerDashboard from "@/components/dashboard/TrainerDashboard";

export const metadata: Metadata = {
  title: "Dashboard Trainer",
  description: "Dashboard per personal trainer - gestisci clienti, programmi e sessioni",
};

export default function TrainerDashboardPage() {
  return <TrainerDashboard />;
}