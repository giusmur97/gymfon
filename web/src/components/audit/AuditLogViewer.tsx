'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes?: any;
  user: {
    name: string;
    email: string;
    role: string;
  };
  client?: {
    firstName: string;
    lastName: string;
    user: {
      email: string;
    };
  };
}

interface AuditLogViewerProps {
  clientId?: string;
  showClientFilter?: boolean;
}

const ACTION_COLORS = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  LOGIN: 'bg-purple-500',
  LOGOUT: 'bg-gray-500',
  UPLOAD: 'bg-orange-500',
  DOWNLOAD: 'bg-cyan-500',
  EXPORT: 'bg-indigo-500'
};

const RESOURCE_TYPE_LABELS = {
  User: 'Utente',
  ClientProfile: 'Profilo Cliente',
  BodyMeasurement: 'Misurazione',
  ClientPhoto: 'Foto Cliente',
  ClientDocument: 'Documento',
  GDPRConsent: 'Consenso GDPR',
  WorkoutPlan: 'Piano Allenamento',
  NutritionPlan: 'Piano Nutrizionale',
  TrainingSession: 'Sessione Allenamento',
  Course: 'Corso',
  AuditLog: 'Log Audit'
};

export default function AuditLogViewer({ clientId, showClientFilter = true }: AuditLogViewerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [clientId, currentPage, actionFilter, resourceTypeFilter, userFilter, startDate, endDate]);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      
      if (clientId) params.append('clientId', clientId);
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);
      if (userFilter) params.append('userId', userFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const endpoint = clientId 
        ? `/api/audit/client/${clientId}?${params}`
        : `/api/audit?${params}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const exportData = {
        clientId,
        action: actionFilter,
        resourceType: resourceTypeFilter,
        userId: userFilter,
        startDate,
        endDate,
        format
      };

      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        alert('Errore durante l\'export dei log');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      alert('Errore durante l\'export dei log');
    }
  };

  const getActionColor = (action: string) => {
    const actionType = action.split('_')[0];
    return ACTION_COLORS[actionType as keyof typeof ACTION_COLORS] || 'bg-gray-500';
  };

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const filteredLogs = auditLogs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(searchLower) ||
        log.user.name.toLowerCase().includes(searchLower) ||
        log.user.email.toLowerCase().includes(searchLower) ||
        log.resourceType.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento log audit...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Log Audit
          <Badge variant="outline">{totalCount} record</Badge>
        </CardTitle>
        <CardDescription>
          Cronologia completa delle attività del sistema per conformità e sicurezza
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca nei log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per azione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le azioni</SelectItem>
              <SelectItem value="CREATE">Creazione</SelectItem>
              <SelectItem value="UPDATE">Modifica</SelectItem>
              <SelectItem value="DELETE">Eliminazione</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="UPLOAD">Caricamento</SelectItem>
              <SelectItem value="EXPORT">Export</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per risorsa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutte le risorse</SelectItem>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={() => handleExport('json')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium">Data inizio</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Data fine</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Audit Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nessun log audit trovato
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Azione</TableHead>
                  <TableHead>Risorsa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.user.name}</div>
                        <div className="text-sm text-muted-foreground">{log.user.email}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {log.user.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(log.action)} text-white`}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {RESOURCE_TYPE_LABELS[log.resourceType as keyof typeof RESOURCE_TYPE_LABELS] || log.resourceType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {log.resourceId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.client ? (
                        <div>
                          <div className="font-medium">
                            {log.client.firstName} {log.client.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.client.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatUserAgent(log.userAgent)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Dettagli Log Audit</DialogTitle>
                            <DialogDescription>
                              Informazioni complete sull'attività registrata
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLog && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>ID Log:</strong> {selectedLog.id}
                                </div>
                                <div>
                                  <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString('it-IT')}
                                </div>
                                <div>
                                  <strong>Utente:</strong> {selectedLog.user.name} ({selectedLog.user.email})
                                </div>
                                <div>
                                  <strong>Ruolo:</strong> {selectedLog.user.role}
                                </div>
                                <div>
                                  <strong>Azione:</strong> {selectedLog.action}
                                </div>
                                <div>
                                  <strong>Tipo Risorsa:</strong> {selectedLog.resourceType}
                                </div>
                                <div>
                                  <strong>ID Risorsa:</strong> {selectedLog.resourceId}
                                </div>
                                <div>
                                  <strong>Indirizzo IP:</strong> {selectedLog.ipAddress}
                                </div>
                              </div>
                              
                              {selectedLog.client && (
                                <div>
                                  <strong>Cliente Coinvolto:</strong> {selectedLog.client.firstName} {selectedLog.client.lastName} ({selectedLog.client.user.email})
                                </div>
                              )}
                              
                              <div>
                                <strong>User Agent:</strong>
                                <div className="text-sm text-muted-foreground mt-1 break-all">
                                  {selectedLog.userAgent}
                                </div>
                              </div>
                              
                              {selectedLog.changes && (
                                <div>
                                  <strong>Modifiche:</strong>
                                  <pre className="text-sm bg-muted p-3 rounded-lg mt-2 overflow-auto">
                                    {JSON.stringify(selectedLog.changes, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Pagina {currentPage} di {totalPages} ({totalCount} record totali)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Successiva
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}