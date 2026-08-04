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
import { memo } from "react";
import { Milk } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import type { DailyMilkLog } from "@/types/analytics-types";
import { AXIS_TICK_STYLE, TOOLTIP_STYLE, CHART_COLORS } from "@/lib/chartUtils";

// <== MILK LOG TREND CHART PROPS ==>
interface MilkLogTrendChartProps {
  // <== DAILY MILK LOG DATA ==>
  data: DailyMilkLog[];
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== MILK LOG TREND CHART COMPONENT ==>
const MilkLogTrendChart = memo(
  ({ data, isLoading }: MilkLogTrendChartProps) => {
    // IS DATA EMPTY — ALL DAYS HAVE ZERO LEFTOVER AND ZERO YOGHURT
    const isEmpty =
      !isLoading &&
      data.every((d) => d.totalLeftover === 0 && d.totalYoghurt === 0);
    // TOTAL COMBINED QUANTITY FOR THE BADGE
    const totalQty = data.reduce(
      (sum, d) => sum + d.totalLeftover + d.totalYoghurt,
      0,
    );
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Milk Log Trend"
        subtitle="Daily leftover and yoghurt quantities"
        icon={Milk}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        badge={`${totalQty.toLocaleString()}L logged`}
        badgeClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.3}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No milk log entries recorded this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
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
              <YAxis
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}L`}
                width={40}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()}L`,
                  name,
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* LEFTOVER BAR */}
              <Bar
                dataKey="totalLeftover"
                name="Leftover"
                fill={CHART_COLORS.milk}
                radius={[3, 3, 0, 0]}
                fillOpacity={0.8}
                maxBarSize={14}
              />
              {/* YOGHURT BAR */}
              <Bar
                dataKey="totalYoghurt"
                name="Yoghurt"
                fill={CHART_COLORS.yoghurt}
                radius={[3, 3, 0, 0]}
                fillOpacity={0.8}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
MilkLogTrendChart.displayName = "MilkLogTrendChart";

// <== EXPORT ==>
export default MilkLogTrendChart;
