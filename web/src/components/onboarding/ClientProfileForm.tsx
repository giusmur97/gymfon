"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function ClientProfileForm() {
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { completeClientProfile } = useAuth();
  const router = useRouter();

  const goalOptions = [
    "Perdita di peso",
    "Aumento massa muscolare",
    "Tonificazione",
    "Miglioramento resistenza",
    "Forza",
    "Flessibilità",
    "Benessere generale",
    "Riabilitazione",
  ];

  const levelOptions = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzato" },
  ];

  const workoutTypeOptions = [
    "Palestra/Pesi",
    "Cardio",
    "Yoga",
    "Pilates",
    "CrossFit",
    "Nuoto",
    "Corsa",
    "Calisthenics",
    "Sport di squadra",
    "Danza",
  ];

  const dietaryOptions = [
    "Vegetariano",
    "Vegano",
    "Senza glutine",
    "Senza lattosio",
    "Keto",
    "Paleo",
    "Diabetico",
    "Allergie alimentari",
  ];

  const dayOptions = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (fitnessGoals.length === 0) {
      setError("Seleziona almeno un obiettivo di fitness");
      setLoading(false);
      return;
    }

    if (!fitnessLevel) {
      setError("Seleziona il tuo livello di fitness");
      setLoading(false);
      return;
    }

    const profileData = {
      fitnessGoals,
      fitnessLevel,
      preferences: {
        workoutTypes,
        dietaryRestrictions,
        availableDays,
      },
    };

    const result = await completeClientProfile(profileData);
    
    if (result.success) {
      router.push("/dashboard/client");
    } else {
      setError(result.error || "Errore nel completamento del profilo");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Fitness Goals */}
      <div>
        <h3 className="text-lg font-medium mb-4">Obiettivi di Fitness *</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {goalOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleSelection(goal, fitnessGoals, setFitnessGoals)}
              className={`p-3 text-sm rounded-md border-2 transition-all ${
                fitnessGoals.includes(goal)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness Level */}
      <div>
        <h3 className="text-lg font-medium mb-4">Livello di Fitness *</h3>
        <div className="space-y-3">
          {levelOptions.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="radio"
                name="fitnessLevel"
                value={level.value}
                checked={fitnessLevel === level.value}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="mr-3 text-primary focus:ring-primary"
              />
              <span>{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Workout Types */}
      <div>
        <h3 className="text-lg font-medium mb-4">Tipi di Allenamento Preferiti</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {workoutTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleSelection(type, workoutTypes, setWorkoutTypes)}
              className={`p-3 text-sm rounded-md border-2 transition-all ${
                workoutTypes.includes(type)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h3 className="text-lg font-medium mb-4">Restrizioni Alimentari</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dietaryOptions.map((restriction) => (
            <button
              key={restriction}
              type="button"
              onClick={() => toggleSelection(restriction, dietaryRestrictions, setDietaryRestrictions)}
              className={`p-3 text-sm rounded-md border-2 transition-all ${
                dietaryRestrictions.includes(restriction)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>

      {/* Available Days */}
      <div>
        <h3 className="text-lg font-medium mb-4">Giorni Disponibili per Allenamento</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dayOptions.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleSelection(day, availableDays, setAvailableDays)}
              className={`p-3 text-sm rounded-md border-2 transition-all ${
                availableDays.includes(day)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
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