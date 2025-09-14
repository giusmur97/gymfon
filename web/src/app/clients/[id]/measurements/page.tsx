'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import MeasurementHistory from '@/components/measurements/MeasurementHistory';

interface Client {
  id: string;
  name: string;
  email: string;
  hasActiveSessions: boolean;
}

interface UserPermissions {
  role: string;
  permissions: any;
  hasGestionaleAccess: boolean;
}

interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  circumferences?: any;
  notes?: string;
}

export default function ClientMeasurementsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);

  useEffect(() => {
    fetchClientData();
    fetchPermissions();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (response.status === 403) {
          setError('Non hai i permessi per accedere a questo cliente');
          return;
        }
        throw new Error('Failed to fetch client data');
      }

      const data = await response.json();
      setClient(data.client);
    } catch (error) {
      console.error('Fetch client error:', error);
      setError('Errore nel caricamento dei dati del cliente');
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/clients/me/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      console.error('Fetch permissions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeasurement = (measurement: BodyMeasurement) => {
    setShowForm(false);
    setEditingMeasurement(null);
    // The MeasurementHistory component will refresh automatically
  };

  const handleEditMeasurement = (measurement: BodyMeasurement) => {
    setEditingMeasurement(measurement);
    setShowForm(true);
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    // The MeasurementHistory component handles the deletion
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Errore</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Cliente non trovato</h2>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  // Check permissions
  const canManage = permissions?.permissions?.canManageAllClients || false;
  const isOwnProfile = permissions?.role === 'client' && permissions?.userId === clientId;
  const hasAccess = canManage || (isOwnProfile && client.hasActiveSessions);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Accesso Negato</h2>
          <p className="text-gray-600 mb-4">
            {isOwnProfile 
              ? 'Per accedere alle tue misurazioni, devi avere sessioni attive.'
              : 'Non hai i permessi per accedere alle misurazioni di questo cliente.'
            }
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Indietro
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Misurazioni - {client.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Traccia e monitora i progressi fisici del cliente
                </p>
              </div>
            </div>
            
            {canManage && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Nuova Misurazione</span>
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <MeasurementForm
              clientId={clientId}
              initialData={editingMeasurement || undefined}
              isEditing={!!editingMeasurement}
              onSave={handleSaveMeasurement}
              onCancel={() => {
                setShowForm(false);
                setEditingMeasurement(null);
              }}
            />
          </div>
        )}

        {/* History */}
        <MeasurementHistory
          clientId={clientId}
          onEdit={canManage ? handleEditMeasurement : undefined}
          onDelete={canManage ? handleDeleteMeasurement : undefined}
          canEdit={canManage}
        />
      </div>
    </div>
  );
}