'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  FileText,
  Shield,
  Clock
} from 'lucide-react';

interface ValidationStatus {
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  documentsByType: Record<string, number>;
  missingRequired: string[];
}

interface DocumentValidationProps {
  clientId: string;
}

const DOCUMENT_TYPE_LABELS = {
  medical_certificate: 'Certificato Medico',
  self_certification: 'Autocertificazione',
  consent: 'Consenso',
  other: 'Altro'
};

const REQUIRED_DOCUMENTS = ['medical_certificate', 'self_certification'];

export default function DocumentValidation({ clientId }: DocumentValidationProps) {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchValidationStatus();
  }, [clientId]);

  const fetchValidationStatus = async () => {
    try {
      const response = await fetch(`/api/documents/validation-status/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setValidationStatus(data);
      }
    } catch (error) {
      console.error('Error fetching validation status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento stato validazione...</div>
        </CardContent>
      </Card>
    );
  }

  if (!validationStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Errore nel caricamento dello stato</div>
        </CardContent>
      </Card>
    );
  }

  const compliancePercentage = validationStatus.totalDocuments > 0 
    ? Math.round((validationStatus.validDocuments / validationStatus.totalDocuments) * 100)
    : 0;

  const isCompliant = validationStatus.missingRequired.length === 0 && 
                     validationStatus.expiredDocuments === 0;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Stato Validazione Documenti
            {isCompliant ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Conforme
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Non Conforme
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Panoramica dello stato di conformità documentale del cliente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Compliance Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Conformità Documenti</span>
              <span className="text-sm text-muted-foreground">{compliancePercentage}%</span>
            </div>
            <Progress value={compliancePercentage} className="w-full" />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {validationStatus.totalDocuments}
              </div>
              <div className="text-sm text-muted-foreground">Totale</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {validationStatus.validDocuments}
              </div>
              <div className="text-sm text-muted-foreground">Validi</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {validationStatus.expiringDocuments}
              </div>
              <div className="text-sm text-muted-foreground">In Scadenza</div>
            </div>
            
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {validationStatus.expiredDocuments}
              </div>
              <div className="text-sm text-muted-foreground">Scaduti</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Required Documents */}
      {validationStatus.missingRequired.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <XCircle className="w-5 h-5" />
              Documenti Obbligatori Mancanti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationStatus.missingRequired.map((docType) => (
                <div key={docType} className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{DOCUMENT_TYPE_LABELS[docType as keyof typeof DOCUMENT_TYPE_LABELS]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              È necessario caricare questi documenti per completare la conformità.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documenti per Tipologia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => {
              const count = validationStatus.documentsByType[type] || 0;
              const isRequired = REQUIRED_DOCUMENTS.includes(type);
              const isMissing = validationStatus.missingRequired.includes(type);
              
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                    {isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Obbligatorio
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={count > 0 ? "default" : "secondary"}>
                      {count} documento{count !== 1 ? 'i' : ''}
                    </Badge>
                    {isMissing && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Mancante
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      {(validationStatus.expiredDocuments > 0 || validationStatus.expiringDocuments > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Clock className="w-5 h-5" />
              Avvisi Scadenze
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationStatus.expiredDocuments > 0 && (
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {validationStatus.expiredDocuments} documento{validationStatus.expiredDocuments !== 1 ? 'i' : ''} scadut{validationStatus.expiredDocuments !== 1 ? 'i' : 'o'}
                </span>
              </div>
            )}
            
            {validationStatus.expiringDocuments > 0 && (
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Calendar className="w-4 h-4" />
                <span>
                  {validationStatus.expiringDocuments} documento{validationStatus.expiringDocuments !== 1 ? 'i' : ''} in scadenza nei prossimi 30 giorni
                </span>
              </div>
            )}
            
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Contatta il cliente per rinnovare i documenti scaduti o in scadenza.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button onClick={fetchValidationStatus} variant="outline">
          Aggiorna Stato Validazione
        </Button>
      </div>
    </div>
  );
}