import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, FileText, Building, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const Insights: React.FC = () => {
  const { t } = useLanguage();
  const { invoices, banks } = useInvoice();

  // Calculate statistics
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalInvoices = invoices.length;
  const receivedInvoices = invoices.filter(inv => inv.status === 'received').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

  // Monthly data (last 6 months)
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthInvoices = invoices.filter(inv => {
      const invDate = parseISO(inv.date);
      return invDate >= monthStart && invDate <= monthEnd;
    });
    return {
      month: format(month, 'MMM'),
      count: monthInvoices.length,
      amount: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    };
  });

  // Bank distribution
  const bankData = banks.map(bank => {
    const bankInvoices = invoices.filter(inv => inv.bank === bank.name);
    return {
      name: bank.name,
      count: bankInvoices.length,
      amount: bankInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    };
  }).filter(b => b.count > 0);

  // Status distribution
  const statusData = [
    { name: t('received'), value: receivedInvoices, color: 'hsl(var(--success))' },
    { name: t('pending'), value: pendingInvoices, color: 'hsl(var(--warning))' },
  ];

  const chartConfig = {
    count: { label: t('invoiceCount'), color: 'hsl(var(--primary))' },
    amount: { label: t('invoiceAmount'), color: 'hsl(var(--success))' },
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalAmount')}</p>
                <p className="text-2xl font-bold text-primary">${totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalInvoices')}</p>
                <p className="text-2xl font-bold text-success">{totalInvoices}</p>
              </div>
              <FileText className="h-10 w-10 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('pending')}</p>
                <p className="text-2xl font-bold text-warning">{pendingInvoices}</p>
              </div>
              <Clock className="h-10 w-10 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('received')}</p>
                <p className="text-2xl font-bold text-green-500">{receivedInvoices}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              {t('statusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bank Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {t('bankDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={bankData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Invoice Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('invoicesByMonth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
