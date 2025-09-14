'use client';

import { useState } from 'react';
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
  id?: string;
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  circumferences?: Circumferences;
  notes?: string;
}

interface MeasurementFormProps {
  clientId: string;
  initialData?: BodyMeasurement;
  onSave?: (measurement: BodyMeasurement) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function MeasurementForm({
  clientId,
  initialData,
  onSave,
  onCancel,
  isEditing = false
}: MeasurementFormProps) {
  const [formData, setFormData] = useState<BodyMeasurement>(
    initialData || {
      date: new Date().toISOString().split('T')[0],
      circumferences: {}
    }
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `/api/clients/${clientId}/measurements/${formData.id}`
        : `/api/clients/${clientId}/measurements`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path.join('.')] = error.message;
          });
          setErrors(fieldErrors);
        }
        throw new Error(errorData.error || 'Failed to save measurement');
      }

      const result = await response.json();
      onSave?.(result.measurement);
      alert(`Misurazione ${isEditing ? 'aggiornata' : 'aggiunta'} con successo!`);
    } catch (error: any) {
      console.error('Save measurement error:', error);
      alert(error.message || 'Errore nel salvataggio della misurazione');
    } finally {
      setLoading(false);
    }
  };

  const updateCircumference = (field: keyof Circumferences, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      circumferences: {
        ...prev.circumferences,
        [field]: numValue
      }
    }));
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Modifica Misurazione' : 'Nuova Misurazione'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Inserisci le misurazioni corporee del cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Data Misurazione *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          {errors['date'] && <p className="text-red-500 text-sm mt-1">{errors['date']}</p>}
        </div>

        {/* Basic Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={formData.weight || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                weight: e.target.value === '' ? undefined : parseFloat(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Altezza (cm)</label>
            <input
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={formData.height || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                height: e.target.value === '' ? undefined : parseFloat(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Massa Grassa (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.bodyFat || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                bodyFat: e.target.value === '' ? undefined : parseFloat(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Massa Muscolare (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.muscleMass || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                muscleMass: e.target.value === '' ? undefined : parseFloat(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Circumferences */}
        <div>
          <h4 className="text-md font-medium mb-4">Circonferenze (cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Torace</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.chest || ''}
                onChange={(e) => updateCircumference('chest', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vita</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.waist || ''}
                onChange={(e) => updateCircumference('waist', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fianchi</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.hips || ''}
                onChange={(e) => updateCircumference('hips', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Coscia</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.thigh || ''}
                onChange={(e) => updateCircumference('thigh', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Braccio</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.arm || ''}
                onChange={(e) => updateCircumference('arm', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Avambraccio</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.forearm || ''}
                onChange={(e) => updateCircumference('forearm', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Collo</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.neck || ''}
                onChange={(e) => updateCircumference('neck', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Polpaccio</label>
              <input
                type="number"
                step="0.1"
                value={formData.circumferences?.calf || ''}
                onChange={(e) => updateCircumference('calf', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Note aggiuntive sulla misurazione..."
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : (isEditing ? 'Aggiorna' : 'Salva Misurazione')}
          </button>
        </div>
      </form>
    </Card>
  );
}