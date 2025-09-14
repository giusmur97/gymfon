'use client';

import React, { useState, useEffect } from 'react';
import GlobalCalendar from '@/components/calendar/GlobalCalendar';
import SessionModal from '@/components/calendar/SessionModal';
import GoogleCalendarSettings from '@/components/calendar/GoogleCalendarSettings';
import { PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface CalendarSession {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  duration: number;
  type: 'training' | 'consultation' | 'assessment';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  notes?: string;
  meetingLink?: string;
  price?: number;
}

interface CalendarFilters {
  clientIds?: string[];
  sessionTypes?: string[];
  statuses?: string[];
  searchTerm?: string;
}

export default function CalendarPage() {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add date range (current month ± 1 month for better performance)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      
      // Add filters
      if (filters.clientIds?.length) {
        filters.clientIds.forEach(id => params.append('clientId', id));
      }
      if (filters.sessionTypes?.length) {
        filters.sessionTypes.forEach(type => params.append('type', type));
      }
      if (filters.statuses?.length) {
        filters.statuses.forEach(status => params.append('status', status));
      }

      const response = await fetch(`/api/calendar/sessions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      
      // Convert date strings to Date objects
      const sessionsWithDates = data.map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }));

      // Apply client-side search filter
      let filteredSessions = sessionsWithDates;
      if (filters.searchTerm) {
        filteredSessions = sessionsWithDates.filter((session: CalendarSession) =>
          session.clientName.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: CalendarSession) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handleDateClick = (date: Date) => {
    setNewSessionDate(date);
    setSelectedSession(null);
    setShowSessionModal(true);
  };

  const handleSessionSave = async (sessionData: any) => {
    try {
      const url = selectedSession 
        ? `/api/calendar/sessions/${selectedSession.id}`
        : '/api/calendar/sessions';
      
      const method = selectedSession ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      // Refresh sessions
      await fetchSessions();
      setShowSessionModal(false);
      setSelectedSession(null);
      setNewSessionDate(null);
    } catch (error) {
      console.error('Error saving session:', error);
      // You might want to show a toast notification here
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/calendar/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Refresh sessions
      await fetchSessions();
      setShowSessionModal(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      // You might want to show a toast notification here
    }
  };

  const handleFiltersChange = (newFilters: CalendarFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Training Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your training sessions and appointments
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGoogleSettings(true)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Google Calendar
            </button>
            
            <button
              onClick={() => {
                setNewSessionDate(new Date());
                setSelectedSession(null);
                setShowSessionModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Session
            </button>
          </div>
        </div>

        {/* Calendar */}
        <GlobalCalendar
          sessions={sessions}
          onSessionClick={handleSessionClick}
          onDateClick={handleDateClick}
          onFiltersChange={handleFiltersChange}
        />

        {/* Session Modal */}
        {showSessionModal && (
          <SessionModal
            session={selectedSession}
            initialDate={newSessionDate}
            onSave={handleSessionSave}
            onDelete={selectedSession ? handleSessionDelete : undefined}
            onClose={() => {
              setShowSessionModal(false);
              setSelectedSession(null);
              setNewSessionDate(null);
            }}
          />
        )}

        {/* Google Calendar Settings Modal */}
        {showGoogleSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <GoogleCalendarSettings onClose={() => setShowGoogleSettings(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}