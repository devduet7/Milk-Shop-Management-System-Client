// <== IMPORTS ==>
import {
  Milk,
  Users,
  Target,
  Package,
  BarChart3,
  TrendingUp,
  DollarSign,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  Area,
  Radar,
  YAxis,
  XAxis,
  Tooltip,
  BarChart,
  PolarGrid,
  AreaChart,
  RadarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { memo, type CSSProperties } from "react";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/layout/PageTransition";

// <== MONTHLY DATA TYPE ==>
type MonthlyDatum = {
  // <== MONTH ==>
  month: string;
  // <== MILK ==>
  milk: number;
  // <== YOGHURT ==>
  yoghurt: number;
  // <== REVENUE ==>
  revenue: number;
  // <== COST ==>
  cost: number;
};
// <== MONTHLY DATA ==>
const MONTHLY_DATA: MonthlyDatum[] = [
  { month: "Jan", milk: 400, yoghurt: 200, revenue: 72000, cost: 48000 },
  { month: "Feb", milk: 350, yoghurt: 180, revenue: 63000, cost: 42000 },
  { month: "Mar", milk: 500, yoghurt: 250, revenue: 90000, cost: 58000 },
  { month: "Apr", milk: 450, yoghurt: 220, revenue: 80500, cost: 52000 },
  { month: "May", milk: 600, yoghurt: 300, revenue: 108000, cost: 68000 },
  { month: "Jun", milk: 550, yoghurt: 280, revenue: 99000, cost: 62000 },
];
// <== DAILY SALES DATA TYPE ==>
type DailySalesDatum = {
  // <== DAY ==>
  day: string;
  // <== SALES ==>
  sales: number;
};
// <== DAILY SALES DATA ==>
const DAILY_SALES_DATA: DailySalesDatum[] = [
  { day: "Mon", sales: 14200 },
  { day: "Tue", sales: 11800 },
  { day: "Wed", sales: 16500 },
  { day: "Thu", sales: 13900 },
  { day: "Fri", sales: 18200 },
  { day: "Sat", sales: 21500 },
  { day: "Sun", sales: 16800 },
];
// <== PERFORMANCE DATA TYPE ==>
type PerformanceDatum = {
  // <== METRIC ==>
  metric: string;
  // <== VALUE ==>
  value: number;
};
// <== PERFORMANCE DATA ==>
const PERFORMANCE_DATA: PerformanceDatum[] = [
  { metric: "Sales", value: 88 },
  { metric: "Recovery", value: 72 },
  { metric: "Purchases", value: 65 },
  { metric: "Growth", value: 80 },
  { metric: "Retention", value: 91 },
  { metric: "Profit", value: 76 },
];
// <== PROFIT DATA TYPE ==>
type ProfitDatum = {
  // <== MONTH ==>
  month: string;
  // <== PROFIT ==>
  profit: number;
};
// <== PROFIT DATA ==>
const PROFIT_DATA: ProfitDatum[] = [
  { month: "Jan", profit: 24000 },
  { month: "Feb", profit: 21000 },
  { month: "Mar", profit: 32000 },
  { month: "Apr", profit: 28500 },
  { month: "May", profit: 40000 },
  { month: "Jun", profit: 37000 },
];
// <== TOOLTIP STYLE ==>
const TOOLTIP_STYLE: CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
  boxShadow: "0 8px 30px -10px rgba(0,0,0,0.15)",
};
// <== FORMAT CURRENCY FUNCTION ==>
const formatCurrency = (value: number | string): string => {
  // CONVERT TO NUMBER IF POSSIBLE
  const numericValue = typeof value === "number" ? value : Number(value);
  // HANDLE NAN VALUE
  if (Number.isNaN(numericValue)) {
    // HANDLE STRING VALUE
    return `₨${value}`;
  }
  // RETURN FORMATTED VALUE
  return `₨${numericValue.toLocaleString()}`;
};
// <== STAT TYPE ==>
type Stat = {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== CHANGE ==>
  change: string;
  // <== TREND ==>
  trend: "up" | "down";
  // <== ICON ==>
  icon: LucideIcon;
};
// <== KPI TYPE ==>
type Kpi = {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== TARGET ==>
  target: string;
  // <== PERCENTAGE ==>
  pct: number;
};
// <== STATS ==>
const STATS: Stat[] = [
  // TOTAL REVENUE
  {
    label: "Total Revenue",
    value: "₨5,12,500",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  // MILK SOLD
  {
    label: "Milk Sold",
    value: "2,850L",
    change: "+8.2%",
    trend: "up",
    icon: Milk,
  },
  // YOGHURT SOLD
  {
    label: "Yoghurt Sold",
    value: "1,430kg",
    change: "+15.3%",
    trend: "up",
    icon: Package,
  },
  // ACTIVE CUSTOMERS
  {
    label: "Active Customers",
    value: "48",
    change: "+3",
    trend: "up",
    icon: Users,
  },
];
// <== KPI TARGETS ==>
const KPIS: Kpi[] = [
  { label: "Avg. Order Value", value: "₨1,850", target: "₨2,000", pct: 92 },
  { label: "Recovery Rate", value: "72%", target: "85%", pct: 72 },
  { label: "Customer Retention", value: "91%", target: "95%", pct: 91 },
  { label: "Profit Margin", value: "34%", target: "40%", pct: 85 },
];

// <== ANALYTICS PAGE COMPONENT ==>
const Analytics = memo(() => {
  // RETURNING ANALYTICS PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Deep dive into your business metrics
            </p>
          </div>
        </div>
        {/* DATE RANGE BADGE */}
        <Badge
          variant="secondary"
          className="text-xs bg-muted text-muted-foreground w-fit"
        >
          Last 6 Months
        </Badge>
      </div>
      {/* STATS CONTAINER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {STATS.map((stat, i) => {
          // ICON
          const Icon = stat.icon;
          // RETURNING STAT CARD
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-3">
                {/* ICON */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                {/* TREND */}
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              {/* LABEL */}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {/* VALUE */}
              <p className="text-2xl font-bold font-display mt-0.5">
                {stat.value}
              </p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          );
        })}
      </div>
      {/* REVENUE & DAILY SALES CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* REVENUE VS COSTS AREA CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2"
        >
          {/* CHART HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold">Revenue vs Costs</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly comparison
              </p>
            </div>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                {/* REVENUE GRADIENT */}
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* COST GRADIENT */}
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--secondary))"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--secondary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number | string) => {
                  // CHECK IF VALUE IS A NUMBER
                  const numericValue = typeof v === "number" ? v : Number(v);
                  // IF VALUE IS NOT A NUMBER, RETURN AS IS
                  return Number.isNaN(numericValue)
                    ? String(v)
                    : `₨${(numericValue / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number | string) => [
                  formatCurrency(value),
                  undefined,
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#costGrad)"
                name="Costs"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        {/* DAILY SALES BAR CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          {/* CHART HEADER */}
          <div className="mb-5">
            <h3 className="font-display font-semibold">Daily Sales</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              This week breakdown
            </p>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={DAILY_SALES_DATA} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number | string) => {
                  // CHECK IF VALUE IS A NUMBER
                  const numericValue = typeof v === "number" ? v : Number(v);
                  // IF VALUE IS NOT A NUMBER, RETURN AS IS
                  return Number.isNaN(numericValue)
                    ? String(v)
                    : `₨${(numericValue / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number | string) => [
                  formatCurrency(value),
                  undefined,
                ]}
              />
              <Bar
                dataKey="sales"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                name="Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      {/* VOLUME, PROFIT TREND & PERFORMANCE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* MONTHLY VOLUME BAR CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          {/* CHART HEADER */}
          <div className="mb-5">
            <h3 className="font-display font-semibold">Monthly Volume</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Milk & Yoghurt sales
            </p>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_DATA} barGap={3}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="milk"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Milk (L)"
              />
              <Bar
                dataKey="yoghurt"
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
                name="Yoghurt (kg)"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        {/* PROFIT TREND AREA CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5"
        >
          {/* CHART HEADER */}
          <div className="mb-5">
            <h3 className="font-display font-semibold">Profit Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Net profit over time
            </p>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={PROFIT_DATA}>
              <defs>
                {/* PROFIT GRADIENT */}
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number | string) => {
                  // CHECK IF VALUE IS A NUMBER
                  const numericValue = typeof v === "number" ? v : Number(v);
                  // IF VALUE IS NOT A NUMBER, RETURN AS IS
                  return Number.isNaN(numericValue)
                    ? String(v)
                    : `₨${(numericValue / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number | string) => [
                  formatCurrency(value),
                  undefined,
                ]}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                fill="url(#profitGrad)"
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        {/* PERFORMANCE RADAR CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          {/* CHART HEADER */}
          <div className="mb-5">
            <h3 className="font-display font-semibold">Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Business health overview
            </p>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={PERFORMANCE_DATA} outerRadius={80}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis
                tick={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      {/* KPI TARGETS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-5"
      >
        {/* SECTION HEADER */}
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-display font-semibold">
              Key Performance Indicators
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Progress towards business targets
            </p>
          </div>
        </div>
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              className="bg-muted/40 rounded-xl p-4"
            >
              {/* KPI LABEL */}
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              {/* KPI VALUE & TARGET */}
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-xl font-bold">
                  {kpi.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Target: {kpi.target}
                </span>
              </div>
              {/* KPI PROGRESS BAR */}
              <Progress value={kpi.pct} className="h-2" />
              {/* KPI PERCENTAGE */}
              <p
                className={cn(
                  "text-[10px] font-semibold mt-1.5",
                  kpi.pct >= 85
                    ? "text-emerald-600 dark:text-emerald-400"
                    : kpi.pct >= 70
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-500",
                )}
              >
                {kpi.pct}% achieved
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Analytics.displayName = "Analytics";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Analytics;
