"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function TrainerProfileForm() {
  const [bio, setBio] = useState("");
  const [certifications, setCertifications] = useState<string[]>([""]);
  const [specializations, setSpecializations] = useState<string[]>([""]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { completeTrainerProfile } = useAuth();
  const router = useRouter();

  const addCertification = () => {
    setCertifications([...certifications, ""]);
  };

  const removeCertification = (index: number) => {
    const newCertifications = certifications.filter((_, i) => i !== index);
    setCertifications(newCertifications.length > 0 ? newCertifications : [""]);
  };

  const updateCertification = (index: number, value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };

  const addSpecialization = () => {
    setSpecializations([...specializations, ""]);
  };

  const removeSpecialization = (index: number) => {
    const newSpecializations = specializations.filter((_, i) => i !== index);
    setSpecializations(newSpecializations.length > 0 ? newSpecializations : [""]);
  };

  const updateSpecialization = (index: number, value: string) => {
    const newSpecializations = [...specializations];
    newSpecializations[index] = value;
    setSpecializations(newSpecializations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Filter out empty values
    const validCertifications = certifications.filter(cert => cert.trim() !== "");
    const validSpecializations = specializations.filter(spec => spec.trim() !== "");

    if (!bio.trim()) {
      setError("La biografia è obbligatoria");
      setLoading(false);
      return;
    }

    const profileData = {
      bio: bio.trim(),
      certifications: validCertifications,
      specializations: validSpecializations,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
    };

    const result = await completeTrainerProfile(profileData);
    
    if (result.success) {
      router.push("/dashboard/trainer");
    } else {
      setError(result.error || "Errore nel completamento del profilo");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
          Biografia *
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Racconta la tua esperienza, filosofia di allenamento e cosa ti rende unico come trainer..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Questa biografia sarà visibile ai tuoi clienti
        </p>
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Certificazioni
          </label>
          <button
            type="button"
            onClick={addCertification}
            className="text-sm text-primary hover:text-primary/90"
          >
            + Aggiungi certificazione
          </button>
        </div>
        <div className="space-y-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={cert}
                onChange={(e) => updateCertification(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="es. Personal Trainer ISSA, Istruttore CrossFit L1..."
              />
              {certifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Specializzazioni
          </label>
          <button
            type="button"
            onClick={addSpecialization}
            className="text-sm text-primary hover:text-primary/90"
          >
            + Aggiungi specializzazione
          </button>
        </div>
        <div className="space-y-2">
          {specializations.map((spec, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={spec}
                onChange={(e) => updateSpecialization(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="es. Perdita peso, Forza e ipertrofia, Riabilitazione..."
              />
              {specializations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpecialization(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div>
        <label htmlFor="hourlyRate" className="block text-sm font-medium text-foreground mb-2">
          Tariffa oraria (€) <span className="text-muted-foreground">(opzionale)</span>
        </label>
        <input
          id="hourlyRate"
          type="number"
          min="0"
          step="0.01"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="es. 50.00"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Potrai modificare questa tariffa in qualsiasi momento
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Salvataggio..." : "Completa profilo"}
        </button>
      </div>
    </form>
  );
}