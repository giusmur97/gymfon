'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import DocumentValidation from '@/components/documents/DocumentValidation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Shield, Plus } from 'lucide-react';

export default function ClientDocumentsPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setShowUploadForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleDocumentEdit = (document: any) => {
    // TODO: Implement document editing
    console.log('Edit document:', document);
  };

  const handleDocumentDelete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Gestione Documenti
          </h1>
          <p className="text-muted-foreground mt-1">
            Carica, gestisci e monitora i documenti del cliente
          </p>
        </div>
        
        <Button onClick={() => setShowUploadForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Carica Documento
        </Button>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DocumentUpload
              clientId={clientId}
              onUploadComplete={handleUploadComplete}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Elenco Documenti
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Validazione
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Carica Nuovo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <DocumentList
            key={refreshKey}
            clientId={clientId}
            onEdit={handleDocumentEdit}
            onDelete={handleDocumentDelete}
          />
        </TabsContent>

        <TabsContent value="validation">
          <DocumentValidation key={refreshKey} clientId={clientId} />
        </TabsContent>

        <TabsContent value="upload">
          <DocumentUpload
            clientId={clientId}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}