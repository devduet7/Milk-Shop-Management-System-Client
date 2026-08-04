// <== IMPORTS ==>
import type {
  DashboardFilterType,
  DashboardDeliveriesStats,
} from "@/types/dashboard-types";
import { cn } from "@/lib/utils";
import { Milk } from "lucide-react";
import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardCustomers } from "@/hooks/useDashboard";
import PaginationControls from "@/components/common/PaginationControls";

// <== HELPER: TITLE-CASE PERIOD LABEL FOR THE FILTER-FOLLOWING SUMMARY ROW ==>
const getPeriodLabel = (filterType: DashboardFilterType): string => {
  // SWITCH ON FILTER TYPE
  switch (filterType) {
    // TODAY FILTER
    case "today":
      return "Today's";
    // WEEK FILTER
    case "week":
      return "This Week's";
    // DATE FILTER
    case "date":
      return "Selected Date's";
    // RANGE FILTER
    case "range":
      return "Selected Range's";
    // MONTH FILTER
    case "month":
      return "This Month's";
    // DEFAULT
    default:
      return "This Month's";
  }
};

// <== HELPER: LOWERCASE PERIOD PHRASE FOR INLINE SENTENCES ==>
const getPeriodPhrase = (filterType: DashboardFilterType): string => {
  // SWITCH ON FILTER TYPE
  switch (filterType) {
    // TODAY FILTER
    case "today":
      return "today";
    // WEEK FILTER
    case "week":
      return "this week";
    // DATE FILTER
    case "date":
      return "on the selected date";
    // RANGE FILTER
    case "range":
      return "in the selected range";
    // MONTH FILTER
    case "month":
      return "this month";
    // DEFAULT
    default:
      return "this month";
  }
};

// <== DELIVERY SECTION PROPS ==>
interface DeliverySectionProps {
  // <== STATS ==>
  stats: DashboardDeliveriesStats | undefined;
  // <== ACTIVE FILTER TYPE ==>
  filterType: DashboardFilterType;
  // <== MONTH ==>
  month: string;
}

// <== DELIVERY SECTION COMPONENT ==>
const DeliverySection = memo(
  ({ stats, filterType, month }: DeliverySectionProps) => {
    // PAGE NUMBER STATE
    const [page, setPage] = useState<number>(1);
    // PAGINATION LIMIT
    const limit = 5;
    // FETCH PAGINATED CUSTOMERS
    const { data, isLoading } = useDashboardCustomers(month, page, limit);
    // RETURNING DELIVERY SECTION
    return (
      <DashboardSectionCard
        title="Customer Deliveries"
        icon={Milk}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        chips={[
          {
            label: "Bill Due (Month)",
            value: `₨${(stats?.monthlyBillingDue ?? 0).toLocaleString()}`,
            colorClass: "bg-muted/60 text-foreground",
          },
          {
            label: "Collected (Month)",
            value: `₨${(stats?.monthlyBillingPaid ?? 0).toLocaleString()}`,
            colorClass:
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Pending (Month)",
            value: `₨${(stats?.monthlyBillingPending ?? 0).toLocaleString()}`,
            colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
          },
          {
            label: "Rate",
            value: `${(stats?.deliveryRate ?? 0).toFixed(0)}%`,
            colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
        ]}
      >
        {/* SUMMARY ROW */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {getPeriodLabel(filterType)} Delivery Rate (
              {stats?.deliveredDays ?? 0} delivered /{" "}
              {(stats?.deliveredDays ?? 0) + (stats?.missedDays ?? 0)} total)
            </span>
            <span className="font-semibold text-foreground">
              {(stats?.deliveryRate ?? 0).toFixed(1)}%
            </span>
          </div>
          <Progress value={stats?.deliveryRate ?? 0} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {(stats?.totalMilkDelivered ?? 0).toLocaleString()}L delivered{" "}
            {getPeriodPhrase(filterType)}
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            Per-customer detail below always reflects the selected month (
            {data?.pagination?.total ?? 0} customers), regardless of the period
            filter above.
          </p>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[440px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border backdrop-blur-sm">
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Delivered
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Missed
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Milk (L)
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Bill Due
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-10" />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-10" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                  </tr>
                ))}
              {/* RENDERING DATA */}
              {!isLoading &&
                data?.records.map((r) => {
                  // CALCULATING CLEARED STATUS
                  const isCleared =
                    r.monthStats.billingPending === 0 &&
                    r.monthStats.billingDue > 0;
                  // CALCULATING HAS ACTIVITY
                  const hasActivity =
                    r.monthStats.deliveredDays > 0 ||
                    r.monthStats.missedDays > 0;
                  // RETURNING TABLE ROW
                  return (
                    <tr
                      key={r._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium truncate max-w-[120px]">
                        {r.name}
                      </td>
                      <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {r.monthStats.deliveredDays}
                      </td>
                      <td className="px-3 py-2 text-red-500 hidden sm:table-cell">
                        {r.monthStats.missedDays}
                      </td>
                      <td className="px-3 py-2">
                        {r.monthStats.totalMilkDelivered.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {r.monthStats.billingDue > 0
                          ? `₨${r.monthStats.billingDue.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {!hasActivity ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] uppercase font-bold tracking-wider bg-muted/60 text-muted-foreground"
                          >
                            No Records
                          </Badge>
                        ) : isCleared ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          >
                            Cleared
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] uppercase font-bold tracking-wider",
                              r.monthStats.billingPending > 0
                                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                : "bg-muted/60 text-muted-foreground",
                            )}
                          >
                            {r.monthStats.billingPending > 0
                              ? `₨${r.monthStats.billingPending.toLocaleString()} Due`
                              : "No Bill"}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {/* EMPTY STATE */}
              {!isLoading && data?.records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-muted-foreground text-xs"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        {!isLoading && (data?.pagination?.total ?? 0) > 0 && (
          <PaginationControls
            currentPage={page}
            totalPages={data?.pagination?.totalPages ?? 1}
            rowsPerPage={limit}
            totalFiltered={data?.pagination?.total ?? 0}
            startIndex={(page - 1) * limit}
            onPageChange={setPage}
            onRowsPerPageChange={() => {}}
          />
        )}
      </DashboardSectionCard>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeliverySection.displayName = "DeliverySection";

// <== EXPORT ==>
export default DeliverySection;
