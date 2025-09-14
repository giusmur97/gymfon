"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import ClientOverview from "./ClientOverview";
import ProgressTracking from "./ProgressTracking";
import NotificationCenter from "./NotificationCenter";
import ClientProfileSummary from "./ClientProfileSummary";
import ClientQuickNav from "./ClientQuickNav";
import Questionnaire from "./Questionnaire";
import FoodDiary from "./FoodDiary";
import MeasurementsMonitor from "./MeasurementsMonitor";
import ProgramStatus from "./ProgramStatus";
import PrivacyConsents from "./PrivacyConsents";
import DocumentList from "@/components/documents/DocumentList";
import DocumentUpload from "@/components/documents/DocumentUpload";
import PhotoUpload from "@/components/photos/PhotoUpload";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "progress" | "sessions" | "privacy">("overview");

  // Check authentication and authorization
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      if (user.role !== "client") {
        router.push("/dashboard/trainer");
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

  if (!user || user.role !== "client") {
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
          <h1 className="text-2xl font-bold">La Tua Dashboard</h1>
          <p className="text-muted-foreground">Benvenuto, {user.name}</p>
        </div>
        <NotificationCenter />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Panoramica" },
            { id: "programs", label: "Programmi" },
            { id: "progress", label: "Progressi" },
            { id: "sessions", label: "Sessioni" },
            { id: "privacy", label: "Privacy" },
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
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ClientProfileSummary />
            <ClientQuickNav />
            <ClientOverview />
          </div>
        )}
        {activeTab === "programs" && (
          <div className="space-y-6">
            <ProgramStatus status="in_attesa" />
            <Questionnaire />
          </div>
        )}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <MeasurementsMonitor />
            <FoodDiary />
            <ProgressTracking />
          </div>
        )}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border p-6">
              <h3 className="text-lg font-medium mb-4">Caricamento Foto</h3>
              <PhotoUpload
                clientId={typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : ''}
                onUploadComplete={() => alert('Foto caricata')}
                onUploadError={(e) => alert(e)}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documenti</h3>
              <DocumentUpload
                clientId={typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : ''}
                onUploadComplete={() => {}}
              />
              <DocumentList
                clientId={typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : ''}
              />
            </div>
          </div>
        )}
        {activeTab === "privacy" && <PrivacyConsents />}
      </div>
    </div>
  );
}