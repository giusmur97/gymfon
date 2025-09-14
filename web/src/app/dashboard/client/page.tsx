import { Metadata } from "next";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export const metadata: Metadata = {
  title: "Dashboard Cliente",
  description: "Dashboard personale - visualizza i tuoi programmi, progressi e sessioni",
};

export default function ClientDashboardPage() {
  return <ClientDashboard />;
}