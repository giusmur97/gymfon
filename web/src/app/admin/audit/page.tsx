'use client';

import { useState } from 'react';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import AuditStats from '@/components/audit/AuditStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, BarChart3, FileText } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Sistema Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoraggio e tracciamento delle attività del sistema per conformità e sicurezza
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Shield className="w-5 h-5" />
            <div>
              <div className="font-medium">Sistema di Audit Attivo</div>
              <div className="text-sm">
                Tutte le attività degli utenti vengono registrate automaticamente per garantire 
                la conformità GDPR e la sicurezza del sistema. I log includono timestamp, 
                utente, azione, risorsa coinvolta e dettagli delle modifiche.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Log Audit
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiche
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <AuditLogViewer showClientFilter={true} />
        </TabsContent>

        <TabsContent value="stats">
          <AuditStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}