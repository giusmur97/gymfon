"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import TrainerOverview from "./TrainerOverview";
import ClientManagement from "./ClientManagement";
import QuickActions from "./QuickActions";
import Link from "next/link";

export default function TrainerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "courses" | "sessions" | "analytics">("overview");

  // Check authentication and authorization
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      if (user.role !== "admin" && user.role !== "staff") {
        router.push("/dashboard/client");
        return;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Accesso non autorizzato</h2>
          <p className="text-muted-foreground">Non hai i permessi per accedere a questa sezione.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Trainer</h1>
          <p className="text-muted-foreground">Benvenuto, {user.name}</p>
        </div>
        <QuickActions />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Panoramica" },
            { id: "clients", label: "Clienti" },
            { id: "courses", label: "Corsi" },
            { id: "sessions", label: "Sessioni" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "overview" && <TrainerOverview />}
        {activeTab === "clients" && <ClientManagement />}
        {activeTab === "courses" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Gestione Corsi</h3>
              <p className="text-muted-foreground mb-6">
                Crea e gestisci i tuoi corsi online, moduli e lezioni per i tuoi clienti.
              </p>
              <Link
                href="/courses/manage"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Vai alla Gestione Corsi
              </Link>
            </div>
          </div>
        )}
        {activeTab === "sessions" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Gestione sessioni - In sviluppo</p>
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Analytics - In sviluppo</p>
          </div>
        )}
      </div>
    </div>
  );
}