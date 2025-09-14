'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, LinkIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface GoogleCalendarStatus {
  isConfigured: boolean;
  syncEnabled: boolean;
  calendarId: string;
  lastSyncAt: string | null;
}

interface GoogleCalendarSettingsProps {
  onClose?: () => void;
}

export default function GoogleCalendarSettings({ onClose }: GoogleCalendarSettingsProps) {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [settings, setSettings] = useState({
    syncEnabled: false,
    calendarId: 'primary'
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/google-calendar/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setSettings({
          syncEnabled: data.syncEnabled,
          calendarId: data.calendarId
        });
      }
    } catch (error) {
      console.error('Error fetching Google Calendar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      // Get authorization URL
      const response = await fetch('/api/calendar/google-calendar/auth-url', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Open Google OAuth in popup
        const popup = window.open(
          data.authUrl,
          'google-calendar-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for popup messages
        const handleMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
            const { code } = event.data;
            
            // Send code to backend
            const callbackResponse = await fetch('/api/calendar/google-calendar/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ code })
            });

            if (callbackResponse.ok) {
              await fetchStatus();
              popup?.close();
            } else {
              console.error('Failed to configure Google Calendar');
            }
          }
        };

        window.addEventListener('message', handleMessage);
        
        // Clean up listener when popup closes
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
            setConnecting(false);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      
      const response = await fetch('/api/calendar/google-calendar/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchStatus();
      } else {
        console.error('Failed to sync with Google Calendar');
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch('/api/calendar/google-calendar/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        await fetchStatus();
      } else {
        console.error('Failed to update Google Calendar settings');
      }
    } catch (error) {
      console.error('Error updating Google Calendar settings:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Calendar? This will remove all sync settings.')) {
      return;
    }

    try {
      const response = await fetch('/api/calendar/google-calendar/disconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchStatus();
      } else {
        console.error('Failed to disconnect Google Calendar');
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Google Calendar Integration
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status?.isConfigured ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {status?.isConfigured ? 'Connected' : 'Not Connected'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {status?.isConfigured 
                  ? 'Your Google Calendar is connected and ready to sync'
                  : 'Connect your Google Calendar to automatically sync training sessions'
                }
              </p>
            </div>
          </div>

          {!status?.isConfigured ? (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Settings (only show if connected) */}
        {status?.isConfigured && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Sync Settings
              </h4>
              
              <div className="space-y-4">
                {/* Enable Sync */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Automatic Sync
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically sync training sessions to Google Calendar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.syncEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, syncEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Calendar ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calendar
                  </label>
                  <select
                    value={settings.calendarId}
                    onChange={(e) => setSettings(prev => ({ ...prev, calendarId: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="primary">Primary Calendar</option>
                    {/* You could fetch and populate other calendars here */}
                  </select>
                </div>

                {/* Update Settings Button */}
                <button
                  onClick={handleUpdateSettings}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Update Settings
                </button>
              </div>
            </div>

            {/* Sync Status */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Sync Status
                </h4>
                <button
                  onClick={handleSync}
                  disabled={syncing || !settings.syncEnabled}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowPathIcon className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {status.lastSyncAt ? (
                  <p>Last synced: {new Date(status.lastSyncAt).toLocaleString()}</p>
                ) : (
                  <p>Never synced</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            How it works
          </h4>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Training sessions are automatically synced to your Google Calendar</li>
            <li>• Client information and session details are included in calendar events</li>
            <li>• Changes to sessions in the platform will update the calendar events</li>
            <li>• Deleted sessions are removed from your calendar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}