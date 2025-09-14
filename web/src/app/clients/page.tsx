'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/Card';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hasActiveSessions: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserPermissions {
  role: string;
  permissions: any;
  hasGestionaleAccess: boolean;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });
  const [editMap, setEditMap] = useState<Record<string, { name: string; email: string; editing: boolean }>>({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (permissions) {
      if (permissions.role === 'admin') {
        fetchClients();
      } else {
        setError('Non hai i permessi per accedere a questa pagina');
        setLoading(false);
      }
    }
  }, [permissions]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/clients/me/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Fetch permissions error:', error);
      router.push('/auth/login');
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.clients);
    } catch (error) {
      console.error('Fetch clients error:', error);
      setError('Errore nel caricamento dei clienti');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Nome e email sono obbligatori');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients/add-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add client');
      }

      const data = await response.json();
      setClients(prev => [data.client, ...prev]);
      setShowAddModal(false);
      setNewClient({ name: '', email: '' });
      alert('Cliente aggiunto con successo!');
    } catch (error: any) {
      console.error('Add client error:', error);
      alert(error.message || 'Errore nell\'aggiunta del cliente');
    }
  };

  const startEdit = (client: Client) => {
    setEditMap(prev => ({ ...prev, [client.id]: { name: client.name, email: client.email, editing: true } }));
  };

  const cancelEdit = (id: string) => {
    setEditMap(prev => ({ ...prev, [id]: { ...(prev[id] || { name: '', email: '' }), editing: false } }));
  };

  const saveEdit = async (id: string) => {
    try {
      const draft = editMap[id];
      if (!draft) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients/${id}/basic`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: draft.name, email: draft.email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nel salvataggio');
      }
      const data = await res.json();
      setClients(prev => prev.map(c => c.id === id ? { ...c, name: data.client.name, email: data.client.email } : c));
      cancelEdit(id);
    } catch (e: any) {
      alert(e.message || 'Errore');
    }
  };

  const toggleClientFeatures = async (clientId: string, enable: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const action = enable ? 'enable-features' : 'disable-features';
      
      const response = await fetch(`/api/clients/${clientId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update client features');
      }

      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, hasActiveSessions: enable }
          : client
      ));

      alert(`Funzionalità ${enable ? 'abilitate' : 'disabilitate'} con successo!`);
    } catch (error) {
      console.error('Toggle features error:', error);
      alert('Errore nell\'aggiornamento delle funzionalità');
    }
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
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna alla Dashboard
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestione Clienti
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualizza e gestisci tutti i clienti della piattaforma
              </p>
            </div>
            
            {permissions?.permissions?.canAddClientsManually && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Aggiungi Cliente</span>
              </button>
            )}
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    {editMap[client.id]?.editing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editMap[client.id].name}
                          onChange={(e)=>setEditMap(prev=>({ ...prev, [client.id]: { ...prev[client.id], name: e.target.value } }))}
                          className="w-full px-2 py-1 border rounded"
                        />
                        <input
                          type="email"
                          value={editMap[client.id].email}
                          onChange={(e)=>setEditMap(prev=>({ ...prev, [client.id]: { ...prev[client.id], email: e.target.value } }))}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {client.hasActiveSessions ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Attivo
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      Inattivo
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {editMap[client.id]?.editing ? (
                  <div className="flex space-x-2">
                    <button onClick={()=>saveEdit(client.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Salva</button>
                    <button onClick={()=>cancelEdit(client.id)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Annulla</button>
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/clients/${client.id}/profile`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apri Profilo
                    </Link>
                    <button onClick={()=>startEdit(client)} className="w-full py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">Modifica Anagrafica</button>
                  </>
                )}

                {permissions?.permissions?.canManageAllClients && (
                  <button
                    onClick={() => toggleClientFeatures(client.id, !client.hasActiveSessions)}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      client.hasActiveSessions
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {client.hasActiveSessions ? 'Disabilita Accesso' : 'Abilita Accesso'}
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Registrato: {new Date(client.createdAt).toLocaleDateString('it-IT')}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nessun cliente trovato
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Inizia aggiungendo il tuo primo cliente.
            </p>
          </div>
        )}

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Aggiungi Nuovo Cliente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Nome completo del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="email@esempio.com"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}