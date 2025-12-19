import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice, Invoice } from '@/contexts/InvoiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Copy, FileText, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'invoiceNumber' | 'amount' | 'date' | 'beneficiary' | 'bank' | 'status';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { invoices, updateInvoiceStatus } = useInvoice();
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedInvoices = [...invoices].sort((a, b) => {
    let comparison = 0;
    if (sortKey === 'amount') comparison = a.amount - b.amount;
    else if (sortKey === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    else comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    updateInvoiceStatus(id, checked ? 'received' : 'pending');
  };

  const copyTableToClipboard = () => {
    const headers = [t('invoiceNumber'), t('invoiceAmount'), t('invoiceDate'), t('beneficiary'), t('bank'), t('status')];
    const rows = sortedInvoices.map(inv => [
      inv.invoiceNumber,
      inv.amount.toFixed(2),
      format(new Date(inv.date), 'yyyy-MM-dd'),
      inv.beneficiary,
      inv.bank,
      inv.status === 'received' ? t('received') : t('pending'),
    ]);
    const text = [headers, ...rows].map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: t('tableCopied') });
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort(sortKeyName)}>
      <div className="flex items-center gap-1">{label}<ArrowUpDown className="h-3 w-3" /></div>
    </TableHead>
  );

  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />{t('allInvoices')}
          </CardTitle>
          <Button onClick={copyTableToClipboard} variant="outline" size="sm" disabled={!invoices.length}>
            <Copy className="h-4 w-4 mr-2" />{t('copyTable')}
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t('noInvoices')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{t('status')}</TableHead>
                    <SortHeader label={t('invoiceNumber')} sortKeyName="invoiceNumber" />
                    <SortHeader label={t('invoiceAmount')} sortKeyName="amount" />
                    <SortHeader label={t('invoiceDate')} sortKeyName="date" />
                    <SortHeader label={t('beneficiary')} sortKeyName="beneficiary" />
                    <SortHeader label={t('bank')} sortKeyName="bank" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((inv) => (
                    <TableRow key={inv.id} className={cn(inv.status === 'received' && 'bg-success/10')}>
                      <TableCell>
                        <Checkbox checked={inv.status === 'received'} onCheckedChange={(c) => handleStatusChange(inv.id, !!c)} />
                      </TableCell>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(inv.date), 'PPP')}</TableCell>
                      <TableCell>{inv.beneficiary}</TableCell>
                      <TableCell>{inv.bank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
