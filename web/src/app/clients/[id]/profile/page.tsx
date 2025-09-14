'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientProfileForm from '@/components/client-profile/ClientProfileForm';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hasActiveSessions: boolean;
  profile?: any;
}

interface UserPermissions {
  role: string;
  hasActiveSessions: boolean;
  permissions: any;
  clientPermissions?: any;
  hasGestionaleAccess: boolean;
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/profile`, {
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
          setError('Non hai i permessi per accedere a questo profilo');
          return;
        }
        throw new Error('Failed to fetch client data');
      }

      const data = await response.json();
      setClient(data.client);
    } catch (error) {
      console.error('Fetch client error:', error);
      setError('Errore nel caricamento del profilo cliente');
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/clients/me/permissions`, {
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

  const handleSave = (data: any) => {
    // Refresh client data after save
    fetchClientData();
  };

  if (loading || !permissions) {
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

  // Check if user has access to gestionale features
  const hasGestionaleAccess = permissions?.hasGestionaleAccess || false;
  const isOwnProfile = permissions?.role === 'client' && permissions?.userId === clientId;
  const canEdit = permissions ? (
    permissions.role === 'admin' || 
    (permissions.role === 'staff' && permissions.permissions?.canManageWorkouts) ||
    (isOwnProfile && hasGestionaleAccess)
  ) : false;

  // Debug logging
  console.log('Permissions:', permissions);
  console.log('canEdit:', canEdit);
  console.log('hasGestionaleAccess:', hasGestionaleAccess);

  if (!hasGestionaleAccess && isOwnProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Accesso Limitato</h2>
          <p className="text-gray-600 mb-4">
            Per accedere al tuo profilo completo, devi acquistare delle sessioni di allenamento.
          </p>
          <button
            onClick={() => router.push('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Acquista Sessioni
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
                  {client.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{client.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {client.hasActiveSessions ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Sessioni Attive
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Nessuna Sessione
                </span>
              )}
              
              {hasGestionaleAccess && (
                <Link
                  href={`/clients/${clientId}/measurements`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  Misurazioni
                </Link>
              )}
              {hasGestionaleAccess && (
                <button
                  onClick={async () => {
                    try {
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                      const token = localStorage.getItem('token') || '';
                      
                      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/profile-export`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                      });
                      
                      if (!response.ok) {
                        throw new Error('Errore nell\'esportazione del profilo');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `profilo-cliente-${clientId}.json`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } catch (e: any) {
                      alert(e.message || 'Errore nell\'esportazione');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Esporta Profilo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <ClientProfileForm
          clientId={clientId}
          initialData={client.profile || {}}
          onSave={handleSave}
          readOnly={!canEdit}
        />
      </div>
    </div>
  );
}