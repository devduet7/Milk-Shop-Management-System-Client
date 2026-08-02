// <== IMPORTS ==
import type {
  DashboardFilterType,
  DashboardMilkLogStats,
} from "@/types/dashboard-types";
import { cn } from "@/lib/utils";
import { Milk, IceCream } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardMilkLogs } from "@/hooks/useDashboard";
import PaginationControls from "@/components/common/PaginationControls";

// <== MILK LOG SECTION PROPS ==>
interface MilkLogSectionProps {
  // <== STATS ==>
  stats: DashboardMilkLogStats | undefined;
  // <== ACTIVE FILTER TYPE ==>
  filterType: DashboardFilterType;
  // <== MONTH ==>
  month: string;
  // <== DATE (ONLY WHEN FILTER TYPE IS DATE) ==>
  date: string;
  // <== RANGE START (ONLY WHEN FILTER TYPE IS RANGE) ==>
  rangeStart: string;
  // <== RANGE END (ONLY WHEN FILTER TYPE IS RANGE) ==>
  rangeEnd: string;
}

// <== MILK LOG SECTION COMPONENT ==>
const MilkLogSection = memo(
  ({
    stats,
    filterType,
    month,
    date,
    rangeStart,
    rangeEnd,
  }: MilkLogSectionProps) => {
    // PAGE NUMBER STATE
    const [page, setPage] = useState<number>(1);
    // PAGINATION LIMIT
    const limit = 5;
    // FETCH PAGINATED MILK LOGS
    const { data, isLoading } = useDashboardMilkLogs(
      filterType,
      month,
      date,
      rangeStart,
      rangeEnd,
      page,
      limit,
    );
    // RESET TO PAGE 1 WHENEVER THE ACTIVE DATE FILTER CHANGES
    useEffect(() => {
      // RESET TO FIRST PAGE
      setPage(1);
    }, [filterType, month, date, rangeStart, rangeEnd]);
    // RETURNING MILK LOG SECTION
    return (
      <DashboardSectionCard
        title="Milk Log"
        icon={Milk}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        chips={[
          {
            label: "Leftover",
            value: `${(stats?.totalLeftover ?? 0).toLocaleString()}L`,
            colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Yoghurt",
            value: `${(stats?.totalYoghurt ?? 0).toLocaleString()}L`,
            colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
          },
          {
            label: "Yoghurt Share",
            value: `${(stats?.yoghurtSharePercent ?? 0).toLocaleString()}%`,
            colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Entries",
            value: String(stats?.totalEntries ?? 0),
            colorClass: "bg-muted/60 text-foreground",
          },
        ]}
      >
        {/* RECORD COUNT */}
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {data?.pagination?.total ?? 0} records
          </p>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[340px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border backdrop-blur-sm">
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Date
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Qty (L)
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))}
              {/* RENDERING DATA */}
              {!isLoading &&
                data?.records.map((r) => {
                  // IS THIS ENTRY A LEFTOVER ENTRY
                  const isLeftover = r.type === "leftover";
                  // RETURNING ROW
                  return (
                    <tr
                      key={r._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">{r.date}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-medium",
                            isLeftover
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                          )}
                        >
                          {isLeftover ? (
                            <Milk className="w-2.5 h-2.5" />
                          ) : (
                            <IceCream className="w-2.5 h-2.5" />
                          )}
                          {isLeftover ? "Leftover" : "Yoghurt"}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {r.quantity.toLocaleString()}L
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell truncate max-w-[160px]">
                        {r.note ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              {/* EMPTY STATE */}
              {!isLoading && data?.records.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-muted-foreground text-xs"
                  >
                    No milk log entries recorded for this period
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
MilkLogSection.displayName = "MilkLogSection";

// <== EXPORT ==>
export default MilkLogSection;
