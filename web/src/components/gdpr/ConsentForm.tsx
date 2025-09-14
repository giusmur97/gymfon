'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ConsentItem {
  type: 'general_privacy' | 'health_data' | 'marketing' | 'medical_sharing';
  title: string;
  description: string;
  required: boolean;
  isGranted: boolean;
}

interface ConsentFormProps {
  clientId: string;
  existingConsents?: any[];
  onSubmit: (consents: ConsentItem[]) => Promise<void>;
  onCancel?: () => void;
}

const CONSENT_TYPES: Omit<ConsentItem, 'isGranted'>[] = [
  {
    type: 'general_privacy',
    title: 'Trattamento Dati Personali',
    description: 'Consenso al trattamento dei dati personali per la fornitura dei servizi di personal training secondo il GDPR.',
    required: true
  },
  {
    type: 'health_data',
    title: 'Trattamento Dati Sanitari',
    description: 'Consenso al trattamento dei dati relativi alla salute, misurazioni corporee e anamnesi per la personalizzazione dei servizi.',
    required: true
  },
  {
    type: 'marketing',
    title: 'Comunicazioni Marketing',
    description: 'Consenso per ricevere comunicazioni promozionali, newsletter e offerte commerciali.',
    required: false
  },
  {
    type: 'medical_sharing',
    title: 'Condivisione Dati Medici',
    description: 'Consenso per la condivisione di dati sanitari con professionisti medici per consulenze specialistiche.',
    required: false
  }
];

export default function ConsentForm({ clientId, existingConsents = [], onSubmit, onCancel }: ConsentFormProps) {
  const [consents, setConsents] = useState<ConsentItem[]>(() => {
    return CONSENT_TYPES.map(consentType => {
      const existing = existingConsents.find(c => c.type === consentType.type);
      return {
        ...consentType,
        isGranted: existing?.isGranted || false
      };
    });
  });

  const [digitalSignature, setDigitalSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentChange = (type: string, granted: boolean) => {
    setConsents(prev => prev.map(consent => 
      consent.type === type ? { ...consent, isGranted: granted } : consent
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredConsents = consents.filter(c => c.required);
    const hasAllRequired = requiredConsents.every(c => c.isGranted);
    
    if (!hasAllRequired) {
      alert('È necessario fornire tutti i consensi obbligatori per procedere.');
      return;
    }

    if (!digitalSignature.trim()) {
      alert('È necessario inserire la firma digitale per confermare i consensi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(consents);
    } catch (error) {
      console.error('Error submitting consents:', error);
      alert('Errore durante il salvataggio dei consensi. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredConsentsGranted = consents.filter(c => c.required).every(c => c.isGranted);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Gestione Consensi GDPR</span>
          <Badge variant="outline">Versione 1.0</Badge>
        </CardTitle>
        <CardDescription>
          Gestisci i consensi per il trattamento dei dati personali secondo il Regolamento Generale sulla Protezione dei Dati (GDPR).
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {consents.map((consent) => (
              <div key={consent.type} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={consent.type}
                    checked={consent.isGranted}
                    onCheckedChange={(checked) => 
                      handleConsentChange(consent.type, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={consent.type} className="text-base font-medium flex items-center gap-2">
                      {consent.title}
                      {consent.required && (
                        <Badge variant="destructive" className="text-xs">
                          Obbligatorio
                        </Badge>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {consent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <Label htmlFor="signature" className="text-base font-medium">
                Firma Digitale *
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Inserisci il tuo nome completo per confermare digitalmente i consensi selezionati.
              </p>
              <Textarea
                id="signature"
                placeholder="Inserisci il tuo nome completo..."
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                className="resize-none"
                rows={2}
                required
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Informativa:</strong> I tuoi consensi verranno registrati con timestamp, 
                indirizzo IP e informazioni del browser per garantire la tracciabilità secondo il GDPR. 
                Puoi modificare o revocare i consensi in qualsiasi momento.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!requiredConsentsGranted || !digitalSignature.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Consensi'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}