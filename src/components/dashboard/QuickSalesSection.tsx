// <== IMPORTS ==>
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import type {
  DashboardProductFilter,
  DashboardQuickSalesStats,
} from "@/types/dashboard-types";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { memo, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardQuickSales } from "@/hooks/useDashboard";
import PaginationControls from "@/components/common/PaginationControls";

// <== QUICK SALES SECTION PROPS ==>
interface QuickSalesSectionProps {
  // <== STATS ==>
  stats: DashboardQuickSalesStats | undefined;
  // <== MONTH ==>
  month: string;
}

// <== QUICK SALES SECTION COMPONENT ==>
const QuickSalesSection = memo(({ stats, month }: QuickSalesSectionProps) => {
  // PRODUCT TYPE STATE
  const [productType, setProductType] = useState<DashboardProductFilter>("all");
  // PAGE NUMBER STATE
  const [page, setPage] = useState<number>(1);
  // PAGINATION LIMIT
  const limit = 5;
  // FETCH PAGINATED QUICK SALES
  const { data, isLoading } = useDashboardQuickSales(
    month,
    productType,
    page,
    limit,
  );
  // HANDLE PRODUCT TYPE CHANGE
  const handleProductTypeChange = useCallback((val: string): void => {
    // SET PRODUCT TYPE
    setProductType(val as DashboardProductFilter);
    // RESET PAGE
    setPage(1);
  }, []);
  // RETURNING QUICK SALES SECTION
  return (
    <DashboardSectionCard
      title="Quick Sales"
      icon={Zap}
      iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      chips={[
        {
          label: "Revenue",
          value: `₨${(stats?.totalRevenue ?? 0).toLocaleString()}`,
          colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
        {
          label: "Milk",
          value: `${(stats?.milkQty ?? 0).toLocaleString()}L`,
          colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          label: "Yoghurt",
          value: `${(stats?.yoghurtQty ?? 0).toLocaleString()}kg`,
          colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        },
        {
          label: "Transactions",
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
        <Select value={productType} onValueChange={handleProductTypeChange}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="milk">Milk Only</SelectItem>
            <SelectItem value="yoghurt">Yoghurt Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[360px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border backdrop-blur-sm">
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Type
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Qty
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                Rate
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Total
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-border/50">
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Skeleton className="h-4 w-14" />
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
              data?.records.map((r) => (
                <tr
                  key={r._id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px] uppercase font-bold tracking-wider",
                        r.type === "milk"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                      )}
                    >
                      {r.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {r.quantity.toLocaleString()}
                    {r.type === "milk" ? "L" : "kg"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                    ₨{r.rate.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    ₨{r.total.toLocaleString()}
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
                  colSpan={5}
                  className="px-3 py-8 text-center text-muted-foreground text-xs"
                >
                  No quick sales recorded this month
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
QuickSalesSection.displayName = "QuickSalesSection";

// <== EXPORT ==>
export default QuickSalesSection;
