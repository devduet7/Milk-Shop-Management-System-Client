// <== IMPORTS ==>
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type {
  DailyQuickSales,
  QuickSalesBreakdown,
} from "@/types/analytics-types";
import { memo } from "react";
import { Zap } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { AXIS_TICK_STYLE, CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== QUICK SALES DAILY CHART PROPS ==>
interface QuickSalesDailyChartProps {
  // <== DAILY QUICK SALES DATA ==>
  dailyData: DailyQuickSales[];
  // <== QUICK SALES BREAKDOWN SUMMARY ==>
  breakdown: QuickSalesBreakdown | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== QUICK SALES DAILY CHART COMPONENT ==>
const QuickSalesDailyChart = memo(
  ({ dailyData, breakdown, isLoading }: QuickSalesDailyChartProps) => {
    // TOTAL QUICK SALES REVENUE
    const totalRevenue =
      (breakdown?.milk?.total ?? 0) + (breakdown?.yoghurt?.total ?? 0);
    // IS DATA EMPTY — ALL DAYS HAVE ZERO MILK AND YOGHURT REVENUE
    const isEmpty =
      !isLoading &&
      dailyData.every((d) => d.milkRevenue === 0 && d.yoghurtRevenue === 0);
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Quick Sales — Daily"
        subtitle="Milk vs Yoghurt revenue per day"
        icon={Zap}
        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        badge={`₨${totalRevenue.toLocaleString()}`}
        badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.15}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No quick sales recorded this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={dailyData}
              margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
              barGap={1}
              barCategoryGap="20%"
            >
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
                width={44}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [
                  `₨${value.toLocaleString()}`,
                  name,
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* MILK REVENUE BAR */}
              <Bar
                dataKey="milkRevenue"
                name="Milk"
                fill={CHART_COLORS.milk}
                radius={[3, 3, 0, 0]}
                fillOpacity={0.9}
                maxBarSize={10}
              />
              {/* YOGHURT REVENUE BAR */}
              <Bar
                dataKey="yoghurtRevenue"
                name="Yoghurt"
                fill={CHART_COLORS.yoghurt}
                radius={[3, 3, 0, 0]}
                fillOpacity={0.9}
                maxBarSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
QuickSalesDailyChart.displayName = "QuickSalesDailyChart";

// <== EXPORT ==>
export default QuickSalesDailyChart;
