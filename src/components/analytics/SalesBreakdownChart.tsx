// <== IMPORTS ==>
import {
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  LabelList,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { memo } from "react";
import { ShoppingCart } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import type { SalesBreakdown } from "@/types/analytics-types";
import { AXIS_TICK_STYLE, CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== SALES BREAKDOWN CHART PROPS ==>
interface SalesBreakdownChartProps {
  // <== SALES BREAKDOWN DATA ==>
  data: SalesBreakdown | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== CHART DATA ITEM TYPE ==>
type SalesChartDataItem = {
  // <== DISPLAY NAME ==>
  name: string;
  // <== TOTAL REVENUE VALUE ==>
  value: number;
  // <== QUANTITY SOLD ==>
  qty: number;
  // <== BAR COLOR ==>
  color: string;
};

// <== TOOLTIP FORMATTER PROPS TYPE ==>
type TooltipFormatterProps = {
  // <== RAW PAYLOAD ITEM ==>
  payload: SalesChartDataItem;
};

// <== SALES BREAKDOWN CHART COMPONENT ==>
const SalesBreakdownChart = memo(
  ({ data, isLoading }: SalesBreakdownChartProps) => {
    // BUILD CHART DATA FROM BREAKDOWN BUCKETS
    const chartData: SalesChartDataItem[] = [
      {
        name: "Cust. Milk",
        value: data?.customerMilk?.total ?? 0,
        qty: data?.customerMilk?.qty ?? 0,
        color: CHART_COLORS.customerMilk,
      },
      {
        name: "Cust. Yoghurt",
        value: data?.customerYoghurt?.total ?? 0,
        qty: data?.customerYoghurt?.qty ?? 0,
        color: CHART_COLORS.customerYoghurt,
      },
      {
        name: "Shop Milk",
        value: data?.shopMilk?.total ?? 0,
        qty: data?.shopMilk?.qty ?? 0,
        color: CHART_COLORS.shopMilk,
      },
      {
        name: "Shop Yoghurt",
        value: data?.shopYoghurt?.total ?? 0,
        qty: data?.shopYoghurt?.qty ?? 0,
        color: CHART_COLORS.shopYoghurt,
      },
    ];
    // TOTAL SALES REVENUE
    const totalRevenue = chartData.reduce((sum, d) => sum + d.value, 0);
    // IS DATA EMPTY
    const isEmpty = !isLoading && totalRevenue === 0;
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Sales Breakdown"
        subtitle="Revenue by sale type and product"
        icon={ShoppingCart}
        iconClass="bg-primary/10 text-primary"
        badge={`₨${totalRevenue.toLocaleString()}`}
        badgeClass="bg-primary/10 text-primary"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.1}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No sales recorded this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
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
                formatter={(
                  value: number,
                  _name: string,
                  props: TooltipFormatterProps,
                ) => [
                  `₨${value.toLocaleString()} · ${props.payload.qty.toLocaleString()} units`,
                  props.payload.name,
                ]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {/* CELL PER BAR WITH DYNAMIC COLOR */}
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.color}
                    fillOpacity={0.9}
                  />
                ))}
                {/* TOP LABEL IN K FORMAT */}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) =>
                    v > 0 ? `₨${(v / 1000).toFixed(0)}k` : ""
                  }
                  style={{
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SalesBreakdownChart.displayName = "SalesBreakdownChart";

// <== EXPORT ==>
export default SalesBreakdownChart;
