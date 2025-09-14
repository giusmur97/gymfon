"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboardApi";

interface DashboardStats {
  totalClients: number;
  activeWorkoutPlans: number;
  upcomingSessions: number;
  monthlyRevenue: number;
  completedSessions: number;
  activeCourses: number;
}

interface RecentActivity {
  id: string;
  type: "session" | "workout" | "course" | "client";
  title: string;
  description: string;
  timestamp: Date;
  clientName?: string;
}

export default function TrainerOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeWorkoutPlans: 0,
    upcomingSessions: 0,
    monthlyRevenue: 0,
    completedSessions: 0,
    activeCourses: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getTrainerOverview();
        
        setStats(data.stats);
        setRecentActivities(data.activities.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to empty data on error
        setStats({
          totalClients: 0,
          activeWorkoutPlans: 0,
          upcomingSessions: 0,
          monthlyRevenue: 0,
          completedSessions: 0,
          activeCourses: 0,
        });
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Meno di un'ora fa";
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} giorni fa`;
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "session":
        return "🏋️";
      case "workout":
        return "📋";
      case "course":
        return "🎓";
      case "client":
        return "👤";
      default:
        return "📌";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clienti Totali</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Schede Attive</p>
              <p className="text-2xl font-bold">{stats.activeWorkoutPlans}</p>
            </div>
            <div className="text-2xl">💪</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessioni Prossime</p>
              <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
            </div>
            <div className="text-2xl">📅</div>
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
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessioni Completate</p>
              <p className="text-2xl font-bold">{stats.completedSessions}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Corsi Attivi</p>
              <p className="text-2xl font-bold">{stats.activeCourses}</p>
            </div>
            <div className="text-2xl">🎓</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Attività Recenti</h3>
        </div>
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nessuna attività recente</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {activity.clientName && (
                      <p className="text-xs text-primary font-medium mt-1">Cliente: {activity.clientName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}