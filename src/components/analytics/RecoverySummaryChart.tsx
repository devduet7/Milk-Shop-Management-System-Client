// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";
import type { AnalyticsRecovery } from "@/types/analytics-types";
import { Pie, Cell, Tooltip, PieChart, ResponsiveContainer } from "recharts";

// <== RECOVERY SUMMARY CHART PROPS ==>
interface RecoverySummaryChartProps {
  // <== RECOVERY STATS DATA ==>
  data: AnalyticsRecovery | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== RECOVERY SUMMARY CHART COMPONENT ==>
const RecoverySummaryChart = memo(
  ({ data, isLoading }: RecoverySummaryChartProps) => {
    // RECOVERY RATE
    const rate = data?.recoveryRate ?? 0;
    // IS DATA EMPTY — NO ALL-TIME DUE
    const isEmpty = !isLoading && (data?.totalAllTimeDue ?? 0) === 0;
    // PIE DATA — COLLECTED VS OUTSTANDING
    const pieData = [
      {
        name: "Collected",
        value: data?.totalAllTimePaid ?? 0,
        color: CHART_COLORS.recoveryCollected,
      },
      {
        name: "Outstanding",
        value: data?.totalOutstanding ?? 0,
        color: CHART_COLORS.recoveryOutstanding,
      },
    ].filter((d) => d.value > 0);
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Recovery Overview"
        subtitle="All-time combined outstanding balances"
        icon={RefreshCw}
        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        badge="ALL TIME"
        badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
        chartHeight={240}
        animDelay={0.35}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No outstanding balances on record
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-2">
            {/* DONUT CHART */}
            <div className="relative w-[160px] h-[160px]">
              <PieChart width={160} height={160}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                >
                  {/* CELL PER SLICE WITH RECOVERY COLOR */}
                  {pieData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.color}
                      fillOpacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number, name: string) => [
                    `₨${value.toLocaleString()}`,
                    name,
                  ]}
                />
              </PieChart>
              {/* CENTERED RATE LABEL */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={cn(
                    "text-xl font-bold font-display leading-none",
                    rate >= 70
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {rate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  recovered
                </span>
              </div>
            </div>
            {/* STAT GRID */}
            <div className="grid grid-cols-2 gap-2 w-full text-center">
              {/* TOTAL DUE */}
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">Total Due</p>
                <p className="text-xs font-bold">
                  ₨{(data?.totalAllTimeDue ?? 0).toLocaleString()}
                </p>
              </div>
              {/* TOTAL COLLECTED */}
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">Collected</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₨{(data?.totalAllTimePaid ?? 0).toLocaleString()}
                </p>
              </div>
              {/* SALES OUTSTANDING */}
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">Sales Due</p>
                <p className="text-xs font-bold text-red-500">
                  ₨{(data?.salesOutstanding ?? 0).toLocaleString()}
                </p>
              </div>
              {/* DELIVERY OUTSTANDING */}
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">
                  Delivery Due
                </p>
                <p className="text-xs font-bold text-red-500">
                  ₨{(data?.deliveryOutstanding ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            {/* RECOVERY PROGRESS BAR */}
            <div className="w-full space-y-1">
              <Progress value={rate} className="h-1.5" />
            </div>
          </div>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
RecoverySummaryChart.displayName = "RecoverySummaryChart";

// <== EXPORT ==>
export default RecoverySummaryChart;
