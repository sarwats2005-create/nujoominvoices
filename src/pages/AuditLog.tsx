import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, FileText, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  invoice_id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  user_email?: string;
}

const AuditLog: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    setLoading(true);
    
    const { data: auditLogs, error: logsError } = await supabase
      .from('invoice_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Error fetching audit logs:', logsError);
      setLoading(false);
      return;
    }

    // Fetch user emails for the logs
    const userIds = [...new Set((auditLogs || []).map(log => log.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const emailMap = new Map((profiles || []).map(p => [p.id, p.email]));

    const logsWithEmails = (auditLogs || []).map(log => ({
      ...log,
      action: log.action as 'create' | 'update' | 'delete',
      old_data: log.old_data as Record<string, unknown> | null,
      new_data: log.new_data as Record<string, unknown> | null,
      user_email: emailMap.get(log.user_id) || 'Unknown',
    }));

    setLogs(logsWithEmails);
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Pencil className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return t('invoiceCreatedLog');
      case 'update':
        return t('invoiceUpdatedLog');
      case 'delete':
        return t('invoiceDeletedLog');
      default:
        return action;
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{t('auditLog')}</CardTitle>
                <CardDescription>
                  Track all invoice changes across the system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('noAuditLogs')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('invoiceNumber')}</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)} className="gap-1">
                            {getActionIcon(log.action)}
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.user_email}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {(log.new_data?.invoice_number || log.old_data?.invoice_number || 'N/A') as string}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.action === 'update' && log.old_data && log.new_data ? (
                            <span className="text-xs text-muted-foreground">
                              {(() => {
                                const changes: string[] = [];
                                const oldData = log.old_data as Record<string, unknown>;
                                const newData = log.new_data as Record<string, unknown>;
                                for (const key of Object.keys(newData)) {
                                  if (oldData[key] !== newData[key] && key !== 'updated_at') {
                                    changes.push(key.replace('_', ' '));
                                  }
                                }
                                return changes.length > 0 ? `Changed: ${changes.slice(0, 3).join(', ')}${changes.length > 3 ? '...' : ''}` : 'No changes detected';
                              })()}
                            </span>
                          ) : log.action === 'create' ? (
                            <span className="text-xs text-success">New invoice</span>
                          ) : (
                            <span className="text-xs text-destructive">Removed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;
