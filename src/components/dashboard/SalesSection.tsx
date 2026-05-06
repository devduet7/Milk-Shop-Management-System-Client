// <== IMPORTS ==>
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import type {
  SaleType,
  ShopSalesStats,
  CustomerSalesStats,
} from "@/types/dashboard-types";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { memo, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSales } from "@/hooks/useDashboard";
import DashboardSectionCard from "./DashboardSectionCard";
import PaginationControls from "@/components/common/PaginationControls";

// <== SALES SECTION PROPS ==>
interface SalesSectionProps {
  // <== CUSTOMER SALES ==>
  customerSales: CustomerSalesStats | undefined;
  // <== SHOP SALES ==>
  shopSales: ShopSalesStats | undefined;
  // <== MONTH ==>
  month: string;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== SALES SECTION COMPONENT ==>
const SalesSection = memo(
  ({ customerSales, shopSales, month }: SalesSectionProps) => {
    // SALE TYPE FILTER STATE
    const [saleType, setSaleType] = useState<SaleType>("all");
    // PAGE NUMBER STATE
    const [page, setPage] = useState<number>(1);
    // PAGINATION LIMIT
    const limit = 5;
    // FETCH PAGINATED SALES
    const { data, isLoading: recordsLoading } = useDashboardSales(
      month,
      saleType,
      page,
      limit,
    );
    // TOTAL COMBINED AMOUNT
    const totalAmount =
      (customerSales?.totalAmount ?? 0) + (shopSales?.totalAmount ?? 0);
    // TOTAL COMBINED COUNT
    const totalCount = (customerSales?.count ?? 0) + (shopSales?.count ?? 0);
    // HANDLE FILTER CHANGE — RESET PAGE ON FILTER CHANGE
    const handleSaleTypeChange = useCallback((val: string): void => {
      // SET SALE TYPE
      setSaleType(val as SaleType);
      // RESET PAGE
      setPage(1);
    }, []);
    // RETURNING SALES SECTION
    return (
      <DashboardSectionCard
        title="Sales"
        icon={ShoppingCart}
        iconClass="bg-primary/10 text-primary"
        chips={[
          {
            label: "Total",
            value: `₨${totalAmount.toLocaleString()}`,
            colorClass: "bg-primary/10 text-primary",
          },
          {
            label: "Customer",
            value: `₨${(customerSales?.totalAmount ?? 0).toLocaleString()}`,
            colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          },
          {
            label: "Pending",
            value: `₨${(customerSales?.pendingAmount ?? 0).toLocaleString()}`,
            colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
          },
          {
            label: "Records",
            value: String(totalCount),
            colorClass: "bg-muted/60 text-foreground",
          },
        ]}
      >
        {/* FILTER ROW */}
        <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {data?.pagination?.total ?? 0} records
          </p>
          <Select value={saleType} onValueChange={handleSaleTypeChange}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales</SelectItem>
              <SelectItem value="customer">Customer Sales</SelectItem>
              <SelectItem value="shop">Shop Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Customer
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Product
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Total
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Paid
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {/* LOADING SKELETONS */}
              {recordsLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-2">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!recordsLoading &&
                // LOOP THROUGH SALES RECORDS
                data?.records.map((r) => {
                  // CALCULATE IS CLEARED
                  const isCleared = r.pendingAmount === 0;
                  // RETURN SALE ROW
                  return (
                    <tr
                      key={r._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] uppercase font-bold tracking-wider",
                            r.saleType === "customer"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-primary/15 text-primary border-primary/20",
                          )}
                        >
                          {r.saleType === "customer" ? "Cust" : "Shop"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell truncate max-w-[100px]">
                        {r.customerName ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] uppercase font-bold tracking-wider",
                            r.productType === "milk"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                          )}
                        >
                          {r.productType}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        ₨{r.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                        ₨{r.paidAmount.toLocaleString()}
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
                            ? "Paid"
                            : `₨${r.pendingAmount.toLocaleString()} Due`}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                        {r.date}
                      </td>
                    </tr>
                  );
                })}
              {/* EMPTY STATE */}
              {!recordsLoading && data?.records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-muted-foreground text-xs"
                  >
                    No sales recorded this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        {!recordsLoading && (data?.pagination?.total ?? 0) > 0 && (
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
SalesSection.displayName = "SalesSection";

// <== EXPORT ==>
export default SalesSection;
