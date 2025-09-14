import { Metadata } from "next";
import DashboardRouter from "@/components/dashboard/DashboardRouter";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard personale Gym Fonty",
};

export default function DashboardPage() {
  return <DashboardRouter />;
}