import { Metadata } from "next";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Dashboard amministratore - gestione completa della piattaforma",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}