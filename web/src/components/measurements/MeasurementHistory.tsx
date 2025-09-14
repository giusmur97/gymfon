'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';

interface Circumferences {
  chest?: number;
  waist?: number;
  hips?: number;
  thigh?: number;
  arm?: number;
  forearm?: number;
  neck?: number;
  calf?: number;
}

interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  circumferences?: Circumferences;
  notes?: string;
  measuredBy?: string;
  measuredByName?: string;
  createdAt: string;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dataPoints: Array<{ date: string; value: number }>;
}

interface Analytics {
  weightTrend?: TrendData;
  bodyFatTrend?: TrendData;
  muscleMassTrend?: TrendData;
  bodyWaterTrend?: TrendData;
  circumferencesTrend: Record<string, TrendData>;
  totalMeasurements: number;
  timeRange: string;
}

interface MeasurementHistoryProps {
  clientId: string;
  onEdit?: (measurement: BodyMeasurement) => void;
  onDelete?: (measurementId: string) => void;
  canEdit?: boolean;
}

export default function MeasurementHistory({
  clientId,
  onEdit,
  onDelete,
  canEdit = false
}: MeasurementHistoryProps) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');
  const [viewMode, setViewMode] = useState<'list' | 'charts'>('list');

  useEffect(() => {
    fetchMeasurements();
    fetchAnalytics();
  }, [clientId, timeRange]);

  const fetchMeasurements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${clientId}/measurements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMeasurements(data.measurements);
      }
    } catch (error) {
      console.error('Fetch measurements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${clientId}/measurements/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const handleDelete = async (measurementId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa misurazione?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clients/${clientId}/measurements/${measurementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMeasurements(prev => prev.filter(m => m.id !== measurementId));
        fetchAnalytics(); // Refresh analytics
        onDelete?.(measurementId);
        alert('Misurazione eliminata con successo!');
      } else {
        throw new Error('Failed to delete measurement');
      }
    } catch (error) {
      console.error('Delete measurement error:', error);
      alert('Errore nell\'eliminazione della misurazione');
    }
  };

  const formatValue = (value: number | undefined, unit: string = '') => {
    return value !== undefined ? `${value.toFixed(1)}${unit}` : '-';
  };

  const getTrendIcon = (trend?: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <span className="text-red-500">↗</span>;
      case 'decreasing':
        return <span className="text-green-500">↘</span>;
      case 'stable':
        return <span className="text-gray-500">→</span>;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'increasing' | 'decreasing' | 'stable', isWeight = false) => {
    switch (trend) {
      case 'increasing':
        return isWeight ? 'text-red-500' : 'text-green-500';
      case 'decreasing':
        return isWeight ? 'text-green-500' : 'text-red-500';
      case 'stable':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('charts')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'charts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Grafici
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Periodo:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="month">Ultimo mese</option>
            <option value="quarter">Ultimi 3 mesi</option>
            <option value="year">Ultimo anno</option>
          </select>
        </div>
      </div>

      {viewMode === 'charts' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weight Trend */}
          {analytics.weightTrend && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Peso</h4>
                {getTrendIcon(analytics.weightTrend.trend)}
              </div>
              <div className="text-2xl font-bold">{formatValue(analytics.weightTrend.current, ' kg')}</div>
              <div className={`text-sm ${getTrendColor(analytics.weightTrend.trend, true)}`}>
                {analytics.weightTrend.change > 0 ? '+' : ''}{formatValue(analytics.weightTrend.change, ' kg')}
                ({analytics.weightTrend.changePercentage.toFixed(1)}%)
              </div>
            </Card>
          )}

          {/* Body Fat Trend */}
          {analytics.bodyFatTrend && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Massa Grassa</h4>
                {getTrendIcon(analytics.bodyFatTrend.trend)}
              </div>
              <div className="text-2xl font-bold">{formatValue(analytics.bodyFatTrend.current, '%')}</div>
              <div className={`text-sm ${getTrendColor(analytics.bodyFatTrend.trend)}`}>
                {analytics.bodyFatTrend.change > 0 ? '+' : ''}{formatValue(analytics.bodyFatTrend.change, '%')}
                ({analytics.bodyFatTrend.changePercentage.toFixed(1)}%)
              </div>
            </Card>
          )}

          {/* Muscle Mass Trend */}
          {analytics.muscleMassTrend && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Massa Muscolare</h4>
                {getTrendIcon(analytics.muscleMassTrend.trend)}
              </div>
              <div className="text-2xl font-bold">{formatValue(analytics.muscleMassTrend.current, '%')}</div>
              <div className={`text-sm ${getTrendColor(analytics.muscleMassTrend.trend)}`}>
                {analytics.muscleMassTrend.change > 0 ? '+' : ''}{formatValue(analytics.muscleMassTrend.change, '%')}
                ({analytics.muscleMassTrend.changePercentage.toFixed(1)}%)
              </div>
            </Card>
          )}

          {/* Total Measurements */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Misurazioni</h4>
            </div>
            <div className="text-2xl font-bold">{analytics.totalMeasurements}</div>
            <div className="text-sm text-gray-500">Nel periodo selezionato</div>
          </Card>
        </div>
      )}

      {viewMode === 'list' && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Storico Misurazioni</h3>
          </div>

          {measurements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nessuna misurazione registrata</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Massa Grassa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Massa Muscolare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Circonferenze
                    </th>
                    {canEdit && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {measurements.map((measurement) => (
                    <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(measurement.date).toLocaleDateString('it-IT')}
                        </div>
                        {measurement.measuredByName && (
                          <div className="text-xs text-gray-500">
                            da {measurement.measuredByName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatValue(measurement.weight, ' kg')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatValue(measurement.bodyFat, '%')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatValue(measurement.muscleMass, '%')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          {measurement.circumferences?.waist && (
                            <div>Vita: {formatValue(measurement.circumferences.waist, ' cm')}</div>
                          )}
                          {measurement.circumferences?.chest && (
                            <div>Torace: {formatValue(measurement.circumferences.chest, ' cm')}</div>
                          )}
                          {measurement.circumferences?.hips && (
                            <div>Fianchi: {formatValue(measurement.circumferences.hips, ' cm')}</div>
                          )}
                        </div>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onEdit?.(measurement)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDelete(measurement.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}