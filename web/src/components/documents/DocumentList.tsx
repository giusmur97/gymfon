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
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Search,
  Filter
} from 'lucide-react';

interface Document {
  id: string;
  type: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudUrl: string;
  downloadUrl?: string;
  uploadDate: string;
  expiryDate?: string;
  isValid: boolean;
  uploader: {
    name: string;
    email: string;
  };
}

interface DocumentListProps {
  clientId: string;
  onEdit?: (document: Document) => void;
  onDelete?: (documentId: string) => void;
}

const DOCUMENT_TYPE_LABELS = {
  medical_certificate: 'Certificato Medico',
  self_certification: 'Autocertificazione',
  consent: 'Consenso',
  other: 'Altro'
};

const DOCUMENT_TYPE_COLORS = {
  medical_certificate: 'bg-blue-500',
  self_certification: 'bg-green-500',
  consent: 'bg-purple-500',
  other: 'bg-gray-500'
};

export default function DocumentList({ clientId, onEdit, onDelete }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(doc => {
        switch (statusFilter) {
          case 'valid':
            return doc.isValid && (!doc.expiryDate || new Date(doc.expiryDate) > now);
          case 'expired':
            return doc.expiryDate && new Date(doc.expiryDate) < now;
          case 'expiring':
            if (!doc.expiryDate) return false;
            const expiryDate = new Date(doc.expiryDate);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return expiryDate <= thirtyDaysFromNow && expiryDate > now;
          case 'invalid':
            return !doc.isValid;
          default:
            return true;
        }
      });
    }

    setFilteredDocuments(filtered);
  };

  const handleDownload = (document: Document) => {
    const downloadUrl = document.downloadUrl || document.cloudUrl;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchDocuments();
        if (onDelete) {
          onDelete(documentId);
        }
      } else {
        alert('Errore durante l\'eliminazione del documento');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Errore durante l\'eliminazione del documento');
    }
  };

  const getDocumentStatus = (document: Document) => {
    if (!document.isValid) {
      return { label: 'Non Valido', color: 'destructive', icon: AlertTriangle };
    }

    if (document.expiryDate) {
      const expiryDate = new Date(document.expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiryDate < now) {
        return { label: 'Scaduto', color: 'destructive', icon: AlertTriangle };
      } else if (expiryDate <= thirtyDaysFromNow) {
        return { label: 'In Scadenza', color: 'warning', icon: Calendar };
      }
    }

    return { label: 'Valido', color: 'default', icon: CheckCircle };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento documenti...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documenti Cliente
        </CardTitle>
        <CardDescription>
          Gestisci tutti i documenti del cliente con controllo scadenze
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca documenti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stato documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="valid">Validi</SelectItem>
              <SelectItem value="expiring">In scadenza</SelectItem>
              <SelectItem value="expired">Scaduti</SelectItem>
              <SelectItem value="invalid">Non validi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {documents.length === 0 
              ? 'Nessun documento caricato' 
              : 'Nessun documento trovato con i filtri selezionati'
            }
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead>Dimensione</TableHead>
                <TableHead>Caricato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => {
                const status = getDocumentStatus(document);
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.name}</div>
                        <div className="text-sm text-muted-foreground">{document.fileName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${DOCUMENT_TYPE_COLORS[document.type as keyof typeof DOCUMENT_TYPE_COLORS]} text-white`}
                      >
                        {DOCUMENT_TYPE_LABELS[document.type as keyof typeof DOCUMENT_TYPE_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.color as any} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {document.expiryDate ? (
                        <div className="text-sm">
                          {new Date(document.expiryDate).toLocaleDateString('it-IT')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatFileSize(document.fileSize)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(document.uploadDate).toLocaleDateString('it-IT')}</div>
                        <div className="text-muted-foreground">{document.uploader.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedDocument(document)}
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Dettagli Documento</DialogTitle>
                              <DialogDescription>
                                Informazioni complete sul documento
                              </DialogDescription>
                            </DialogHeader>
                            {selectedDocument && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>Nome:</strong> {selectedDocument.name}
                                  </div>
                                  <div>
                                    <strong>Tipo:</strong> {DOCUMENT_TYPE_LABELS[selectedDocument.type as keyof typeof DOCUMENT_TYPE_LABELS]}
                                  </div>
                                  <div>
                                    <strong>File:</strong> {selectedDocument.fileName}
                                  </div>
                                  <div>
                                    <strong>Dimensione:</strong> {formatFileSize(selectedDocument.fileSize)}
                                  </div>
                                  <div>
                                    <strong>Formato:</strong> {selectedDocument.mimeType}
                                  </div>
                                  <div>
                                    <strong>Caricato il:</strong> {new Date(selectedDocument.uploadDate).toLocaleString('it-IT')}
                                  </div>
                                  <div>
                                    <strong>Caricato da:</strong> {selectedDocument.uploader.name}
                                  </div>
                                  {selectedDocument.expiryDate && (
                                    <div>
                                      <strong>Scadenza:</strong> {new Date(selectedDocument.expiryDate).toLocaleDateString('it-IT')}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                  <Button onClick={() => handleDownload(selectedDocument)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Scarica
                                  </Button>
                                  {onEdit && (
                                    <Button variant="outline" onClick={() => onEdit(selectedDocument)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Modifica
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(document)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}