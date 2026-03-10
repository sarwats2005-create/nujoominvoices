import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { Package, CheckCircle, Users, TrendingUp, BarChart3, PieChart as PieIcon, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountUp from '@/components/CountUp';
import type { UnusedBL } from '@/types/unusedBL';
import type { UsedBL } from '@/types/usedBL';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = [
  'hsl(205, 100%, 45%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(270, 76%, 55%)',
  'hsl(180, 70%, 40%)',
  'hsl(320, 70%, 50%)',
  'hsl(60, 80%, 45%)',
];

interface BLAnalyticsProps {
  records: UnusedBL[];
}

const BLAnalytics: React.FC<BLAnalyticsProps> = ({ records }) => {
  const { user } = useAuth();
  const [usedRecords, setUsedRecords] = useState<UsedBL[]>([]);

  useEffect(() => {
    const fetchUsed = async () => {
      if (!user) return;
      const { data } = await (supabase as any).from('used_bl_counting')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('is_archived', false);
      if (data) setUsedRecords(data as UsedBL[]);
    };
    fetchUsed();
  }, [user]);

  // --- Owner breakdown ---
  const ownerData = useMemo(() => {
    const map = new Map<string, { total: number; unused: number; used: number }>();
    records.forEach(r => {
      const e = map.get(r.owner) || { total: 0, unused: 0, used: 0 };
      e.total++;
      r.status === 'UNUSED' ? e.unused++ : e.used++;
      map.set(r.owner, e);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  const ownerPieData = useMemo(() =>
    ownerData.map(o => ({ name: o.name, value: o.total })),
    [ownerData]
  );

  // --- Usage by customer (used_for / used_for_beneficiary) ---
  const customerData = useMemo(() => {
    const map = new Map<string, { count: number; totalAmount: number; bls: string[] }>();
    usedRecords.forEach(r => {
      const customer = r.used_for || 'Unknown';
      const e = map.get(customer) || { count: 0, totalAmount: 0, bls: [] };
      e.count++;
      e.totalAmount += Number(r.invoice_amount) || 0;
      e.bls.push(r.bl_no);
      map.set(customer, e);
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count);
  }, [usedRecords]);

  const customerPieData = useMemo(() =>
    customerData.map(c => ({ name: c.name, value: c.count })),
    [customerData]
  );

  // --- Monthly trend ---
  const monthlyData = useMemo(() => {
    const map = new Map<string, { recorded: number; used: number }>();
    records.forEach(r => {
      const month = format(parseISO(r.created_at), 'MMM yyyy');
      const e = map.get(month) || { recorded: 0, used: 0 };
      e.recorded++;
      if (r.status === 'USED') e.used++;
      map.set(month, e);
    });
    return Array.from(map.entries()).map(([month, d]) => ({ month, ...d }));
  }, [records]);

  // --- Bank distribution from used records ---
  const bankData = useMemo(() => {
    const map = new Map<string, number>();
    usedRecords.forEach(r => {
      map.set(r.bank, (map.get(r.bank) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [usedRecords]);

  const totalRecorded = records.length;
  const totalUnused = records.filter(r => r.status === 'UNUSED').length;
  const totalUsed = records.filter(r => r.status === 'USED').length;
  const usageRate = totalRecorded > 0 ? Math.round((totalUsed / totalRecorded) * 100) : 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = format(new Date(), 'dd/MM/yyyy HH:mm');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 120);
    doc.text('B/L Overall Account Report', 14, 20);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${now}`, 14, 27);

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 14, 38);
    autoTable(doc, {
      startY: 42,
      head: [['Total Recorded', 'Unused', 'Used', 'Usage Rate']],
      body: [[totalRecorded, totalUnused, totalUsed, `${usageRate}%`]],
      theme: 'grid',
      headStyles: { fillColor: [30, 136, 229] },
      styles: { halign: 'center', fontSize: 10 },
    });

    let y = (doc as any).lastAutoTable.finalY + 12;

    // Owner Breakdown
    doc.setFontSize(12);
    doc.text('Owner Breakdown', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Owner', 'Total', 'Unused', 'Used', '% of Total']],
      body: ownerData.map(o => [
        o.name,
        o.total,
        o.unused,
        o.used,
        `${totalRecorded > 0 ? Math.round((o.total / totalRecorded) * 100) : 0}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 136, 229] },
      styles: { fontSize: 9 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Customer Usage
    if (customerData.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text('Usage by Customer', 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [['Customer', 'B/L Count', 'Total Amount ($)', 'B/L Numbers']],
        body: customerData.map(c => [
          c.name,
          c.count,
          c.totalAmount.toLocaleString(),
          c.bls.join(', '),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] },
        styles: { fontSize: 9 },
        columnStyles: { 3: { cellWidth: 60 } },
      });
      y = (doc as any).lastAutoTable.finalY + 12;
    }

    // Bank Distribution
    if (bankData.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text('Bank Distribution', 14, y);
      autoTable(doc, {
        startY: y + 4,
        head: [['Bank', 'Count', '% of Used']],
        body: bankData.map(b => [
          b.name,
          b.value,
          `${usedRecords.length > 0 ? Math.round((b.value / usedRecords.length) * 100) : 0}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 124, 0] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`BL_Account_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-1">{label || payload[0]?.name}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color || p.fill }} />
            {p.name || p.dataKey}: <span className="font-medium text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  if (records.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Overall Account</h2>
            <p className="text-xs text-muted-foreground">Complete B/L analytics & breakdown</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">
              <CountUp to={totalRecorded} duration={1.5} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Recorded</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-warning mx-auto mb-2" />
            <p className="text-3xl font-bold text-warning">
              <CountUp to={totalUnused} duration={1.5} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Unused</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-3xl font-bold text-success">
              <CountUp to={totalUsed} duration={1.5} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Used</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold text-accent">
              <CountUp to={usageRate} duration={1.5} />%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Usage Rate</p>
            <Progress value={usageRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="owners" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="owners" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> By Owner</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5 text-xs"><ArrowRight className="h-3.5 w-3.5" /> By Customer</TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Trends</TabsTrigger>
          <TabsTrigger value="banks" className="gap-1.5 text-xs"><PieIcon className="h-3.5 w-3.5" /> Banks</TabsTrigger>
        </TabsList>

        {/* === OWNERS TAB === */}
        <TabsContent value="owners" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">B/L Distribution by Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ownerPieData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {ownerPieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                        iconSize={8}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Owner Detail List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Owner Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
                {ownerData.map((owner, i) => {
                  const pct = totalRecorded > 0 ? Math.round((owner.total / totalRecorded) * 100) : 0;
                  return (
                    <div key={owner.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium text-foreground truncate max-w-[140px]">{owner.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5">{owner.total}</Badge>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                        {owner.unused > 0 && (
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(owner.unused / owner.total) * 100}%`,
                              backgroundColor: 'hsl(38, 92%, 50%)',
                            }}
                          />
                        )}
                        {owner.used > 0 && (
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(owner.used / owner.total) * 100}%`,
                              backgroundColor: 'hsl(142, 76%, 36%)',
                            }}
                          />
                        )}
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning" /> {owner.unused} unused
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" /> {owner.used} used
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === CUSTOMERS TAB === */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">B/L Usage by Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {customerPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerPieData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {customerPieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No used B/L records yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Customer Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
                {customerData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No usage data yet</p>
                ) : customerData.map((cust, i) => (
                  <div key={cust.name} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-semibold text-foreground">{cust.name}</span>
                      </div>
                      <Badge className="text-[10px]">{cust.count} B/L</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Amount: <span className="font-semibold text-foreground">${cust.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cust.bls.slice(0, 5).map(bl => (
                        <Badge key={bl} variant="outline" className="text-[9px] font-mono">{bl}</Badge>
                      ))}
                      {cust.bls.length > 5 && (
                        <Badge variant="outline" className="text-[9px]">+{cust.bls.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === TRENDS TAB === */}
        <TabsContent value="trends">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Monthly B/L Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        formatter={(value) => <span className="text-xs text-foreground capitalize">{value}</span>}
                        iconSize={8}
                      />
                      <Bar dataKey="recorded" fill="hsl(205, 100%, 45%)" radius={[4, 4, 0, 0]} name="Recorded" />
                      <Bar dataKey="used" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Used" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === BANKS TAB === */}
        <TabsContent value="banks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Bank Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {bankData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bankData}
                          cx="50%" cy="50%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {bankData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No bank data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Bank Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
                {bankData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No bank data yet</p>
                ) : bankData.map((bank, i) => {
                  const totalBank = usedRecords.length;
                  const pct = totalBank > 0 ? Math.round((bank.value / totalBank) * 100) : 0;
                  return (
                    <div key={bank.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-medium text-foreground">{bank.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5">{bank.value}</Badge>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BLAnalytics;
