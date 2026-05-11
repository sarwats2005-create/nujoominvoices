import React, { useMemo, useState } from 'react';
import { useSalesHistory, usePOSSettings } from '@/hooks/useRetail';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, TrendingUp, Package, Award, FileText } from 'lucide-react';
import { format, startOfDay, endOfDay, isWithinInterval, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ensureUnicodeFontSync } from '@/lib/pdfFont';

const POSReports: React.FC = () => {
  const { sales, loading } = useSalesHistory(500);
  const { products } = useProducts();
  const { settings } = usePOSSettings();
  const currency = settings?.currency || 'USD';
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';

  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('today');

  const rangedSales = useMemo(() => {
    if (range === 'all') return sales;
    const now = new Date();
    const start = range === 'today' ? startOfDay(now) : range === '7d' ? subDays(now, 7) : subDays(now, 30);
    return sales.filter(s => isWithinInterval(new Date(s.created_at), { start, end: endOfDay(now) }));
  }, [sales, range]);

  const totals = useMemo(() => {
    const grossSales = rangedSales.reduce((s, x) => s + Number(x.total), 0);
    const refunded = rangedSales.reduce((s, x) => s + Number(x.refunded_amount || 0), 0);
    const netSales = grossSales - refunded;
    const txCount = rangedSales.length;
    const avgTicket = txCount ? netSales / txCount : 0;
    const totalTax = rangedSales.reduce((s, x) => s + Number(x.tax_amount || 0), 0);
    const totalDiscount = rangedSales.reduce((s, x) => s + Number(x.discount_amount || 0), 0);

    // Profit estimate from items (price - cost)
    let cogs = 0;
    rangedSales.forEach(s => {
      s.items?.forEach((i: any) => {
        const product = products.find(p => p.id === i.product_id);
        cogs += (product?.cost_price || 0) * Number(i.quantity);
      });
    });
    return { grossSales, refunded, netSales, txCount, avgTicket, totalTax, totalDiscount, cogs, profit: netSales - cogs };
  }, [rangedSales, products]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    rangedSales.forEach(s => {
      s.items?.forEach((i: any) => {
        const key = i.product_id || i.product_name;
        const cur = map.get(key) || { name: i.product_name, qty: 0, revenue: 0 };
        cur.qty += Number(i.quantity);
        cur.revenue += Number(i.total);
        map.set(key, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [rangedSales]);

  const stockValuation = useMemo(() => {
    let totalQty = 0, totalCost = 0, totalRetail = 0;
    products.forEach(p => {
      p.variants?.forEach(v => {
        totalQty += v.stock_quantity;
        totalCost += v.stock_quantity * (p.cost_price || 0);
        totalRetail += v.stock_quantity * p.price;
      });
    });
    return { totalQty, totalCost, totalRetail, potentialProfit: totalRetail - totalCost };
  }, [products]);

  const exportCSV = () => {
    const rows = [
      ['Sale #', 'Date', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Status'],
      ...rangedSales.map(s => [
        s.sale_number, format(new Date(s.created_at), 'yyyy-MM-dd HH:mm'),
        s.customer?.name || 'Walk-in', String(s.items?.length || 0),
        Number(s.subtotal).toFixed(2), Number(s.discount_amount).toFixed(2),
        Number(s.tax_amount).toFixed(2), Number(s.total).toFixed(2), s.status || 'completed',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sales-${range}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportZReport = () => {
    const doc = new jsPDF();
    const fontName = ensureUnicodeFontSync(doc);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(16);
    doc.text(`Z-Report — ${range.toUpperCase()}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 26);
    autoTable(doc, {
      startY: 34,
      head: [['Metric', 'Value']],
      body: [
        ['Gross Sales', `${sym}${totals.grossSales.toFixed(2)}`],
        ['Refunded', `${sym}${totals.refunded.toFixed(2)}`],
        ['Net Sales', `${sym}${totals.netSales.toFixed(2)}`],
        ['Transactions', String(totals.txCount)],
        ['Avg Ticket', `${sym}${totals.avgTicket.toFixed(2)}`],
        ['Total Tax', `${sym}${totals.totalTax.toFixed(2)}`],
        ['Total Discount', `${sym}${totals.totalDiscount.toFixed(2)}`],
        ['COGS (est.)', `${sym}${totals.cogs.toFixed(2)}`],
        ['Profit (est.)', `${sym}${totals.profit.toFixed(2)}`],
      ],
    });
    autoTable(doc, {
      head: [['Top Product', 'Qty', 'Revenue']],
      body: topProducts.map(p => [p.name, String(p.qty), `${sym}${p.revenue.toFixed(2)}`]),
    });
    doc.save(`z-report-${range}-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">POS Reports</h1>
            <p className="text-sm text-muted-foreground">Sales, profit, top products & stock valuation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" />CSV</Button>
          <Button onClick={exportZReport} className="gap-2"><FileText className="h-4 w-4" />Z-Report</Button>
        </div>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="7d">7 days</TabsTrigger>
          <TabsTrigger value="30d">30 days</TabsTrigger>
          <TabsTrigger value="all">All time</TabsTrigger>
        </TabsList>

        <TabsContent value={range} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Net Sales</p><p className="text-2xl font-bold text-primary">{sym}{totals.netSales.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transactions</p><p className="text-2xl font-bold">{totals.txCount}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg Ticket</p><p className="text-2xl font-bold">{sym}{totals.avgTicket.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Profit (est.)</p><p className="text-2xl font-bold text-success">{sym}{totals.profit.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Refunded</p><p className="text-xl font-semibold text-destructive">{sym}{totals.refunded.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tax Collected</p><p className="text-xl font-semibold">{sym}{totals.totalTax.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Discounts</p><p className="text-xl font-semibold">{sym}{totals.totalDiscount.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">COGS (est.)</p><p className="text-xl font-semibold">{sym}{totals.cogs.toFixed(2)}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="h-4 w-4" />Top Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {topProducts.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No data</TableCell></TableRow>
                    : topProducts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{p.name}</TableCell>
                        <TableCell className="text-right">{p.qty}</TableCell>
                        <TableCell className="text-right font-semibold">{sym}{p.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" />Stock Valuation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Units</span><span className="font-semibold">{stockValuation.totalQty}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">At Cost</span><span className="font-semibold">{sym}{stockValuation.totalCost.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">At Retail</span><span className="font-semibold">{sym}{stockValuation.totalRetail.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-3"><span className="text-muted-foreground">Potential Profit</span><span className="font-bold text-success">{sym}{stockValuation.potentialProfit.toFixed(2)}</span></div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" />Recent Sales ({rangedSales.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Sale #</TableHead><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Items</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                  : rangedSales.slice(0, 50).map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.sale_number}</TableCell>
                      <TableCell className="text-xs">{format(new Date(s.created_at), 'dd/MM HH:mm')}</TableCell>
                      <TableCell>{s.customer?.name || 'Walk-in'}</TableCell>
                      <TableCell className="text-right">{s.items?.length || 0}</TableCell>
                      <TableCell className="text-right font-semibold">{sym}{Number(s.total).toFixed(2)}</TableCell>
                      <TableCell><span className="text-xs">{s.status || 'completed'}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default POSReports;
