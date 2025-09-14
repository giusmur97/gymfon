'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CalendarIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

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
}

interface CalendarFilters {
  clientIds?: string[];
  sessionTypes?: string[];
  statuses?: string[];
  searchTerm?: string;
}

type CalendarView = 'day' | 'week' | 'month';

interface GlobalCalendarProps {
  sessions: CalendarSession[];
  onSessionClick?: (session: CalendarSession) => void;
  onDateClick?: (date: Date) => void;
  onFiltersChange?: (filters: CalendarFilters) => void;
}

const statusColors = {
  scheduled: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300',
  confirmed: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
  completed: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/30 dark:border-gray-600 dark:text-gray-300',
  cancelled: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
  no_show: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-300'
};

const typeIcons = {
  training: '💪',
  consultation: '💬',
  assessment: '📊'
};

export default function GlobalCalendar({ 
  sessions, 
  onSessionClick, 
  onDateClick, 
  onFiltersChange 
}: GlobalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [filters, setFilters] = useState<CalendarFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Get unique clients for filter dropdown
  const uniqueClients = Array.from(
    new Set(sessions.map(s => ({ id: s.clientId, name: s.clientName })))
  );

  // Filter sessions based on current filters
  const filteredSessions = sessions.filter(session => {
    if (filters.clientIds?.length && !filters.clientIds.includes(session.clientId)) {
      return false;
    }
    if (filters.sessionTypes?.length && !filters.sessionTypes.includes(session.type)) {
      return false;
    }
    if (filters.statuses?.length && !filters.statuses.includes(session.status)) {
      return false;
    }
    if (filters.searchTerm && !session.clientName.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleFilterChange = (newFilters: CalendarFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (view) {
      case 'day':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'week':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
    }
    
    return currentDate.toLocaleDateString(undefined, options);
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const renderDayView = () => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = filteredSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    return (
      <div className="space-y-2">
        {Array.from({ length: 24 }, (_, hour) => {
          const hourSessions = daySessions.filter(session => {
            const sessionHour = new Date(session.date).getHours();
            return sessionHour === hour;
          });

          return (
            <div key={hour} className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="w-20 text-sm text-gray-500 dark:text-gray-400 py-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 min-h-[60px] relative">
                {hourSessions.map(session => (
                  <div
                    key={session.id}
                    className={`absolute left-0 right-0 p-2 rounded border-l-4 cursor-pointer hover:shadow-md transition-shadow ${statusColors[session.status]}`}
                    onClick={() => onSessionClick?.(session)}
                    style={{
                      top: `${(new Date(session.date).getMinutes() / 60) * 60}px`,
                      height: `${(session.duration / 60) * 60}px`
                    }}
                  >
                    <div className="text-sm font-medium">
                      {typeIcons[session.type]} {session.clientName}
                    </div>
                    <div className="text-xs opacity-75">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                      ({session.duration}min)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">Time</div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="text-sm font-medium text-center p-2 border-b border-gray-200 dark:border-gray-700">
            <div>{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
            <div className="text-lg">{day.getDate()}</div>
          </div>
        ))}
        
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className="text-xs text-gray-500 dark:text-gray-400 p-1 border-r border-gray-200 dark:border-gray-700">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map(day => {
              const dayStart = new Date(day);
              dayStart.setHours(hour, 0, 0, 0);
              const dayEnd = new Date(day);
              dayEnd.setHours(hour, 59, 59, 999);

              const hourSessions = filteredSessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
              });

              return (
                <div 
                  key={`${day.toISOString()}-${hour}`} 
                  className="min-h-[40px] border-r border-b border-gray-200 dark:border-gray-700 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => onDateClick?.(dayStart)}
                >
                  {hourSessions.map(session => (
                    <div
                      key={session.id}
                      className={`text-xs p-1 rounded mb-1 cursor-pointer ${statusColors[session.status]}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick?.(session);
                      }}
                    >
                      {typeIcons[session.type]} {session.clientName.split(' ')[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = getWeekStart(monthStart);
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-sm font-medium text-center p-2 border-b border-gray-200 dark:border-gray-700">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);

          const daySessions = filteredSessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= dayStart && sessionDate <= dayEnd;
          });

          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div 
              key={day.toISOString()} 
              className={`min-h-[100px] border border-gray-200 dark:border-gray-700 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 text-gray-400' : ''
              } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => onDateClick?.(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {daySessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    className={`text-xs p-1 rounded cursor-pointer ${statusColors[session.status]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClick?.(session);
                    }}
                  >
                    {typeIcons[session.type]} {session.clientName.split(' ')[0]}
                  </div>
                ))}
                {daySessions.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{daySessions.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2" />
              Calendar
            </h2>
            
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              {(['day', 'week', 'month'] as CalendarView[]).map((viewOption) => (
                <button
                  key={viewOption}
                  onClick={() => setView(viewOption)}
                  className={`px-3 py-1 text-sm font-medium capitalize ${
                    view === viewOption
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${viewOption === 'day' ? 'rounded-l-lg' : viewOption === 'month' ? 'rounded-r-lg' : ''}`}
                >
                  {viewOption}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {formatDateHeader()}
          </h3>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Client
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Client name..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleFilterChange({ ...filters, searchTerm: e.target.value })}
                    className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Client Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clients
                </label>
                <select
                  multiple
                  value={filters.clientIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleFilterChange({ ...filters, clientIds: selected });
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  {uniqueClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Type
                </label>
                <select
                  multiple
                  value={filters.sessionTypes || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleFilterChange({ ...filters, sessionTypes: selected });
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <option value="training">Training</option>
                  <option value="consultation">Consultation</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  multiple
                  value={filters.statuses || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleFilterChange({ ...filters, statuses: selected });
                  }}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleFilterChange({})}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <div key={status} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded border ${colorClass}`}></div>
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}