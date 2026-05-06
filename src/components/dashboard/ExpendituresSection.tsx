// <== IMPORTS ==>
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import type {
  DashboardCategoryFilter,
  DashboardExpendituresStats,
} from "@/types/dashboard-types";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { memo, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardExpenditures } from "@/hooks/useDashboard";
import PaginationControls from "@/components/common/PaginationControls";

// <== CATEGORY BADGE COLOR MAP ==>
const CATEGORY_COLORS: Record<string, string> = {
  // SUPPLIES CATEGORY
  supplies: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  // MEALS CATEGORY
  meals: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  // TRANSPORT CATEGORY
  transport: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  // MISCELLANEOUS CATEGORY
  misc: "bg-muted/60 text-muted-foreground",
};

// <== EXPENDITURES SECTION PROPS ==>
interface ExpendituresSectionProps {
  // <== STATS ==>
  stats: DashboardExpendituresStats | undefined;
  // <== MONTH ==>
  month: string;
}

// <== EXPENDITURES SECTION COMPONENT ==>
const ExpendituresSection = memo(
  ({ stats, month }: ExpendituresSectionProps) => {
    // CATEGORY STATE
    const [category, setCategory] = useState<DashboardCategoryFilter>("all");
    // PAGE NUMBER STATE
    const [page, setPage] = useState<number>(1);
    // PAGINATION LIMIT
    const limit = 5;
    // FETCH PAGINATED EXPENDITURES
    const { data, isLoading } = useDashboardExpenditures(
      month,
      category,
      page,
      limit,
    );
    // HANDLE CATEGORY CHANGE
    const handleCategoryChange = useCallback((val: string): void => {
      // SET CATEGORY
      setCategory(val as DashboardCategoryFilter);
      // RESET PAGE
      setPage(1);
    }, []);
    // RETURNING EXPENDITURES SECTION
    return (
      <DashboardSectionCard
        title="Expenditures"
        icon={Wallet}
        iconClass="bg-red-500/10 text-red-600 dark:text-red-400"
        chips={[
          {
            label: "Total",
            value: `₨${(stats?.totalAmount ?? 0).toLocaleString()}`,
            colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
          },
          {
            label: "Supplies",
            value: `₨${(stats?.byCategory?.supplies ?? 0).toLocaleString()}`,
            colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Transport",
            value: `₨${(stats?.byCategory?.transport ?? 0).toLocaleString()}`,
            colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
          },
          {
            label: "Records",
            value: String(stats?.count ?? 0),
            colorClass: "bg-muted/60 text-foreground",
          },
        ]}
      >
        {/* FILTER ROW */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {data?.pagination?.total ?? 0} records
          </p>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="meals">Meals</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="misc">Misc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Title
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Date
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
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))}
              {/* RENDERING DATA */}
              {!isLoading &&
                // LOOPING THROUGH EXPENDITURES RECORDS
                data?.records.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium truncate max-w-[140px]">
                      {r.title}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] uppercase font-bold tracking-wider",
                          CATEGORY_COLORS[r.category],
                        )}
                      >
                        {r.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-semibold text-red-600 dark:text-red-400">
                      ₨{r.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                      {r.date}
                    </td>
                  </tr>
                ))}
              {/* EMPTY STATE */}
              {!isLoading && data?.records.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-muted-foreground text-xs"
                  >
                    No expenditures recorded this month
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
ExpendituresSection.displayName = "ExpendituresSection";

// <== EXPORT ==>
export default ExpendituresSection;
