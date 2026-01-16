import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, Sector } from 'recharts';
import { TrendingUp, DollarSign, FileText, Building, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { gsap } from 'gsap';
import CountUp from '@/components/CountUp';

const getCurrencySymbol = (currencyCode: string) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    IQD: 'د.ع',
    TRY: '₺',
    SAR: '﷼',
    AED: 'د.إ',
    RMB: '¥',
  };
  return symbols[currencyCode] || currencyCode;
};

const formatAmountWithCurrency = (amount: number, currencyCode?: string) => {
  const symbol = currencyCode ? getCurrencySymbol(currencyCode) : '$';
  return `${symbol}${Math.round(amount).toLocaleString()}`;
};

// Custom animated active shape for pie chart
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-foreground text-lg font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" className="fill-muted-foreground text-sm">
        {formatAmountWithCurrency(value, payload.currency)}
      </text>
      <text x={cx} y={cy + 35} textAnchor="middle" className="fill-muted-foreground text-xs">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

const BANK_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(199, 89%, 48%)',
];

const Insights: React.FC = () => {
  const { t } = useLanguage();
  const { invoices, banks } = useInvoice();
  const { currency } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const bankChartRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Bank distribution with currency info
  const bankData = banks.map(bank => {
    const bankInvoices = invoices.filter(inv => inv.bank === bank.name);
    // Get the most common currency for this bank
    const currencyCounts: Record<string, number> = {};
    bankInvoices.forEach(inv => {
      currencyCounts[inv.currency] = (currencyCounts[inv.currency] || 0) + 1;
    });
    const mostCommonCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
    
    return {
      name: bank.name,
      count: bankInvoices.length,
      amount: bankInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      currency: mostCommonCurrency,
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

  // Animation on mount
  useEffect(() => {
    if (statsRef.current) {
      const cards = statsRef.current.querySelectorAll('.stat-card');
      gsap.fromTo(cards, 
        { y: 30, opacity: 0, scale: 0.95 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.6, 
          stagger: 0.1,
          ease: 'back.out(1.7)'
        }
      );
    }
    
    if (bankChartRef.current) {
      gsap.fromTo(bankChartRef.current,
        { opacity: 0, scale: 0.9, rotateY: -15 },
        { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          duration: 0.8, 
          delay: 0.4,
          ease: 'power3.out'
        }
      );
    }
  }, []);

  // Auto-rotate active pie slice
  useEffect(() => {
    if (bankData.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % bankData.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [bankData.length]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 hover:scale-105 transition-transform duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalAmount')}</p>
                <p className="text-2xl font-bold text-primary">
                  {currency.symbol}<CountUp to={Math.round(totalAmount)} duration={2} separator="," />
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-success/10 to-success/5 hover:scale-105 transition-transform duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalInvoices')}</p>
                <p className="text-2xl font-bold text-success">
                  <CountUp to={totalInvoices} duration={2} separator="," />
                </p>
              </div>
              <FileText className="h-10 w-10 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-warning/10 to-warning/5 hover:scale-105 transition-transform duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('pending')}</p>
                <p className="text-2xl font-bold text-warning">
                  <CountUp to={pendingInvoices} duration={2} separator="," />
                </p>
              </div>
              <Clock className="h-10 w-10 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-success/10 to-success/5 hover:scale-105 transition-transform duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('received')}</p>
                <p className="text-2xl font-bold text-success">
                  <CountUp to={receivedInvoices} duration={2} separator="," />
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-success/50" />
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

      {/* Bank Distribution - Animated Pie Chart */}
      <Card ref={bankChartRef} className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary animate-pulse" />
            {t('bankDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer config={chartConfig} className="h-[350px]">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={bankData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="amount"
                  onMouseEnter={onPieEnter}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {bankData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BANK_COLORS[index % BANK_COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            
            {/* Legend with animations */}
            <div className="flex flex-col justify-center space-y-3">
              {bankData.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer
                    ${activeIndex === index 
                      ? 'bg-accent scale-105 shadow-lg' 
                      : 'hover:bg-muted/50'
                    }`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div 
                    className="w-4 h-4 rounded-full shrink-0 shadow-md"
                    style={{ 
                      backgroundColor: BANK_COLORS[index % BANK_COLORS.length],
                      boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${BANK_COLORS[index % BANK_COLORS.length]}`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.count} {t('invoiceCount').toLowerCase()} • {formatAmountWithCurrency(entry.amount, entry.currency)}
                    </p>
                  </div>
                </div>
              ))}
              {bankData.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bank data available</p>
                </div>
              )}
            </div>
          </div>
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
