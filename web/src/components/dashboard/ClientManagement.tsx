"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/dashboardApi";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  status: "active" | "inactive" | "trial";
  currentPrograms: {
    workout?: string;
    nutrition?: string;
  };
  nextSession?: Date;
  progress: {
    workoutsCompleted: number;
    adherenceRate: number;
  };
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "trial">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; email: string }>({ name: "", email: "" });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getClients({
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page: 1,
          limit: 50
        });
        setClients(data.clients.map((c: any) => ({
          ...c,
          joinDate: new Date(c.joinDate),
          nextSession: c.nextSession ? new Date(c.nextSession) : null,
          status: (c.status || 'active') as any,
          progress: c.progress || { workoutsCompleted: 0, adherenceRate: 0 },
          currentPrograms: c.currentPrograms || {},
        })));
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status: Client["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      trial: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    } as const;
    const labels = { active: "Attivo", inactive: "Inattivo", trial: "Prova" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: Date) => new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" }).format(date);

  const addClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Nome ed email sono obbligatori');
      return;
    }
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/api/clients/add-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Errore creazione cliente');
      const data = await res.json();
      setClients(prev => [{
        id: data.client.id,
        name: data.client.name,
        email: data.client.email,
        avatar: undefined,
        joinDate: new Date(data.client.createdAt),
        status: 'active',
        currentPrograms: {},
        nextSession: undefined,
        progress: { workoutsCompleted: 0, adherenceRate: 0 },
      }, ...prev]);
      setShowAdd(false);
      setNewClient({ name: '', email: '' });
    } catch (e: any) {
      alert(e.message || 'Errore');
    }
  };

  const beginEdit = (c: Client) => { setEditId(c.id); setEditDraft({ name: c.name, email: c.email }); };
  const cancelEdit = () => { setEditId(null); };
  const saveEdit = async (id: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE_URL}/api/clients/${id}/basic`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Errore salvataggio');
      const data = await res.json();
      setClients(prev => prev.map(c => c.id === id ? { ...c, name: data.client.name, email: data.client.email } : c));
      setEditId(null);
    } catch (e: any) {
      alert(e.message || 'Errore');
    }
  };

  const exportProfile = async (id: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token') || '';
      
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}/profile-export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'esportazione del profilo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profilo-cliente-${id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e.message || 'Errore nell\'esportazione');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-muted rounded w-full sm:w-80 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Cerca clienti per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
            <option value="trial">In prova</option>
          </select>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">+ Nuovo Cliente</button>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nessun cliente trovato</div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{client.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</span>
                  </div>
                  <div>
                    {editId === client.id ? (
                      <div className="space-y-2">
                        <input className="border rounded px-2 py-1 w-full" value={editDraft.name} onChange={(e)=>setEditDraft(prev=>({ ...prev, name: e.target.value }))} />
                        <input className="border rounded px-2 py-1 w-full" value={editDraft.email} onChange={(e)=>setEditDraft(prev=>({ ...prev, email: e.target.value }))} />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Cliente dal {formatDate(client.joinDate)}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">{getStatusBadge(client.status)}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Programmi Attivi</p>
                  <div className="space-y-1">
                    {client.currentPrograms.workout ? <p className="text-sm">🏋️ {client.currentPrograms.workout}</p> : <p className="text-sm text-muted-foreground">Nessun workout</p>}
                    {client.currentPrograms.nutrition ? <p className="text-sm">🥗 {client.currentPrograms.nutrition}</p> : <p className="text-sm text-muted-foreground">Nessuna nutrizione</p>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Prossima Sessione</p>
                  {client.nextSession ? <p className="text-sm">{formatDate(client.nextSession)}</p> : <p className="text-sm text-muted-foreground">Non programmata</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Progressi</p>
                  <p className="text-sm">{client.progress.workoutsCompleted} allenamenti</p>
                  <p className="text-sm">{client.progress.adherenceRate}% aderenza</p>
                </div>
                <div className="flex flex-col space-y-2">
                  {editId === client.id ? (
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(client.id)} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Salva</button>
                      <button onClick={cancelEdit} className="flex-1 border py-2 rounded hover:bg-muted">Annulla</button>
                    </div>
                  ) : (
                    <>
                      <Link href={`/clients/${client.id}/profile`} className="px-3 py-2 text-xs bg-primary text-primary-foreground rounded text-center hover:bg-primary/90 transition-colors">Apri Profilo</Link>
                      <button onClick={()=>beginEdit(client)} className="px-3 py-2 text-xs border border-border rounded hover:bg-muted transition-colors">Modifica Anagrafica</button>
                      <button onClick={()=>exportProfile(client.id)} className="px-3 py-2 text-xs border border-border rounded hover:bg-muted transition-colors">Esporta Profilo</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Aggiungi Nuovo Cliente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input value={newClient.name} onChange={(e)=>setNewClient(prev=>({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input type="email" value={newClient.email} onChange={(e)=>setNewClient(prev=>({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowAdd(false)} className="flex-1 border py-2 rounded hover:bg-muted">Annulla</button>
              <button onClick={addClient} className="flex-1 bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90">Crea</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}