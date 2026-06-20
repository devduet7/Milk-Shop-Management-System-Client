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
import { Users } from "lucide-react";
import AnalyticsChartCard from "./AnalyticsChartCard";
import type { StaffPayrollDatum } from "@/types/analytics-types";
import { AXIS_TICK_STYLE, TOOLTIP_STYLE } from "@/lib/chartUtils";

// <== STAFF PAYROLL CHART PROPS ==>
interface StaffPayrollChartProps {
  // <== STAFF PAYROLL DATA ==>
  data: StaffPayrollDatum[];
  // <== TOTAL STAFF OUTGO ==>
  totalOutgo: number;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== STAFF CHART DATA ITEM TYPE ==>
type StaffChartDataItem = {
  // <== FIRST NAME FOR AXIS LABEL ==>
  name: string;
  // <== FULL NAME FOR TOOLTIP ==>
  fullName: string;
  // <== BASE SALARY ==>
  salary: number;
  // <== AMOUNT PAID ==>
  paid: number;
  // <== AMOUNT DUE ==>
  due: number;
  // <== EXTRA AMOUNT ==>
  extra: number;
  // <== WHETHER SALARY IS FULLY CLEARED ==>
  isCleared: boolean;
};

// <== TOOLTIP FORMATTER PROPS TYPE ==>
type PayrollTooltipFormatterProps = {
  // <== RAW PAYLOAD ITEM ==>
  payload: StaffChartDataItem;
};

// <== STAFF PAYROLL CHART COMPONENT ==>
const StaffPayrollChart = memo(
  ({ data, totalOutgo, isLoading }: StaffPayrollChartProps) => {
    // CHART DATA — HORIZONTAL BAR PER STAFF MEMBER
    const chartData: StaffChartDataItem[] = data.map((s) => ({
      name: s.name.split(" ")[0], // FIRST NAME ONLY FOR AXIS LABEL
      fullName: s.name,
      salary: s.salary,
      paid: s.paid,
      due: s.due,
      extra: s.extra,
      isCleared: s.isCleared,
    }));
    // DYNAMIC HEIGHT — 52PX PER STAFF MEMBER, MIN 160PX
    const chartHeight = Math.max(160, data.length * 52);
    // IS DATA EMPTY — NO STAFF MEMBERS
    const isEmpty = !isLoading && data.length === 0;
    // RETURNING CHART
    return (
      <AnalyticsChartCard
        title="Staff Payroll"
        subtitle="Salary vs paid per staff member this month"
        icon={Users}
        iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        badge={`₨${totalOutgo.toLocaleString()} total`}
        badgeClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        isLoading={isLoading}
        chartHeight={chartHeight}
        animDelay={0.3}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">
            No staff members found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 36, left: 8, bottom: 4 }}
              barGap={3}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₨${(v / 1000).toFixed(0)}k` : `₨${v}`
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(
                  value: number,
                  name: string,
                  props: PayrollTooltipFormatterProps,
                ) => {
                  // EXTRACTING PAYLOAD DATA
                  const d = props.payload;
                  // SALARY ROW — SHOW CLEARED STATUS OR AMOUNT DUE
                  if (name === "Salary")
                    // RETURNING TOOLTIP CONTENT
                    return [
                      `₨${value.toLocaleString()} (${d.isCleared ? "✓ Cleared" : `₨${d.due.toLocaleString()} due`})`,
                      d.fullName,
                    ];
                  // OTHER ROWS — PLAIN AMOUNT
                  return [`₨${value.toLocaleString()}`, name];
                }}
                labelFormatter={() => ""}
              />
              {/* SALARY BAR (BACKGROUND) */}
              <Bar
                dataKey="salary"
                name="Salary"
                fill="#e2e8f0"
                radius={[0, 4, 4, 0]}
                maxBarSize={16}
              />
              {/* PAID BAR (FOREGROUND) */}
              <Bar
                dataKey="paid"
                name="Paid"
                radius={[0, 4, 4, 0]}
                maxBarSize={16}
              >
                {/* CELL PER STAFF — GREEN IF CLEARED, PURPLE IF PENDING */}
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-paid-${i}`}
                    fill={entry.isCleared ? "#10b981" : "#8b5cf6"}
                    fillOpacity={0.9}
                  />
                ))}
                {/* PAID AMOUNT LABEL ON RIGHT */}
                <LabelList
                  dataKey="paid"
                  position="right"
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
StaffPayrollChart.displayName = "StaffPayrollChart";

// <== EXPORT ==>
export default StaffPayrollChart;
