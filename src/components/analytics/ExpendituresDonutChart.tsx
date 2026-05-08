// <== IMPORTS ==>
import { memo } from "react";
import { Wallet } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { CHART_COLORS, TOOLTIP_STYLE } from "@/lib/chartUtils";
import type { ExpenditureCategoryDatum } from "@/types/analytics-types";
import { Pie, Cell, Tooltip, PieChart, ResponsiveContainer } from "recharts";

// <== EXPENDITURES DONUT CHART PROPS ==>
interface ExpendituresDonutChartProps {
  // <== EXPENDITURE CATEGORY DATA ==>
  data: ExpenditureCategoryDatum[];
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== TOOLTIP FORMATTER PROPS TYPE ==>
type DonutTooltipFormatterProps = {
  // <== RAW PAYLOAD ITEM ==>
  payload: ExpenditureCategoryDatum;
};

// <== CUSTOM LEGEND COMPONENT ==>
const CustomLegend = ({ data }: { data: ExpenditureCategoryDatum[] }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 px-3">
    {data.map((entry) => (
      <div key={entry.category} className="flex items-center gap-1.5 min-w-0">
        {/* CATEGORY COLOR DOT */}
        <div
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{
            backgroundColor:
              CHART_COLORS.categories[
                entry.category as keyof typeof CHART_COLORS.categories
              ] || "#94a3b8",
          }}
        />
        {/* CATEGORY LABEL */}
        <span className="text-[10px] text-muted-foreground truncate">
          {entry.label}
        </span>
        {/* CATEGORY PERCENTAGE */}
        <span className="text-[10px] font-semibold ml-auto shrink-0">
          {entry.percentage > 0 ? `${entry.percentage}%` : "0%"}
        </span>
      </div>
    ))}
  </div>
);

// <== EXPENDITURES DONUT CHART COMPONENT ==>
const ExpendituresDonutChart = memo(
  ({ data, isLoading }: ExpendituresDonutChartProps) => {
    // TOTAL EXPENDITURE AMOUNT
    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);
    // IS DATA EMPTY — ALL CATEGORIES HAVE ZERO AMOUNT
    const isEmpty = !isLoading && totalAmount === 0;
    // DONUT DATA — FILTER OUT ZERO CATEGORIES FOR CLEANER CHART
    const donutData = data.filter((d) => d.amount > 0);
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Expenditures"
        subtitle="Breakdown by category"
        icon={Wallet}
        iconClass="bg-red-500/10 text-red-600 dark:text-red-400"
        badge={`₨${totalAmount.toLocaleString()}`}
        badgeClass="bg-red-500/10 text-red-600 dark:text-red-400"
        isLoading={isLoading}
        chartHeight={220}
        animDelay={0.12}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
            No expenditures recorded this month
          </div>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  dataKey="amount"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {/* CELL PER SLICE WITH CATEGORY COLOR */}
                  {donutData.map((entry) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={
                        CHART_COLORS.categories[
                          entry.category as keyof typeof CHART_COLORS.categories
                        ] || "#94a3b8"
                      }
                      fillOpacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(
                    value: number,
                    _name: string,
                    props: DonutTooltipFormatterProps,
                  ) => [
                    `₨${value.toLocaleString()} (${props.payload.percentage}%)`,
                    props.payload.label,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* CUSTOM LEGEND BELOW CHART */}
            <CustomLegend data={data} />
          </div>
        )}
      </AnalyticsChartCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ExpendituresDonutChart.displayName = "ExpendituresDonutChart";

// <== EXPORT ==>
export default ExpendituresDonutChart;
