// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStaff } from "@/hooks/useDashboard";
import DashboardSectionCard from "./DashboardSectionCard";
import type { DashboardStaffStats } from "@/types/dashboard-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== STAFF SECTION PROPS ==>
interface StaffSectionProps {
  // <== STATS ==>
  stats: DashboardStaffStats | undefined;
  // <== MONTH ==>
  month: string;
}

// <== STAFF SECTION COMPONENT ==>
const StaffSection = memo(({ stats, month }: StaffSectionProps) => {
  // PAGE NUMBER STATE
  const [page, setPage] = useState<number>(1);
  // PAGINATION LIMIT
  const limit = 5;
  // FETCH PAGINATED STAFF
  const { data, isLoading } = useDashboardStaff(month, page, limit);
  // RETURNING STAFF SECTION
  return (
    <DashboardSectionCard
      title="Staff Payroll"
      icon={Users}
      iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
      chips={[
        {
          label: "Salary Bill",
          value: `₨${(stats?.totalSalaryBill ?? 0).toLocaleString()}`,
          colorClass: "bg-muted/60 text-foreground",
        },
        {
          label: "Paid",
          value: `₨${(stats?.totalPaid ?? 0).toLocaleString()}`,
          colorClass:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Pending",
          value: `₨${(stats?.totalPending ?? 0).toLocaleString()}`,
          colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
        },
        {
          label: `${stats?.clearedCount ?? 0}/${stats?.totalStaff ?? 0} Cleared`,
          value: "",
          colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        },
      ]}
    >
      {/* RECORD COUNT */}
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {stats?.totalStaff ?? 0} staff members · ₨
          {(stats?.totalExtraAllocated ?? 0).toLocaleString()} extra allocated
          this month
        </p>
      </div>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                Salary
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                Paid
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                Extra
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
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Skeleton className="h-4 w-14" />
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </td>
                </tr>
              ))}
            {/* RENDERING DATA */}
            {!isLoading &&
              data?.records.map((r) => {
                // CHECKING THE CLEARED STATUS
                const isCleared = r.monthRecord?.status === "cleared";
                // CALCULATING PAID AMOUNT
                const paidAmount = r.monthRecord?.paidAmount ?? 0;
                // CALCULATING EXTRA ALLOCATED
                const extraAllocated = r.monthRecord?.totalExtraAllocated ?? 0;
                // RETURNING TABLE ROW
                return (
                  <tr
                    key={r._id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 font-semibold">
                      ₨{r.monthlySalary.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                      ₨{paidAmount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-amber-600 dark:text-amber-400 hidden sm:table-cell">
                      {extraAllocated > 0
                        ? `₨${extraAllocated.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] uppercase font-bold tracking-wider",
                          isCleared
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/15 text-red-600 dark:text-red-400",
                        )}
                      >
                        {isCleared
                          ? "Cleared"
                          : `₨${r.salaryDue.toLocaleString()} Due`}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            {/* EMPTY STATE */}
            {!isLoading && data?.records.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-muted-foreground text-xs"
                >
                  No staff members found
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
StaffSection.displayName = "StaffSection";

// <== EXPORT ==>
export default StaffSection;
