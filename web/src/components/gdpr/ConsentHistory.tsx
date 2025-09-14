'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Eye, Download } from 'lucide-react';

interface ConsentRecord {
  id: string;
  type: string;
  isGranted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  method: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsentHistoryProps {
  clientId: string;
}

const CONSENT_TYPE_LABELS = {
  general_privacy: 'Trattamento Dati Personali',
  health_data: 'Trattamento Dati Sanitari',
  marketing: 'Comunicazioni Marketing',
  medical_sharing: 'Condivisione Dati Medici'
};

const METHOD_LABELS = {
  digital_signature: 'Firma Digitale',
  checkbox: 'Checkbox Online',
  verbal: 'Consenso Verbale',
  paper: 'Modulo Cartaceo'
};

export default function ConsentHistory({ clientId }: ConsentHistoryProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    fetchConsents();
  }, [clientId]);

  const fetchConsents = async () => {
    try {
      const response = await fetch(`/api/gdpr/consents/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsents(data);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async (consentId: string) => {
    if (!confirm('Sei sicuro di voler revocare questo consenso?')) {
      return;
    }

    try {
      const response = await fetch('/api/gdpr/consents/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          consentId,
          reason: 'Revocato dall\'utente'
        })
      });

      if (response.ok) {
        fetchConsents(); // Refresh the list
      } else {
        alert('Errore durante la revoca del consenso');
      }
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      alert('Errore durante la revoca del consenso');
    }
  };

  const exportConsentData = async () => {
    try {
      const response = await fetch('/api/gdpr/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          clientId,
          format: 'json'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gdpr-export-${clientId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Errore durante l\'export dei dati');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Errore durante l\'export dei dati');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento storico consensi...</div>
        </CardContent>
      </Card>
    );
  }

  // Group consents by type to show current status
  const consentsByType = consents.reduce((acc, consent) => {
    if (!acc[consent.type] || new Date(consent.createdAt) > new Date(acc[consent.type].createdAt)) {
      acc[consent.type] = consent;
    }
    return acc;
  }, {} as Record<string, ConsentRecord>);

  const requiredConsents = ['general_privacy', 'health_data'];
  const hasAllRequiredConsents = requiredConsents.every(type => 
    consentsByType[type]?.isGranted
  );

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Stato Attuale Consensi
            {hasAllRequiredConsents ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Compliant
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Incompleto
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Panoramica dello stato attuale dei consensi GDPR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(CONSENT_TYPE_LABELS).map(([type, label]) => {
              const consent = consentsByType[type];
              const isRequired = requiredConsents.includes(type);
              
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{label}</div>
                    {isRequired && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Obbligatorio
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {consent?.isGranted ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concesso
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Non concesso
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={exportConsentData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Esporta Dati GDPR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consent History */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Consensi</CardTitle>
          <CardDescription>
            Cronologia completa di tutti i consensi registrati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun consenso registrato
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Versione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>
                      {CONSENT_TYPE_LABELS[consent.type as keyof typeof CONSENT_TYPE_LABELS]}
                    </TableCell>
                    <TableCell>
                      {consent.isGranted ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concesso
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Revocato
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {METHOD_LABELS[consent.method as keyof typeof METHOD_LABELS]}
                    </TableCell>
                    <TableCell>
                      {consent.isGranted 
                        ? new Date(consent.grantedAt!).toLocaleString('it-IT')
                        : consent.revokedAt 
                          ? new Date(consent.revokedAt).toLocaleString('it-IT')
                          : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{consent.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedConsent(consent)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Dettagli Consenso</DialogTitle>
                              <DialogDescription>
                                Informazioni complete sul consenso registrato
                              </DialogDescription>
                            </DialogHeader>
                            {selectedConsent && (
                              <div className="space-y-4">
                                <div>
                                  <strong>Tipo:</strong> {CONSENT_TYPE_LABELS[selectedConsent.type as keyof typeof CONSENT_TYPE_LABELS]}
                                </div>
                                <div>
                                  <strong>Stato:</strong> {selectedConsent.isGranted ? 'Concesso' : 'Revocato'}
                                </div>
                                <div>
                                  <strong>Metodo:</strong> {METHOD_LABELS[selectedConsent.method as keyof typeof METHOD_LABELS]}
                                </div>
                                <div>
                                  <strong>Versione:</strong> {selectedConsent.version}
                                </div>
                                {selectedConsent.ipAddress && (
                                  <div>
                                    <strong>IP Address:</strong> {selectedConsent.ipAddress}
                                  </div>
                                )}
                                {selectedConsent.userAgent && (
                                  <div>
                                    <strong>User Agent:</strong> 
                                    <div className="text-sm text-muted-foreground mt-1 break-all">
                                      {selectedConsent.userAgent}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <strong>Creato:</strong> {new Date(selectedConsent.createdAt).toLocaleString('it-IT')}
                                </div>
                                <div>
                                  <strong>Ultimo Aggiornamento:</strong> {new Date(selectedConsent.updatedAt).toLocaleString('it-IT')}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {consent.isGranted && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleWithdrawConsent(consent.id)}
                          >
                            Revoca
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}