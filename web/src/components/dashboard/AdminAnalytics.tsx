"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboardApi";

interface PlatformStats {
  totalUsers: number;
  totalClients: number;
  totalTrainers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  sessionsThisMonth: number;
  coursesEnrolled: number;
  gdprRequests: number;
}

interface UsageMetrics {
  dailyActiveUsers: { date: string; count: number }[];
  popularFeatures: { feature: string; usage: number }[];
  userGrowth: { month: string; users: number }[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalClients: 0,
    totalTrainers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    sessionsThisMonth: 0,
    coursesEnrolled: 0,
    gdprRequests: 0,
  });

  const [metrics, setMetrics] = useState<UsageMetrics>({
    dailyActiveUsers: [],
    popularFeatures: [],
    userGrowth: [],
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getAdminAnalytics(timeRange);
        
        setStats(data.stats);
        setMetrics(data.metrics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Fallback to empty data on error
        setStats({
          totalUsers: 0,
          totalClients: 0,
          totalTrainers: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          sessionsThisMonth: 0,
          coursesEnrolled: 0,
          gdprRequests: 0,
        });
        setMetrics({
          dailyActiveUsers: [],
          popularFeatures: [],
          userGrowth: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics della Piattaforma</h2>
        <div className="flex rounded-lg border border-border">
          {[
            { value: "7d", label: "7 giorni" },
            { value: "30d", label: "30 giorni" },
            { value: "90d", label: "90 giorni" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as any)}
              className={`px-3 py-1 text-sm font-medium ${
                timeRange === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Utenti Totali</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+12.5% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clienti Attivi</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <div className="text-2xl">🏃‍♂️</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+8.3% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ricavi Mensili</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+15.2% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessioni Mensili</p>
              <p className="text-2xl font-bold">{stats.sessionsThisMonth}</p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+23.1% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Abbonamenti Attivi</p>
              <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+9.7% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trainer Attivi</p>
              <p className="text-2xl font-bold">{stats.totalTrainers}</p>
            </div>
            <div className="text-2xl">💪</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-blue-600">Stabile</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Iscrizioni Corsi</p>
              <p className="text-2xl font-bold">{stats.coursesEnrolled}</p>
            </div>
            <div className="text-2xl">🎓</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600">+18.9% vs mese scorso</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Richieste GDPR</p>
              <p className="text-2xl font-bold">{stats.gdprRequests}</p>
            </div>
            <div className="text-2xl">🔒</div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">Questo mese</span>
          </div>
        </div>
      </div>

      {/* Popular Features */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Funzionalità Più Utilizzate</h3>
        <div className="space-y-4">
          {metrics.popularFeatures.map((feature, index) => (
            <div key={feature.feature} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="font-medium">{feature.feature}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature.usage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-10 text-right">{feature.usage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Growth Chart Placeholder */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Crescita Utenti</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">📈</p>
            <p className="text-sm text-muted-foreground">
              Grafico di crescita utenti
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Integrazione con libreria di grafici in sviluppo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}