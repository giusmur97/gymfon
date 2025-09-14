"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboardApi";

interface CurrentProgram {
  id: string;
  type: "workout" | "nutrition" | "course";
  title: string;
  description: string;
  progress: number;
  nextSession?: Date;
  trainer: string;
}

interface UpcomingSession {
  id: string;
  type: "training" | "consultation";
  title: string;
  trainer: string;
  date: Date;
  duration: number;
  location: "online" | "in-person";
  meetingLink?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: "workout" | "nutrition" | "consistency" | "milestone";
}

export default function ClientOverview() {
  const [currentPrograms, setCurrentPrograms] = useState<CurrentProgram[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getClientOverview();
        
        setCurrentPrograms(data.currentPrograms);
        setUpcomingSessions(data.upcomingSessions.map(session => ({
          ...session,
          date: new Date(session.date),
          duration: 60, // Default duration
          location: "in-person", // Default location
          meetingLink: undefined // Default no meeting link
        })));
        setAchievements(data.achievements.map(achievement => ({
          ...achievement,
          icon: "🎯", // Default icon
          unlockedAt: new Date(achievement.date),
          category: achievement.type as "workout" | "nutrition" | "consistency" | "milestone"
        })));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to empty data on error
        setCurrentPrograms([]);
        setUpcomingSessions([]);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Oggi";
    if (diffInDays === 1) return "Ieri";
    if (diffInDays < 7) return `${diffInDays} giorni fa`;
    return `${Math.floor(diffInDays / 7)} settimane fa`;
  };

  const getProgramIcon = (type: CurrentProgram["type"]) => {
    switch (type) {
      case "workout":
        return "💪";
      case "nutrition":
        return "🥗";
      case "course":
        return "🎓";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Programs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">I Tuoi Programmi Attuali</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPrograms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nessun programma attivo al momento</p>
            </div>
          ) : (
            currentPrograms.map((program) => (
              <div key={program.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-2xl">{getProgramIcon(program.type)}</div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {program.progress}% completato
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{program.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{program.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${program.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Trainer: {program.trainer}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Prossime Sessioni</h2>
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessuna sessione programmata</p>
            </div>
          ) : (
            upcomingSessions.map((session) => (
              <div key={session.id} className="bg-card rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">
                      {session.type === "training" ? "🏋️" : "💬"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">con {session.trainer}</p>
                      <p className="text-sm mt-1">{formatDate(session.date)}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>⏱️ {session.duration} minuti</span>
                        <span>
                          {session.location === "online" ? "🌐 Online" : "📍 In presenza"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {session.meetingLink && (
                      <button className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
                        Entra nella Call
                      </button>
                    )}
                    <button className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors">
                      Dettagli
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Traguardi Recenti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nessun traguardo sbloccato ancora</p>
            </div>
          ) : (
            achievements.map((achievement) => (
              <div key={achievement.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    <p className="text-xs text-primary mt-2">
                      Sbloccato {formatRelativeTime(achievement.unlockedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}