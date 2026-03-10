import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Package, CheckCircle, FolderOpen, FileText } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UsedBL } from '@/types/usedBL';

const UnusedBLOwnerDetail: React.FC = () => {
  const { ownerName } = useParams<{ ownerName: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { records: unusedRecords, loading: unusedLoading } = useUnusedBL();
  const [usedRecords, setUsedRecords] = useState<UsedBL[]>([]);

  const decodedOwner = decodeURIComponent(ownerName || '');

  // Fetch ALL used_bl_counting records for this owner (across all dashboards)
  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await (supabase as any).from('used_bl_counting')
        .select('*')
        .eq('user_id', user.id)
        .eq('owner', decodedOwner)
        .eq('is_active', true)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (data) setUsedRecords(data as UsedBL[]);
    };
    fetch();
  }, [user, decodedOwner]);

  const ownerUnused = useMemo(() =>
    unusedRecords.filter(r => r.owner === decodedOwner),
    [unusedRecords, decodedOwner]
  );

  const stats = useMemo(() => ({
    totalBL: ownerUnused.length,
    unused: ownerUnused.filter(r => r.status === 'UNUSED').length,
    used: ownerUnused.filter(r => r.status === 'USED').length,
    totalUsedAmount: usedRecords.reduce((sum, r) => sum + (r.invoice_amount || 0), 0),
    usedInDashboard: usedRecords.length,
  }), [ownerUnused, usedRecords]);

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  const exportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Statement', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Owner: ${decodedOwner}`, 14, 35);
    doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 42);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total B/L Records: ${stats.totalBL}`, 14, 62);
    doc.text(`Unused: ${stats.unused}`, 14, 68);
    doc.text(`Used (Converted): ${stats.used}`, 14, 74);
    doc.text(`Used in Dashboard: ${stats.usedInDashboard}`, 14, 80);
    doc.text(`Total Invoice Amount: $${stats.totalUsedAmount.toLocaleString()}`, 14, 86);

    let yPos = 96;

    if (ownerUnused.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('B/L Records', 14, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['B/L No', 'Container', 'Category', 'B/L Date', 'Port', 'Status']],
        body: ownerUnused.map(r => [
          r.bl_no, r.container_no, r.product_category,
          formatDate(r.bl_date), r.port_of_loading, r.status,
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    if (usedRecords.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Used B/L (Invoice Details)', 14, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['B/L No', 'Container', 'Used For', 'Bank', 'Amount', 'Invoice Date']],
        body: usedRecords.map(r => [
          r.bl_no, r.container_no, r.used_for, r.bank,
          `$${(r.invoice_amount || 0).toLocaleString()}`, formatDate(r.invoice_date),
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;

      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount Used: $${stats.totalUsedAmount.toLocaleString()}`, 14, yPos);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Generated by Nujoom Invoices', 14, 290);
    }

    doc.save(`${decodedOwner}_Account_Statement_${format(new Date(), 'yyyyMMdd')}.pdf`);
  }, [decodedOwner, ownerUnused, usedRecords, stats]);

  if (unusedLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/unused-bl')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{decodedOwner}</h1>
            <p className="text-sm text-muted-foreground">Owner Account Statement</p>
          </div>
        </div>
        <Button onClick={exportPDF} className="gap-2">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><FolderOpen className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalBL}</p>
              <p className="text-xs text-muted-foreground">Total B/L</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.unused}</p>
              <p className="text-xs text-muted-foreground">Unused</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.usedInDashboard}</p>
              <p className="text-xs text-muted-foreground">Used in Dashboard</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><FileText className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">${stats.totalUsedAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unused B/L Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> B/L Records ({ownerUnused.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>B/L No</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">B/L Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Port</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerUnused.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No B/L records</TableCell>
                  </TableRow>
                ) : ownerUnused.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-medium">{r.bl_no}</TableCell>
                    <TableCell className="font-mono">{r.container_no}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="secondary">{r.product_category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(r.bl_date)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.port_of_loading}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'UNUSED' ? 'default' : 'secondary'}
                        className={r.status === 'USED' ? 'bg-success/20 text-success border-success/30' : ''}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Used B/L Records */}
      {usedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" /> Used B/L - Invoice Details ({usedRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>B/L No</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Used For</TableHead>
                    <TableHead className="hidden md:table-cell">Bank</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Invoice Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usedRecords.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono font-medium">{r.bl_no}</TableCell>
                      <TableCell className="font-mono">{r.container_no}</TableCell>
                      <TableCell>{r.used_for}</TableCell>
                      <TableCell className="hidden md:table-cell">{r.bank}</TableCell>
                      <TableCell className="font-mono font-bold">${(r.invoice_amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(r.invoice_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="p-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount Used</p>
                <p className="text-xl font-bold text-foreground">${stats.totalUsedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnusedBLOwnerDetail;
