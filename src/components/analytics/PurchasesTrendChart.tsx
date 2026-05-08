// <== IMPORTS ==>
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { memo } from "react";
import { Package } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import type { DailyPurchases } from "@/types/analytics-types";
import { AXIS_TICK_STYLE, CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== PURCHASES TREND CHART PROPS ==>
interface PurchasesTrendChartProps {
  // <== DAILY PURCHASES DATA ==>
  data: DailyPurchases[];
  // <== TOTAL AMOUNT SPENT ==>
  totalSpent: number;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== PURCHASES TREND CHART COMPONENT ==>
const PurchasesTrendChart = memo(
  ({ data, totalSpent, isLoading }: PurchasesTrendChartProps) => {
    // IS DATA EMPTY — ALL DAYS HAVE ZERO COST
    const isEmpty = !isLoading && data.every((d) => d.cost === 0);
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Purchases Trend"
        subtitle="Daily cost and average price per liter"
        icon={Package}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        badge={`₨${totalSpent.toLocaleString()} spent`}
        badgeClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.2}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No purchases recorded this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
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
              {/* LEFT Y-AXIS FOR COST */}
              <YAxis
                yAxisId="cost"
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₨${(v / 1000).toFixed(0)}k` : `₨${v}`
                }
                width={44}
              />
              {/* RIGHT Y-AXIS FOR AVG RATE */}
              <YAxis
                yAxisId="rate"
                orientation="right"
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₨${v}`}
                width={40}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [
                  name === "Daily Cost"
                    ? `₨${value.toLocaleString()}`
                    : `₨${value.toLocaleString()}/L`,
                  name,
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* DAILY COST BAR */}
              <Bar
                yAxisId="cost"
                dataKey="cost"
                name="Daily Cost"
                fill={CHART_COLORS.purchases}
                radius={[3, 3, 0, 0]}
                fillOpacity={0.8}
                maxBarSize={14}
              />
              {/* AVERAGE RATE PER LITER LINE */}
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="avgRate"
                name="Avg ₨/L"
                stroke={CHART_COLORS.expenditures}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PurchasesTrendChart.displayName = "PurchasesTrendChart";

// <== EXPORT ==>
export default PurchasesTrendChart;
