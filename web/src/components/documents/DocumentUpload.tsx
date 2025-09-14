'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  clientId: string;
  onUploadComplete: () => void;
  onCancel?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'medical_certificate', label: 'Certificato Medico' },
  { value: 'self_certification', label: 'Autocertificazione' },
  { value: 'consent', label: 'Consenso' },
  { value: 'other', label: 'Altro' }
];

export default function DocumentUpload({ clientId, onUploadComplete, onCancel }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    }
  }, [documentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentType) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('clientId', clientId);
      formData.append('name', documentName);
      formData.append('type', documentType);
      if (expiryDate) {
        formData.append('expiryDate', expiryDate);
      }
      if (notes) {
        formData.append('notes', notes);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          onUploadComplete();
          resetForm();
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.error || 'Errore durante il caricamento');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Errore di rete durante il caricamento');
        setUploading(false);
      });

      xhr.open('POST', '/api/documents/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Errore durante il caricamento del documento');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentName('');
    setDocumentType('');
    setExpiryDate('');
    setNotes('');
    setUploadProgress(0);
    setError('');
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Carica Documento
        </CardTitle>
        <CardDescription>
          Carica un nuovo documento per il cliente. Formati supportati: PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-primary">Rilascia il file qui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Trascina un file qui o clicca per selezionare
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">
                  Caricamento... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Document Metadata Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentName">Nome Documento *</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Inserisci il nome del documento"
              disabled={uploading}
            />
          </div>

          <div>
            <Label htmlFor="documentType">Tipo Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tipo di documento" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiryDate">Data di Scadenza</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Opzionale - per documenti con scadenza
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive sul documento..."
              rows={3}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentName || !documentType || uploading}
            className="flex-1"
          >
            {uploading ? 'Caricamento...' : 'Carica Documento'}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Annulla
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}