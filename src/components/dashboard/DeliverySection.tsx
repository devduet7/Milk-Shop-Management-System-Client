// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Milk } from "lucide-react";
import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardCustomers } from "@/hooks/useDashboard";
import type { DashboardDeliveriesStats } from "@/types/dashboard-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== DELIVERY SECTION PROPS ==>
interface DeliverySectionProps {
  // <== STATS ==>
  stats: DashboardDeliveriesStats | undefined;
  // <== MONTH ==>
  month: string;
}

// <== DELIVERY SECTION COMPONENT ==>
const DeliverySection = memo(({ stats, month }: DeliverySectionProps) => {
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
          label: "Bill Due",
          value: `₨${(stats?.monthlyBillingDue ?? 0).toLocaleString()}`,
          colorClass: "bg-muted/60 text-foreground",
        },
        {
          label: "Collected",
          value: `₨${(stats?.monthlyBillingPaid ?? 0).toLocaleString()}`,
          colorClass:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Pending",
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
            Monthly Delivery Rate ({stats?.deliveredDays ?? 0} delivered /{" "}
            {(stats?.deliveredDays ?? 0) + (stats?.missedDays ?? 0)} total)
          </span>
          <span className="font-semibold text-foreground">
            {(stats?.deliveryRate ?? 0).toFixed(1)}%
          </span>
        </div>
        <Progress value={stats?.deliveryRate ?? 0} className="h-1.5" />
        <p className="text-xs text-muted-foreground">
          {data?.pagination?.total ?? 0} customers ·{" "}
          {(stats?.totalMilkDelivered ?? 0).toLocaleString()}L delivered this
          month
        </p>
      </div>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[440px]">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Customer
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Delivered
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                Missed
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Milk (L)
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Bill Due
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
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
              // LOOPING THROUGH CUSTOMER RECORDS
              data?.records.map((r) => {
                // CALCULATING CLEARED STATUS
                const isCleared =
                  r.monthStats.billingPending === 0 &&
                  r.monthStats.billingDue > 0;
                //   CALCULATING HAS ACTIVITY
                const hasActivity =
                  r.monthStats.deliveredDays > 0 || r.monthStats.missedDays > 0;
                //   RETURNING TABLE ROW
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
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeliverySection.displayName = "DeliverySection";

// <== EXPORT ==>
export default DeliverySection;
