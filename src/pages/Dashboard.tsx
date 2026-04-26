// <== IMPORTS ==>
import {
  Milk,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  Area,
  YAxis,
  XAxis,
  Tooltip,
  BarChart,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, type CSSProperties } from "react";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/layout/PageTransition";

// <== WEEKLY DATA TYPE ==>
type WeeklyDatum = {
  // <== DAY ==>
  day: string;
  // <== SALES ==>
  sales: number;
  // <== PURCHASES ==>
  purchases: number;
};
// <== WEEKLY DATA ==>
const WEEKLY_DATA: WeeklyDatum[] = [
  { day: "Mon", sales: 4200, purchases: 2800 },
  { day: "Tue", sales: 3800, purchases: 2400 },
  { day: "Wed", sales: 5100, purchases: 3200 },
  { day: "Thu", sales: 4600, purchases: 2900 },
  { day: "Fri", sales: 6200, purchases: 3800 },
  { day: "Sat", sales: 7500, purchases: 4100 },
  { day: "Sun", sales: 5800, purchases: 3500 },
];
// <== PRODUCT DATA TYPE ==>
type ProductDatum = {
  // <== NAME ==>
  name: string;
  // <== MILK ==>
  milk: number;
  // <== YOGHURT ==>
  yoghurt: number;
};
// <== PRODUCT DATA ==>
const PRODUCT_DATA: ProductDatum[] = [
  { name: "Mon", milk: 45, yoghurt: 22 },
  { name: "Tue", milk: 38, yoghurt: 18 },
  { name: "Wed", milk: 52, yoghurt: 28 },
  { name: "Thu", milk: 48, yoghurt: 24 },
  { name: "Fri", milk: 60, yoghurt: 32 },
  { name: "Sat", milk: 72, yoghurt: 38 },
  { name: "Sun", milk: 55, yoghurt: 30 },
];
// <== RECENT ACTIVITY TYPE ==>
type ActivityItem = {
  // <== ID ==>
  id: number;
  // <== CUSTOMER ==>
  customer: string;
  // <== TYPE ==>
  type: string;
  // <== AMOUNT ==>
  amount: number;
  // <== TIME ==>
  time: string;
  // <== STATUS ==>
  status: string;
};
// <== RECENT ACTIVITY DATA ==>
const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    customer: "Ali Khan",
    type: "sale",
    amount: 1250,
    time: "2 min ago",
    status: "paid",
  },
  {
    id: 2,
    customer: "Farm A",
    type: "purchase",
    amount: 5000,
    time: "15 min ago",
    status: "received",
  },
  {
    id: 3,
    customer: "Ahmed",
    type: "sale",
    amount: 680,
    time: "1 hour ago",
    status: "pending",
  },
  {
    id: 4,
    customer: "Fatima",
    type: "sale",
    amount: 2100,
    time: "2 hours ago",
    status: "paid",
  },
  {
    id: 5,
    customer: "Farm B",
    type: "purchase",
    amount: 3200,
    time: "3 hours ago",
    status: "pending",
  },
  {
    id: 6,
    customer: "Bilal",
    type: "recovery",
    amount: 1500,
    time: "4 hours ago",
    status: "cleared",
  },
];
// <== TOP CUSTOMER TYPE ==>
type TopCustomer = {
  // <== NAME ==>
  name: string;
  // <== TOTAL ==>
  total: number;
  // <== ORDERS ==>
  orders: number;
  // <== TREND ==>
  trend: "up" | "down";
};
// <== TOP CUSTOMERS DATA ==>
const TOP_CUSTOMERS: TopCustomer[] = [
  { name: "Ali Khan", total: 28500, orders: 32, trend: "up" },
  { name: "Fatima Bibi", total: 22100, orders: 25, trend: "up" },
  { name: "Ahmed Shah", total: 18400, orders: 21, trend: "down" },
  { name: "Bilal Hassan", total: 15200, orders: 18, trend: "up" },
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
  // <== COLOR ==>
  color: string;
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
    color: "text-primary",
  },
  // MILK SOLD
  {
    label: "Milk Sold",
    value: "2,850L",
    change: "+8.2%",
    trend: "up",
    icon: Milk,
    color: "text-primary",
  },
  // YOGHURT SOLD
  {
    label: "Yoghurt Sold",
    value: "1,430kg",
    change: "+15.3%",
    trend: "up",
    icon: Package,
    color: "text-secondary",
  },
  // ACTIVE CUSTOMERS
  {
    label: "Active Customers",
    value: "48",
    change: "+3",
    trend: "up",
    icon: Users,
    color: "text-primary",
  },
];

