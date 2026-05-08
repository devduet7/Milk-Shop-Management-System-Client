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
import type { DailyDeliveries } from "@/types/analytics-types";
import { AXIS_TICK_STYLE, CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== DELIVERY PERFORMANCE CHART PROPS ==>
interface DeliveryPerformanceChartProps {
  // <== DAILY DELIVERIES DATA ==>
  data: DailyDeliveries[];
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== TOOLTIP FORMATTER PROPS TYPE ==>
type DeliveryTooltipFormatterProps = {
  // <== RAW PAYLOAD ITEM ==>
  payload: DailyDeliveries;
};

// <== DELIVERY PERFORMANCE CHART COMPONENT ==>
const DeliveryPerformanceChart = memo(
  ({ data, isLoading }: DeliveryPerformanceChartProps) => {
    // TOTALS FROM DAILY DATA
    const totalDelivered = data.reduce((sum, d) => sum + d.delivered, 0);
    const totalMissed = data.reduce((sum, d) => sum + d.missed, 0);
    const totalMilk = data.reduce((sum, d) => sum + d.milkQty, 0);
    // DELIVERY RATE PERCENTAGE
    const deliveryRate =
      totalDelivered + totalMissed > 0
        ? ((totalDelivered / (totalDelivered + totalMissed)) * 100).toFixed(1)
        : "0";
    // IS DATA EMPTY — NO DELIVERED OR MISSED RECORDS
    const isEmpty = !isLoading && totalDelivered === 0 && totalMissed === 0;
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Delivery Performance"
        subtitle={`${totalDelivered} delivered · ${totalMissed} missed · ${totalMilk.toLocaleString()}L total`}
        icon={Milk}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        badge={`${deliveryRate}% rate`}
        badgeClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.25}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No delivery records found this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="15%"
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
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(
                  value: number,
                  name: string,
                  props: DeliveryTooltipFormatterProps,
                ) => [
                  `${value} records · ${props.payload.milkQty?.toLocaleString() ?? 0}L`,
                  name,
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* DELIVERED STACK BAR */}
              <Bar
                dataKey="delivered"
                name="Delivered"
                stackId="delivery"
                fill={CHART_COLORS.delivered}
                fillOpacity={0.85}
                radius={[0, 0, 0, 0]}
                maxBarSize={18}
              />
              {/* MISSED STACK BAR */}
              <Bar
                dataKey="missed"
                name="Missed"
                stackId="delivery"
                fill={CHART_COLORS.missed}
                fillOpacity={0.7}
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeliveryPerformanceChart.displayName = "DeliveryPerformanceChart";

// <== EXPORT ==>
export default DeliveryPerformanceChart;
