"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboardApi";

interface PlatformSettings {
  siteName: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  maxFileUploadSize: number;
  enableGoogleCalendarSync: boolean;
  maintenanceMode: boolean;
  gdprCompliance: boolean;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: "Gym Fonty",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultUserRole: "client",
    maxFileUploadSize: 10,
    enableGoogleCalendarSync: true,
    maintenanceMode: false,
    gdprCompliance: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getSystemSettings();
        
        setSettings({
          siteName: data.platformName,
          allowRegistration: data.registrationEnabled,
          requireEmailVerification: false, // Not in API yet
          defaultUserRole: "client", // Not in API yet
          maxFileUploadSize: 10, // Not in API yet
          enableGoogleCalendarSync: true, // Not in API yet
          maintenanceMode: data.maintenanceMode,
          gdprCompliance: data.gdprCompliance,
        });
      } catch (error) {
        console.error("Error loading settings:", error);
        // Keep default settings on error
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await dashboardApi.updateSystemSettings({
        platformName: settings.siteName,
        maintenanceMode: settings.maintenanceMode,
        registrationEnabled: settings.allowRegistration,
        gdprCompliance: settings.gdprCompliance,
      });
      alert("Impostazioni salvate con successo!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Errore nel salvataggio delle impostazioni");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Impostazioni Sistema</h2>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Salvataggio..." : "Salva Modifiche"}
        </button>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <h3 className="text-lg font-semibold">Impostazioni Principali</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome del Sito</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Dimensione Max Upload (MB)</label>
            <input
              type="number"
              value={settings.maxFileUploadSize}
              onChange={(e) => updateSetting("maxFileUploadSize", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-input rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium">Consenti Registrazioni</h4>
              <p className="text-sm text-muted-foreground">Permetti a nuovi utenti di registrarsi</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => updateSetting("allowRegistration", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium">Google Calendar Sync</h4>
              <p className="text-sm text-muted-foreground">Sincronizza sessioni con Google Calendar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableGoogleCalendarSync}
                onChange={(e) => updateSetting("enableGoogleCalendarSync", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium">Modalità Manutenzione</h4>
              <p className="text-sm text-muted-foreground">Disabilita l'accesso al sito per manutenzione</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting("maintenanceMode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}