// <== DASHBOARD PAGE COMPONENT ==>
const Dashboard = memo(() => {
  // RETURNING DASHBOARD PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your dairy business performance
            </p>
          </div>
        </div>
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
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10",
                    stat.color,
                  )}
                >
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
              {/* DECORATIVE ACCENT */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          );
        })}
      </div>
      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* REVENUE OVERVIEW AREA CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5 lg:col-span-2"
        >
          {/* CHART HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weekly sales vs purchases
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-muted text-muted-foreground"
            >
              This Week
            </Badge>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={WEEKLY_DATA}>
              <defs>
                {/* SALES GRADIENT */}
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* PURCHASES GRADIENT */}
                <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="day"
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
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                name="Sales"
              />
              <Area
                type="monotone"
                dataKey="purchases"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#purchaseGrad)"
                name="Purchases"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        {/* PRODUCT MIX BAR CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          {/* CHART HEADER */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold">Product Mix</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Milk vs Yoghurt
              </p>
            </div>
          </div>
          {/* CHART */}
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={PRODUCT_DATA} barGap={2}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
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
      </div>
      {/* BOTTOM ROW - ACTIVITY & TOP CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* RECENT ACTIVITY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card lg:col-span-3 overflow-hidden"
        >
          {/* SECTION HEADER */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest transactions across all modules
              </p>
            </div>
            {/* VIEW ALL BUTTON */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              View All <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          {/* ACTIVITY LIST */}
          <div className="divide-y divide-border/50">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors"
              >
                {/* CUSTOMER AVATAR */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                    item.type === "sale"
                      ? "bg-primary/10 text-primary"
                      : item.type === "purchase"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {item.customer.charAt(0)}
                </div>
                {/* ACTIVITY INFO */}
                <div className="flex-1 min-w-0">
                  {/* CUSTOMER NAME & TYPE */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {item.customer}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider font-semibold"
                    >
                      {item.type}
                    </Badge>
                  </div>
                  {/* TIME */}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.time}
                  </p>
                </div>
                {/* AMOUNT & STATUS */}
                <div className="text-right shrink-0">
                  {/* AMOUNT */}
                  <p
                    className={cn(
                      "font-display font-bold text-sm",
                      item.type === "purchase" ? "text-destructive" : "",
                    )}
                  >
                    {item.type === "purchase" ? "-" : "+"}₨
                    {item.amount.toLocaleString()}
                  </p>
                  {/* STATUS BADGE */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[9px] font-bold tracking-wider uppercase mt-0.5",
                      item.status === "paid" ||
                        item.status === "received" ||
                        item.status === "cleared"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    )}
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* TOP CUSTOMERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card lg:col-span-2 overflow-hidden"
        >
          {/* SECTION HEADER */}
          <div className="p-5 border-b border-border">
            <h3 className="font-display font-semibold">Top Customers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              By total revenue
            </p>
          </div>
          {/* CUSTOMER LIST */}
          <div className="p-4 space-y-3">
            {TOP_CUSTOMERS.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
              >
                {/* CUSTOMER AVATAR */}
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {c.name.charAt(0)}
                  </span>
                </div>
                {/* CUSTOMER INFO */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.orders} orders
                  </p>
                </div>
                {/* TOTAL & TREND */}
                <div className="text-right">
                  {/* TOTAL */}
                  <p className="font-display font-bold text-sm">
                    ₨{c.total.toLocaleString()}
                  </p>
                  {/* TREND */}
                  <div
                    className={cn(
                      "flex items-center gap-0.5 justify-end text-[10px] font-semibold",
                      c.trend === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500",
                    )}
                  >
                    {c.trend === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {c.trend === "up" ? "Growing" : "Declining"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* RECOVERY RATE SUMMARY */}
          <div className="px-4 pb-4">
            <div className="bg-muted/50 rounded-xl p-4">
              {/* RECOVERY RATE HEADER */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Recovery Rate
                </span>
                <span className="text-xs font-bold">72%</span>
              </div>
              {/* PROGRESS BAR */}
              <Progress value={72} className="h-2" />
              {/* RECOVERY AMOUNT */}
              <p className="text-[10px] text-muted-foreground mt-2">
                ₨3,68,000 recovered of ₨5,12,000
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Dashboard.displayName = "Dashboard";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Dashboard;
