"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import TrainerOverview from "./TrainerOverview";
import ClientManagement from "./ClientManagement";
import QuickActions from "./QuickActions";
import AdminAnalytics from "./AdminAnalytics";
import SystemSettings from "./SystemSettings";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "analytics" | "settings" | "courses" | "sessions" | "gdpr" | "reports" | "documents" | "communication"
  >("overview");

  // Check authentication and authorization - Admin only
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      if (user.role !== "admin") {
        router.push("/dashboard");
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

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Accesso non autorizzato</h2>
          <p className="text-muted-foreground">Solo gli amministratori possono accedere a questa sezione.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">Benvenuto, {user.name}</p>
          <div className="flex items-center mt-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm text-muted-foreground">Admin Access</span>
          </div>
        </div>
        <QuickActions />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "clients", label: "Gestione Clienti", icon: "👥" },
            { id: "analytics", label: "Analytics", icon: "📈" },
            { id: "settings", label: "Impostazioni", icon: "⚙️" },
            { id: "courses", label: "Corsi", icon: "🎓" },
            { id: "sessions", label: "Sessioni", icon: "📅" },
            { id: "gdpr", label: "GDPR", icon: "🔒" },
            { id: "reports", label: "Report", icon: "🧾" },
            { id: "documents", label: "Documenti", icon: "📄" },
            { id: "communication", label: "Comunicazione", icon: "💬" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}</nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "overview" && <TrainerOverview />}
        {activeTab === "clients" && <ClientManagement />}
        {activeTab === "analytics" && <AdminAnalytics />}
        {activeTab === "settings" && <SystemSettings />}
        {activeTab === "courses" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Gestione Corsi</h3>
              <p className="text-muted-foreground mb-6">
                Crea e gestisci tutti i corsi della piattaforma.
              </p>
              <Link
                href="/courses/manage"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Vai alla Gestione Corsi
              </Link>
            </div>
          </div>
        )}
        {activeTab === "sessions" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Gestione Sessioni</h3>
              <p className="text-muted-foreground mb-6">
                Visualizza e gestisci tutte le sessioni della piattaforma.
              </p>
              <Link
                href="/calendar"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Vai al Calendario
              </Link>
            </div>
          </div>
        )}
        {activeTab === "gdpr" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Gestione GDPR</h3>
              <p className="text-muted-foreground mb-6">
                Gestisci consensi, audit log e conformità GDPR.
              </p>
              <Link
                href="/admin/audit"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Vai all'Audit
              </Link>
            </div>
          </div>
        )}
        {activeTab === "reports" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Report & Monitoraggio</h3>
              <p className="text-muted-foreground mb-6">Visualizza trend, grafici e scarica storici.</p>
              <button className="btn btn-secondary">Scarica report</button>
            </div>
          </div>
        )}
        {activeTab === "documents" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Gestione Documenti</h3>
              <p className="text-muted-foreground mb-6">Carica e verifica documenti legali/sanitari.</p>
              <Link href="/clients" className="btn btn-secondary">Apri area documenti</Link>
            </div>
          </div>
        )}
        {activeTab === "communication" && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Comunicazione</h3>
              <p className="text-muted-foreground mb-6">Chat interna cliente-admin e risposte predefinite.</p>
              <button className="btn btn-secondary">Apri chat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}