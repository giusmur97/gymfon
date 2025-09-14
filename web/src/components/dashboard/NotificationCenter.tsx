"use client";

import { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "trainer_message";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchNotifications = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        setNotifications([
          {
            id: "1",
            title: "Nuovo messaggio dal trainer",
            message: "Marco ha aggiornato la tua scheda di allenamento per la prossima settimana",
            type: "trainer_message",
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            actionUrl: "/dashboard/client?tab=programs",
            actionLabel: "Visualizza",
          },
          {
            id: "2",
            title: "Sessione confermata",
            message: "La tua sessione di allenamento di domani alle 15:00 è confermata",
            type: "success",
            isRead: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            id: "3",
            title: "Promemoria allenamento",
            message: "Non dimenticare il tuo allenamento di oggi alle 18:00",
            type: "info",
            isRead: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
          {
            id: "4",
            title: "Obiettivo raggiunto!",
            message: "Complimenti! Hai completato 5 allenamenti consecutivi",
            type: "success",
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            id: "5",
            title: "Piano nutrizionale aggiornato",
            message: "Il tuo piano alimentare è stato modificato in base ai tuoi progressi",
            type: "trainer_message",
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            actionUrl: "/dashboard/client?tab=programs",
            actionLabel: "Visualizza",
          },
        ]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    // TODO: API call to mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = async () => {
    // TODO: API call to mark all as read
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "trainer_message":
        return "💬";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Meno di un'ora fa";
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} giorni fa`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifiche</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Segna tutte come lette
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                          <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Nessuna notifica</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            <div className="flex space-x-2">
                              {notification.actionUrl && (
                                <button
                                  onClick={() => {
                                    // TODO: Navigate to action URL
                                    console.log("Navigate to:", notification.actionUrl);
                                    setShowDropdown(false);
                                  }}
                                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                  {notification.actionLabel || "Visualizza"}
                                </button>
                              )}
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Segna come letta
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => {
                    // TODO: Navigate to full notifications page
                    setShowDropdown(false);
                  }}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Visualizza tutte le notifiche
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}