// <== IMPORTS ==>
import {
  Area,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type {
  DailyFinancials,
  FinancialSummary,
} from "@/types/analytics-types";
import { memo, type CSSProperties } from "react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AXIS_TICK_STYLE, CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== REVENUE VS EXPENSES CHART PROPS ==>
interface RevenueVsExpensesChartProps {
  // <== DATA ==>
  data: DailyFinancials[];
  // <== SUMMARY ==>
  summary: FinancialSummary | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== TOOLTIP PAYLOAD ITEM TYPE ==>
type TooltipPayloadItem = {
  // <== RECHARTS DATA KEY ==>
  dataKey: string;
  // <== NUMERIC VALUE ==>
  value: number;
};

// <== CUSTOM TOOLTIP PROPS TYPE ==>
type CustomTooltipProps = {
  // <== ACTIVE STATE ==>
  active?: boolean;
  // <== PAYLOAD ARRAY ==>
  payload?: TooltipPayloadItem[];
  // <== AXIS LABEL ==>
  label?: string | number;
};

// <== CUSTOM TOOLTIP CONTENT ==>
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  // IS TOOLTIP ACTIVE
  if (!active || !payload?.length) return null;
  // GETTING REVENUE
  const revenue =
    payload.find((p: TooltipPayloadItem) => p.dataKey === "revenue")?.value ??
    0;
  // GETTING PURCHASES
  const purchases =
    payload.find((p: TooltipPayloadItem) => p.dataKey === "purchases")?.value ??
    0;
  // GETTING EXPENDITURES
  const expenditures =
    payload.find((p: TooltipPayloadItem) => p.dataKey === "expenditures")
      ?.value ?? 0;
  // CALCULATING EXPENSES
  const expenses = purchases + expenditures;
  // CALCULATING NET
  const net = revenue - expenses;
  // RETURNING TOOLTIP
  return (
    <div style={TOOLTIP_STYLE as CSSProperties}>
      <p className="font-semibold text-[11px] mb-1.5 text-muted-foreground">
        Day {label}
      </p>
      {/* REVENUE VS EXPENSES */}
      <div className="space-y-1">
        {/* REVENUE */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-emerald-600">Revenue</span>
          <span className="text-[11px] font-bold">
            ₨{revenue.toLocaleString()}
          </span>
        </div>
        {/* EXPENSES */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-red-500">Expenses</span>
          <span className="text-[11px] font-bold">
            ₨{expenses.toLocaleString()}
          </span>
        </div>
        {/* NET */}
        <div className="border-t border-border/50 pt-1 mt-1 flex items-center justify-between gap-4">
          <span className="text-[11px] text-muted-foreground">Net</span>
          <span
            className={`text-[11px] font-bold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}
          >
            {net >= 0 ? "+" : ""}₨{net.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// <== REVENUE VS EXPENSES CHART COMPONENT ==>
const RevenueVsExpensesChart = memo(
  ({ data, summary, isLoading }: RevenueVsExpensesChartProps) => {
    // IS DATA EMPTY — ALL DAYS HAVE ZERO REVENUE AND ZERO EXPENSES
    const isEmpty =
      !isLoading &&
      data.every(
        (d) => d.revenue === 0 && d.purchases === 0 && d.expenditures === 0,
      );
    // NET POSITION IS POSITIVE IF >= 0
    const netPositive = (summary?.netPosition ?? 0) >= 0;
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Revenue vs Expenses"
        subtitle="Daily cash flow breakdown for the month"
        icon={netPositive ? TrendingUp : TrendingDown}
        iconClass={
          netPositive
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }
        badge={
          summary
            ? `Net: ${netPositive ? "+" : ""}₨${summary.netPosition.toLocaleString()}`
            : undefined
        }
        badgeClass={
          netPositive
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }
        isLoading={isLoading}
        chartHeight={280}
        animDelay={0.05}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            No financial data for this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {/* REVENUE GRADIENT */}
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.revenue}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.revenue}
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* PURCHASES GRADIENT */}
                <linearGradient id="gradPurchases" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.purchases}
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.purchases}
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* EXPENDITURES GRADIENT */}
                <linearGradient id="gradExpend" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.expenditures}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.expenditures}
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
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₨${(v / 1000).toFixed(0)}k` : `₨${v}`
                }
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={CHART_COLORS.revenue}
                strokeWidth={2.5}
                fill="url(#gradRevenue)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="purchases"
                name="Purchases"
                stroke={CHART_COLORS.purchases}
                strokeWidth={1.5}
                fill="url(#gradPurchases)"
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="expenditures"
                name="Expenditures"
                stroke={CHART_COLORS.expenditures}
                strokeWidth={1.5}
                fill="url(#gradExpend)"
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
RevenueVsExpensesChart.displayName = "RevenueVsExpensesChart";

// <== EXPORT ==>
export default RevenueVsExpensesChart;
