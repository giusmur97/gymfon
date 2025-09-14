'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ConsentForm from '@/components/gdpr/ConsentForm';
import ConsentHistory from '@/components/gdpr/ConsentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, History, AlertTriangle } from 'lucide-react';

interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
  };
}

export default function ClientGDPRPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [consentStatus, setConsentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConsentForm, setShowConsentForm] = useState(false);

  useEffect(() => {
    fetchClientData();
    fetchConsentStatus();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  const fetchConsentStatus = async () => {
    try {
      const response = await fetch(`/api/gdpr/consents/${clientId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsentStatus(data);
      }
    } catch (error) {
      console.error('Error fetching consent status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentSubmit = async (consents: any[]) => {
    try {
      for (const consent of consents) {
        const response = await fetch('/api/gdpr/consents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            clientId,
            type: consent.type,
            isGranted: consent.isGranted,
            method: 'digital_signature',
            version: '1.0',
            ipAddress: window.location.hostname,
            userAgent: navigator.userAgent
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save consent');
        }
      }

      setShowConsentForm(false);
      fetchConsentStatus();
      alert('Consensi salvati con successo!');
    } catch (error) {
      console.error('Error saving consents:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Cliente non trovato</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Gestione GDPR
          </h1>
          <p className="text-muted-foreground mt-1">
            {client.firstName} {client.lastName} - {client.user.email}
          </p>
        </div>
        
        {consentStatus && (
          <div className="flex items-center gap-2">
            {consentStatus.hasAllRequiredConsents ? (
              <Badge variant="default" className="bg-green-500">
                <Shield className="w-3 h-3 mr-1" />
                GDPR Compliant
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Consensi Mancanti
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Alert for missing consents */}
      {consentStatus && !consentStatus.hasAllRequiredConsents && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-medium">Attenzione: Consensi GDPR Incompleti</div>
                <div className="text-sm">
                  Alcuni consensi obbligatori non sono stati forniti. È necessario completare 
                  la raccolta consensi per essere conformi al GDPR.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Stato Consensi
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Gestisci Consensi
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Storico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Stato Attuale Consensi GDPR</CardTitle>
              <CardDescription>
                Panoramica dello stato di conformità GDPR per questo cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(consentStatus.consents).map(([type, consent]: [string, any]) => (
                      <div key={type} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {type === 'general_privacy' && 'Trattamento Dati Personali'}
                              {type === 'health_data' && 'Trattamento Dati Sanitari'}
                              {type === 'marketing' && 'Comunicazioni Marketing'}
                              {type === 'medical_sharing' && 'Condivisione Dati Medici'}
                            </div>
                            {['general_privacy', 'health_data'].includes(type) && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Obbligatorio
                              </Badge>
                            )}
                          </div>
                          <Badge 
                            variant={consent?.isGranted ? "default" : "secondary"}
                            className={consent?.isGranted ? "bg-green-500" : ""}
                          >
                            {consent?.isGranted ? 'Concesso' : 'Non concesso'}
                          </Badge>
                        </div>
                        {consent && (
                          <div className="text-sm text-muted-foreground mt-2">
                            Ultimo aggiornamento: {new Date(consent.updatedAt).toLocaleString('it-IT')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setShowConsentForm(true)}>
                      {consentStatus.hasAllRequiredConsents ? 'Modifica Consensi' : 'Completa Consensi'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Nessun consenso registrato per questo cliente
                  </div>
                  <Button onClick={() => setShowConsentForm(true)}>
                    Raccogli Consensi GDPR
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          {showConsentForm ? (
            <ConsentForm
              clientId={clientId}
              existingConsents={consentStatus?.consents ? Object.values(consentStatus.consents) : []}
              onSubmit={handleConsentSubmit}
              onCancel={() => setShowConsentForm(false)}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground mb-4">
                  Clicca il pulsante per aprire il modulo di gestione consensi
                </div>
                <Button onClick={() => setShowConsentForm(true)}>
                  Apri Modulo Consensi
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <ConsentHistory clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}