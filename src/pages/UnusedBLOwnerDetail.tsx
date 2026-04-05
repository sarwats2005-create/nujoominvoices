import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnusedBL } from '@/hooks/useUnusedBL';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, currencies } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Package, CheckCircle, FolderOpen, FileText, Users, Calendar, Archive, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UsedBL, BLDashboard } from '@/types/usedBL';

const UnusedBLOwnerDetail: React.FC = () => {
  const { ownerName } = useParams<{ ownerName: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { logo, contactInfo } = useSettings();
  const { records: unusedRecords, loading: unusedLoading } = useUnusedBL();
  const [usedRecords, setUsedRecords] = useState<UsedBL[]>([]);
  const [archivedUsedRecords, setArchivedUsedRecords] = useState<UsedBL[]>([]);
  const [dashboards, setDashboards] = useState<BLDashboard[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [statementFormat, setStatementFormat] = useState<'professional' | 'government'>('professional');

  const decodedOwner = decodeURIComponent(ownerName || '');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [usedRes, archivedRes, dashRes] = await Promise.all([
        (supabase as any).from('used_bl_counting')
          .select('*')
          .eq('user_id', user.id)
          .eq('owner', decodedOwner)
          .eq('is_active', true)
          .eq('is_archived', false)
          .order('created_at', { ascending: false }),
        (supabase as any).from('used_bl_counting')
          .select('*')
          .eq('user_id', user.id)
          .eq('owner', decodedOwner)
          .eq('is_active', true)
          .eq('is_archived', true)
          .order('created_at', { ascending: false }),
        (supabase as any).from('bl_dashboards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
      ]);
      if (usedRes.data) setUsedRecords(usedRes.data as UsedBL[]);
      if (archivedRes.data) setArchivedUsedRecords(archivedRes.data as UsedBL[]);
      if (dashRes.data) setDashboards(dashRes.data as BLDashboard[]);
    };
    fetchData();
  }, [user, decodedOwner]);

  const ownerUnused = useMemo(() =>
    unusedRecords.filter(r => r.owner === decodedOwner),
    [unusedRecords, decodedOwner]
  );

  const dashboardMap = useMemo(() => {
    const map: Record<string, string> = {};
    dashboards.forEach(d => { map[d.id] = d.name; });
    return map;
  }, [dashboards]);

  // Filter by date range
  const inDateRange = useCallback((dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      return isWithinInterval(d, { start: parseISO(dateFrom), end: parseISO(dateTo) });
    } catch { return true; }
  }, [dateFrom, dateTo]);

  // Active used records filtered by date
  const filteredUsed = useMemo(() =>
    usedRecords.filter(r => inDateRange(r.invoice_date)),
    [usedRecords, inDateRange]
  );

  // Filtered unused by date (bl_date)
  const filteredUnused = useMemo(() =>
    ownerUnused.filter(r => inDateRange(r.bl_date)),
    [ownerUnused, inDateRange]
  );

  // Archived (only shown when toggle is on)
  const filteredArchived = useMemo(() =>
    includeArchived ? archivedUsedRecords.filter(r => inDateRange(r.invoice_date)) : [],
    [archivedUsedRecords, inDateRange, includeArchived]
  );

  // All used for calculations (active only, no archived)
  const allDisplayedUsed = useMemo(() => [...filteredUsed, ...filteredArchived], [filteredUsed, filteredArchived]);

  // Group by dashboard
  const usedByDashboard = useMemo(() => {
    const groups: Record<string, UsedBL[]> = {};
    filteredUsed.forEach(r => {
      const key = r.dashboard_id || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [filteredUsed]);

  // Customer breakdown
  const customerBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsed.forEach(r => {
      const customer = r.used_for || 'Unknown';
      counts[customer] = (counts[customer] || 0) + 1;
    });
    return counts;
  }, [filteredUsed]);

  // Currency-grouped totals
  const totalsByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    filteredUsed.forEach(r => {
      const c = r.currency || 'USD';
      map[c] = (map[c] || 0) + (r.invoice_amount || 0);
    });
    return map;
  }, [filteredUsed]);

  const getCurrSymbol = (code: string) => currencies.find(c => c.code === code)?.symbol || code;

  const stats = useMemo(() => ({
    totalBL: filteredUnused.length,
    unused: filteredUnused.filter(r => r.status === 'UNUSED').length,
    used: filteredUnused.filter(r => r.status === 'USED').length,
    usedInDashboard: filteredUsed.length,
    totalCustomers: Object.keys(customerBreakdown).length,
    totalArchived: filteredArchived.length,
    remainingUnused: filteredUnused.filter(r => r.status === 'UNUSED').length,
  }), [filteredUnused, filteredUsed, customerBreakdown, filteredArchived]);

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return d; }
  };

  const formatAmount = (amount: number, curr: string = 'USD') => {
    return `${getCurrSymbol(curr)}${Math.round(amount).toLocaleString()}`;
  };

  // ============= PDF EXPORT =============
  const exportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const isGov = statementFormat === 'government';
    const pageWidth = 210;
    let yPos = 15;

    const addWatermark = (pageDoc: jsPDF) => {
      if (!isGov) return;
      pageDoc.setFontSize(50);
      pageDoc.setTextColor(200, 200, 200);
      pageDoc.text('OFFICIAL DOCUMENT', pageWidth / 2, 150, { align: 'center', angle: 45 });
      pageDoc.setTextColor(0, 0, 0);
    };

    // Header
    if (isGov && logo) {
      try { doc.addImage(logo, 'PNG', 14, yPos, 25, 25); } catch {}
      yPos += 2;
    }

    const headerX = isGov && logo ? 45 : 14;

    if (isGov) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (contactInfo.address) { doc.text(contactInfo.address, headerX, yPos + 5); }
      if (contactInfo.phone) { doc.text(`Tel: ${contactInfo.phone}`, headerX, yPos + 10); }
      if (contactInfo.email) { doc.text(contactInfo.email, headerX, yPos + 15); }

      // Reference number
      const refNo = `STMT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      doc.setFontSize(9);
      doc.text(`Ref: ${refNo}`, pageWidth - 14, yPos + 5, { align: 'right' });
      yPos += 25;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Account Statement — ${decodedOwner}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(dateFrom)} to ${formatDate(dateTo)}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // === INSIGHTS ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Insights', 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const insights = [
      `Recorded B/Ls: ${stats.totalBL}`,
      `Used B/Ls: ${stats.usedInDashboard}`,
      `Remaining Unused: ${stats.remainingUnused}`,
      `Customers Served: ${stats.totalCustomers}`,
    ];
    if (includeArchived) insights.push(`Archived: ${stats.totalArchived}`);

    insights.forEach(line => {
      doc.text(`• ${line}`, 18, yPos);
      yPos += 5;
    });

    // Currency totals
    yPos += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Totals by Currency:', 18, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    Object.entries(totalsByCurrency).forEach(([curr, total]) => {
      doc.text(`  ${curr}: ${getCurrSymbol(curr)}${Math.round(total).toLocaleString()}`, 22, yPos);
      yPos += 5;
    });

    // Customer breakdown
    yPos += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(`Used for ${stats.totalCustomers} customer(s):`, 18, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    Object.entries(customerBreakdown).forEach(([customer, count]) => {
      doc.text(`  • ${customer}: ${count} B/L(s)`, 22, yPos);
      yPos += 5;
      if (yPos > 270) { doc.addPage(); addWatermark(doc); yPos = 20; }
    });
    yPos += 5;

    // === SECTION 1: Recorded B/Ls ===
    if (filteredUnused.length > 0) {
      if (yPos > 240) { doc.addPage(); addWatermark(doc); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Recorded B/Ls (${filteredUnused.length})`, 14, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'B/L No', 'Container', 'Category', 'B/L Date', 'Port', 'Status']],
        body: filteredUnused.map((r, i) => [
          (i + 1).toString(), r.bl_no, r.container_no, r.product_category,
          formatDate(r.bl_date), r.port_of_loading,
          r.status + (r.reverted_at ? ' (Reverted)' : ''),
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // === SECTION 2: Used B/L grouped by Dashboard ===
    Object.entries(usedByDashboard).forEach(([dashId, records]) => {
      const dashName = dashboardMap[dashId] || 'Unknown Dashboard';
      if (yPos > 240) { doc.addPage(); addWatermark(doc); yPos = 20; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Used B/L — ${dashName} (${records.length})`, 14, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['B/L No', 'Container', 'Used For', 'Beneficiary', 'Bank', 'Amount', 'Currency', 'Invoice Date']],
        body: records.map(r => [
          r.bl_no, r.container_no, r.used_for, r.used_for_beneficiary || '—',
          r.bank, formatAmount(r.invoice_amount, r.currency), r.currency || 'USD',
          formatDate(r.invoice_date),
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 4;

      // Subtotal per currency per dashboard
      const dashTotals: Record<string, number> = {};
      records.forEach(r => {
        const c = r.currency || 'USD';
        dashTotals[c] = (dashTotals[c] || 0) + (r.invoice_amount || 0);
      });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const subtotalStr = Object.entries(dashTotals).map(([c, t]) => `${getCurrSymbol(c)}${Math.round(t).toLocaleString()} ${c}`).join(' | ');
      doc.text(`Subtotal (${dashName}): ${subtotalStr}`, 14, yPos);
      yPos += 8;
    });

    // === Archived section ===
    if (includeArchived && filteredArchived.length > 0) {
      if (yPos > 240) { doc.addPage(); addWatermark(doc); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(128, 128, 128);
      doc.text(`Archived Records (${filteredArchived.length})`, 14, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['B/L No', 'Container', 'Used For', 'Bank', 'Amount', 'Currency', 'Date']],
        body: filteredArchived.map(r => [
          r.bl_no, r.container_no, r.used_for, r.bank,
          formatAmount(r.invoice_amount, r.currency), r.currency || 'USD', formatDate(r.invoice_date),
        ]),
        styles: { fontSize: 7, cellPadding: 2, textColor: [128, 128, 128] },
        headStyles: { fillColor: [160, 160, 160], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;
    }

    // Grand total
    if (Object.keys(totalsByCurrency).length > 0) {
      if (yPos > 270) { doc.addPage(); addWatermark(doc); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const grandStr = Object.entries(totalsByCurrency).map(([c, t]) => `${getCurrSymbol(c)}${Math.round(t).toLocaleString()} ${c}`).join(' | ');
      doc.text(`Grand Total: ${grandStr}`, 14, yPos);
      yPos += 10;
    }

    // Government-grade: signature line
    if (isGov) {
      if (yPos > 250) { doc.addPage(); addWatermark(doc); yPos = 20; }
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared by: _________________________', 14, yPos);
      doc.text('Date: _____________', pageWidth - 60, yPos);
      yPos += 15;

      // Stamp placeholder
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(pageWidth - 55, yPos - 5, 40, 25);
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text('Official Seal', pageWidth - 35, yPos + 8, { align: 'center' });
      doc.setLineDashPattern([], 0);
      doc.setTextColor(0, 0, 0);
    }

    // Page numbers and footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addWatermark(doc);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      doc.text(isGov ? (contactInfo.address || 'Nujoom Invoices') : 'Generated by Nujoom Invoices', 14, 290);
      doc.setTextColor(0, 0, 0);
    }

    doc.save(`${decodedOwner}_Statement_${format(new Date(), 'yyyyMMdd')}_${statementFormat}.pdf`);
  }, [decodedOwner, filteredUnused, filteredUsed, filteredArchived, usedByDashboard, dashboardMap, customerBreakdown, stats, totalsByCurrency, statementFormat, logo, contactInfo, dateFrom, dateTo, includeArchived]);

  if (unusedLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
      </div>

      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            {/* Date range */}
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
              </div>
            </div>

            {/* Archived toggle */}
            <div className="flex items-center gap-2">
              <Switch checked={includeArchived} onCheckedChange={setIncludeArchived} />
              <Label className="text-sm">Include Archived</Label>
            </div>

            {/* Format tabs */}
            <Tabs value={statementFormat} onValueChange={v => setStatementFormat(v as any)} className="ml-auto">
              <TabsList>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="government">Government-grade</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Export */}
            <Button onClick={exportPDF} className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10"><FolderOpen className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalBL}</p>
              <p className="text-xs text-muted-foreground">Recorded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-success/10"><CheckCircle className="h-4 w-4 text-success" /></div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.usedInDashboard}</p>
              <p className="text-xs text-muted-foreground">Used</p>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.remainingUnused === 0 ? 'border-success/50' : stats.remainingUnused < 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10"><Package className="h-4 w-4 text-primary" /></div>
            <div>
              <p className={`text-xl font-bold ${stats.remainingUnused < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {stats.remainingUnused < 0 && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                {stats.remainingUnused}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-secondary/10"><Users className="h-4 w-4 text-secondary-foreground" /></div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.totalCustomers}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
          </CardContent>
        </Card>
        {includeArchived && (
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted"><Archive className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{stats.totalArchived}</p>
                <p className="text-xs text-muted-foreground">Archived</p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Currency totals */}
        {Object.entries(totalsByCurrency).map(([curr, total]) => (
          <Card key={curr}>
            <CardContent className="p-3 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-accent/10"><FileText className="h-4 w-4 text-accent-foreground" /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{getCurrSymbol(curr)}{Math.round(total).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total {curr}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Breakdown */}
      {Object.keys(customerBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Customer Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(customerBreakdown).map(([customer, count]) => (
                <div key={customer} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground truncate">{customer}</span>
                  <Badge variant="secondary" className="ml-2 shrink-0">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 1: Recorded B/Ls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" /> Recorded B/Ls ({filteredUnused.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>B/L No</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">B/L Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Port</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnused.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No B/L records in this period</TableCell>
                  </TableRow>
                ) : filteredUnused.map((r, i) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{r.bl_no}</TableCell>
                    <TableCell className="font-mono">{r.container_no}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="text-xs">{r.product_category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(r.bl_date)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.port_of_loading}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant={r.status === 'UNUSED' ? 'default' : 'secondary'}
                          className={`text-xs ${r.status === 'USED' ? 'bg-success/20 text-success border-success/30' : ''}`}>
                          {r.status}
                        </Badge>
                        {r.reverted_at && (
                          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">Rev</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Used B/L by Dashboard */}
      {Object.entries(usedByDashboard).map(([dashId, records]) => {
        const dashTotals: Record<string, number> = {};
        records.forEach(r => {
          const c = r.currency || 'USD';
          dashTotals[c] = (dashTotals[c] || 0) + (r.invoice_amount || 0);
        });

        // Group by bl_no for multi-invoice display
        const blGroups = new Map<string, UsedBL[]>();
        records.forEach(r => {
          const key = r.bl_no;
          const existing = blGroups.get(key) || [];
          existing.push(r);
          blGroups.set(key, existing);
        });

        return (
          <Card key={dashId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <button
                  className="text-primary hover:underline"
                  onClick={() => navigate(`/used-bl?dashboard=${dashId}`)}
                >
                  {dashboardMap[dashId] || 'Unknown Dashboard'}
                </button>
                <Badge variant="secondary" className="ml-1">{records.length}</Badge>
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
                      <TableHead className="hidden md:table-cell">Beneficiary</TableHead>
                      <TableHead className="hidden md:table-cell">Bank</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(blGroups.entries()).map(([blNo, group]) => (
                      group.map((r, idx) => (
                        <TableRow key={r.id} className={group.length > 1 ? 'border-l-2 border-l-primary' : ''}>
                          <TableCell className="font-mono font-medium">
                            <div className="flex items-center gap-1">
                              {r.bl_no}
                              {group.length > 1 && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/40 text-primary">
                                  {idx + 1}/{group.length}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{r.container_no}</TableCell>
                          <TableCell>{r.used_for}</TableCell>
                          <TableCell className="hidden md:table-cell">{r.used_for_beneficiary || '—'}</TableCell>
                          <TableCell className="hidden md:table-cell">{r.bank}</TableCell>
                          <TableCell className="font-mono font-bold">{formatAmount(r.invoice_amount, r.currency)}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(r.invoice_date)}</TableCell>
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator />
              <div className="p-3 flex justify-end">
                <div className="text-right space-y-0.5">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  {Object.entries(dashTotals).map(([c, t]) => (
                    <p key={c} className="text-lg font-bold text-foreground">{getCurrSymbol(c)}{Math.round(t).toLocaleString()} <span className="text-xs text-muted-foreground">{c}</span></p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Archived Records (if toggled) */}
      {includeArchived && filteredArchived.length > 0 && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <Archive className="h-4 w-4" /> Archived Records ({filteredArchived.length})
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
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArchived.map(r => (
                    <TableRow key={r.id} className="opacity-60">
                      <TableCell className="font-mono line-through">{r.bl_no}</TableCell>
                      <TableCell className="font-mono">{r.container_no}</TableCell>
                      <TableCell>{r.used_for}</TableCell>
                      <TableCell className="hidden md:table-cell">{r.bank}</TableCell>
                      <TableCell className="font-mono">{formatAmount(r.invoice_amount, r.currency)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(r.invoice_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grand Total */}
      {Object.keys(totalsByCurrency).length > 0 && (
        <Card className="border-primary/30">
          <CardContent className="p-4 flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Grand Total (Active)</p>
              {Object.entries(totalsByCurrency).map(([c, t]) => (
                <p key={c} className="text-2xl font-bold text-primary">
                  {getCurrSymbol(c)}{Math.round(t).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{c}</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnusedBLOwnerDetail;
