"use client";

import { useState, useEffect } from "react";

interface ProgressMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  history: { date: Date; value: number }[];
}

interface WorkoutStat {
  totalWorkouts: number;
  weeklyAverage: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

interface NutritionStat {
  adherenceRate: number;
  avgCalories: number;
  targetCalories: number;
  macroBalance: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function ProgressTracking() {
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStat | null>(null);
  const [nutritionStats, setNutritionStats] = useState<NutritionStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "3months">("month");

  useEffect(() => {
    // TODO: Replace with actual API calls
    const fetchProgressData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setMetrics([
          {
            id: "weight",
            name: "Peso",
            currentValue: 72.5,
            targetValue: 70,
            unit: "kg",
            trend: "down",
            changePercent: -2.1,
            history: [
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 74.2 },
              { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 73.8 },
              { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 73.1 },
              { date: new Date(), value: 72.5 },
            ],
          },
          {
            id: "body_fat",
            name: "Massa Grassa",
            currentValue: 15.2,
            targetValue: 12,
            unit: "%",
            trend: "down",
            changePercent: -8.4,
            history: [
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 16.6 },
              { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 16.1 },
              { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 15.7 },
              { date: new Date(), value: 15.2 },
            ],
          },
          {
            id: "muscle_mass",
            name: "Massa Muscolare",
            currentValue: 61.4,
            targetValue: 65,
            unit: "kg",
            trend: "up",
            changePercent: 3.2,
            history: [
              { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 59.5 },
              { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 60.1 },
              { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 60.8 },
              { date: new Date(), value: 61.4 },
            ],
          },
        ]);

        setWorkoutStats({
          totalWorkouts: 42,
          weeklyAverage: 3.2,
          completionRate: 87,
          currentStreak: 5,
          longestStreak: 12,
        });

        setNutritionStats({
          adherenceRate: 82,
          avgCalories: 2150,
          targetCalories: 2200,
          macroBalance: {
            protein: 28,
            carbs: 45,
            fats: 27,
          },
        });
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [selectedPeriod]);

  const getTrendIcon = (trend: ProgressMetric["trend"]) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "📊";
    }
  };

  const getTrendColor = (trend: ProgressMetric["trend"], changePercent: number) => {
    if (trend === "stable") return "text-muted-foreground";
    if (changePercent > 0) return "text-green-600 dark:text-green-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">I Tuoi Progressi</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="week">Ultima settimana</option>
          <option value="month">Ultimo mese</option>
          <option value="3months">Ultimi 3 mesi</option>
        </select>
      </div>

      {/* Body Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-4">Metriche Corporee</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">{metric.name}</h4>
                <span className="text-lg">{getTrendIcon(metric.trend)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.currentValue}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                
                {metric.targetValue && (
                  <div className="text-sm text-muted-foreground">
                    Obiettivo: {metric.targetValue} {metric.unit}
                  </div>
                )}
                
                <div className={`text-sm font-medium ${getTrendColor(metric.trend, metric.changePercent)}`}>
                  {metric.changePercent > 0 ? "+" : ""}{metric.changePercent.toFixed(1)}% rispetto al periodo precedente
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Statistics */}
      {workoutStats && (
        <div>
          <h3 className="text-lg font-medium mb-4">Statistiche Allenamento</h3>
          <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workoutStats.totalWorkouts}</div>
                <div className="text-sm text-muted-foreground">Allenamenti Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workoutStats.weeklyAverage}</div>
                <div className="text-sm text-muted-foreground">Media Settimanale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workoutStats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Tasso Completamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workoutStats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Serie Attuale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workoutStats.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Serie Più Lunga</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Statistics */}
      {nutritionStats && (
        <div>
          <h3 className="text-lg font-medium mb-4">Statistiche Nutrizionali</h3>
          <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Aderenza al Piano</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Aderenza Generale</span>
                      <span>{nutritionStats.adherenceRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${nutritionStats.adherenceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calorie Medie</span>
                    <div className="text-right">
                      <div className="font-medium">{nutritionStats.avgCalories}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: {nutritionStats.targetCalories}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Bilancio Macronutrienti</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Proteine</span>
                    <span className="font-medium">{nutritionStats.macroBalance.protein}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Carboidrati</span>
                    <span className="font-medium">{nutritionStats.macroBalance.carbs}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Grassi</span>
                    <span className="font-medium">{nutritionStats.macroBalance.fats}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}