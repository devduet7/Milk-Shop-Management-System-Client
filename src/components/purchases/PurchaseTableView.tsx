// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Package } from "lucide-react";
import type { Purchase } from "@/types/purchase-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== PURCHASE TABLE VIEW PROPS ==>
interface PurchaseTableViewProps {
  // <== PAGINATED PURCHASE RECORDS ==>
  purchases: Purchase[];
  // <== TOTAL FILTERED COUNT FOR PAGINATION ==>
  totalFiltered: number;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== CURRENT PAGE ==>
  currentPage: number;
  // <== ROWS PER PAGE ==>
  rowsPerPage: number;
  // <== START INDEX ==>
  startIndex: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== PAGE CHANGE HANDLER ==>
  onPageChange: (page: number) => void;
  // <== ROWS PER PAGE CHANGE HANDLER ==>
  onRowsPerPageChange: (value: string) => void;
  // <== EDIT PURCHASE HANDLER ==>
  onEdit: (purchase: Purchase) => void;
  // <== DELETE PURCHASE HANDLER ==>
  onDelete: (id: string) => void;
}

// <== PURCHASE TABLE VIEW COMPONENT ==>
const PurchaseTableView = memo(
  ({
    purchases,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete,
  }: PurchaseTableViewProps) => {
    // RETURNING TABLE VIEW
    return (
      // TABLE CARD WRAPPER
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            {/* TABLE HEAD */}
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Supplier
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Milk (L)
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Price / L
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Total Cost
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Note
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {/* LOADING SKELETON ROWS */}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-20 mb-1.5" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOP THROUGH PURCHASES
                purchases.map((r, i) => (
                  // TABLE ROW
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                  >
                    {/* SUPPLIER NAME */}
                    <td className="px-3 py-3 font-medium text-sm">
                      {r.supplier}
                    </td>
                    {/* MILK QUANTITY */}
                    <td className="px-3 py-3 text-sm">
                      {r.milkQuantity.toLocaleString()}L
                    </td>
                    {/* PRICE PER LITER — HIDDEN ON SMALL */}
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      ₨{r.pricePerLiter.toLocaleString()}
                    </td>
                    {/* TOTAL COST */}
                    <td className="px-3 py-3 text-sm font-semibold">
                      ₨{r.totalCost.toLocaleString()}
                    </td>
                    {/* DATE — HIDDEN ON SMALL */}
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {r.date}
                    </td>
                    {/* NOTE — HIDDEN ON MEDIUM */}
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                      {r.note ?? "—"}
                    </td>
                    {/* ACTION BUTTONS */}
                    <td className="px-3 py-3">
                      <div className="flex gap-0.5">
                        {/* EDIT */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(r)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {/* DELETE */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDelete(r._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
          {/* EMPTY STATE WITH ICON */}
          {!isLoading && purchases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  No purchases found
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first purchase to get started
                </p>
              </div>
            </div>
          )}
        </div>
        {/* PAGINATION */}
        {!isLoading && totalFiltered > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PurchaseTableView.displayName = "PurchaseTableView";

// <== EXPORT ==>
export default PurchaseTableView;
