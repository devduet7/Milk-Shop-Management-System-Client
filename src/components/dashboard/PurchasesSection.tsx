// <== IMPORTS ==>
import { memo, useState } from "react";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSectionCard from "./DashboardSectionCard";
import { useDashboardPurchases } from "@/hooks/useDashboard";
import type { DashboardPurchasesStats } from "@/types/dashboard-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== PURCHASES SECTION PROPS ==>
interface PurchasesSectionProps {
  // <== STATS ==>
  stats: DashboardPurchasesStats | undefined;
  // <== MONTH ==>
  month: string;
}

// <== PURCHASES SECTION COMPONENT ==>
const PurchasesSection = memo(({ stats, month }: PurchasesSectionProps) => {
  // PAGE NUMBER STATE
  const [page, setPage] = useState<number>(1);
  // PAGINATION LIMIT
  const limit = 5;
  // FETCH PAGINATED PURCHASES
  const { data, isLoading } = useDashboardPurchases(month, page, limit);
  // RETURNING PURCHASES SECTION
  return (
    <DashboardSectionCard
      title="Purchases"
      icon={Package}
      iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      chips={[
        {
          label: "Total Spent",
          value: `₨${(stats?.totalSpent ?? 0).toLocaleString()}`,
          colorClass:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Milk Qty",
          value: `${(stats?.totalMilkQty ?? 0).toLocaleString()}L`,
          colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          label: "Avg ₨/L",
          value: `₨${(stats?.avgCostPerLiter ?? 0).toLocaleString()}`,
          colorClass: "bg-muted/60 text-foreground",
        },
        {
          label: "Records",
          value: String(stats?.count ?? 0),
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
        <table className="w-full text-xs min-w-[380px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border backdrop-blur-sm">
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Supplier
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Qty (L)
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                ₨/L
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
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-3 py-2">
                    <Skeleton className="h-4 w-14" />
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Skeleton className="h-4 w-12" />
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
                  <td className="px-3 py-2 font-medium truncate max-w-[120px]">
                    {r.supplier}
                  </td>
                  <td className="px-3 py-2">
                    {r.milkQuantity.toLocaleString()}L
                  </td>
                  <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">
                    ₨{r.pricePerLiter.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    ₨{r.totalCost.toLocaleString()}
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
                  No purchases recorded this month
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
PurchasesSection.displayName = "PurchasesSection";

// <== EXPORT ==>
export default PurchasesSection;
