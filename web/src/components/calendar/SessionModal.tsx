'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

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

interface Client {
  id: string;
  name: string;
  email: string;
  hasActiveSessions: boolean;
}

interface SessionModalProps {
  session?: CalendarSession | null;
  initialDate?: Date | null;
  onSave: (sessionData: any) => void;
  onDelete?: (sessionId: string) => void;
  onClose: () => void;
}

export default function SessionModal({
  session,
  initialDate,
  onSave,
  onDelete,
  onClose
}: SessionModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'training' as const,
    date: '',
    time: '',
    duration: 60,
    location: '',
    meetingLink: '',
    notes: '',
    status: 'scheduled' as const,
    price: 0
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
    
    if (session) {
      // Edit mode - populate form with session data
      const sessionDate = new Date(session.date);
      setFormData({
        clientId: session.clientId,
        type: session.type,
        date: sessionDate.toISOString().split('T')[0],
        time: sessionDate.toTimeString().slice(0, 5),
        duration: session.duration,
        location: session.location || '',
        meetingLink: session.meetingLink || '',
        notes: session.notes || '',
        status: session.status,
        price: session.price || 0
      });
    } else if (initialDate) {
      // Create mode with initial date
      setFormData(prev => ({
        ...prev,
        date: initialDate.toISOString().split('T')[0],
        time: initialDate.toTimeString().slice(0, 5)
      }));
    }
  }, [session, initialDate]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?hasActiveSessions=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }
    if (formData.type === 'online' && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for online sessions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const sessionDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const sessionData = {
        clientId: formData.clientId,
        type: formData.type,
        date: sessionDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location || null,
        meetingLink: formData.meetingLink || null,
        notes: formData.notes || null,
        status: formData.status,
        price: formData.price
      };

      await onSave(sessionData);
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      setLoading(true);
      try {
        await onDelete(session.id);
      } catch (error) {
        console.error('Error deleting session:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-white/70 dark:bg-black/60">
      <div className="bg-surface text-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {session ? 'Edit Session' : 'New Session'}
          </h2>
          <div className="flex items-center space-x-2">
            {session && onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Client *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                errors.clientId ? 'border-red-500' : 'border-border'
              } bg-surface text-foreground`}
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.clientId}</p>
            )}
            {selectedClient && !selectedClient.hasActiveSessions && (
              <p className="mt-1 text-sm text-orange-600">
                Warning: This client does not have active sessions
              </p>
            )}
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Session Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
            >
              <option value="training">Training Session</option>
              <option value="consultation">Consultation</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  errors.date ? 'border-red-500' : 'border-border'
                } bg-surface text-foreground`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className={`w-full rounded-md border px-3 py-2 text-sm ${
                  errors.time ? 'border-red-500' : 'border-border'
                } bg-surface text-foreground`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                errors.duration ? 'border-red-500' : 'border-border'
              } bg-surface text-foreground`}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Gym, Studio, Client's home, etc."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="https://zoom.us/j/..."
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                errors.meetingLink ? 'border-red-500' : 'border-border'
              } bg-surface text-foreground`}
            />
            {errors.meetingLink && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.meetingLink}</p>
            )}
          </div>

          {/* Status (only for existing sessions) */}
          {session && (
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Price (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Session notes, special requirements, etc."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-md hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}