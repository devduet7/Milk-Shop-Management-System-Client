// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
import type { Sale, SaleProductType } from "@/types/sale-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== PRODUCT CONFIG MAP ==>
const PRODUCT_CONFIG: Record<
  SaleProductType,
  { label: string; unit: string; color: string }
> = {
  // MILK PRODUCT CONFIG
  milk: {
    label: "Milk",
    unit: "L",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  // YOGHURT PRODUCT CONFIG
  yoghurt: {
    label: "Yoghurt",
    unit: "kg",
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

// <== SHOP SALE TABLE VIEW PROPS ==>
interface ShopSaleTableViewProps {
  // <== PAGINATED SHOP SALE RECORDS ==>
  sales: Sale[];
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
  // <== EDIT SALE HANDLER ==>
  onEdit: (sale: Sale) => void;
  // <== DELETE SALE HANDLER ==>
  onDelete: (id: string) => void;
}

// <== SHOP SALE TABLE VIEW COMPONENT ==>
const ShopSaleTableView = memo(
  ({
    sales,
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
  }: ShopSaleTableViewProps) => {
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
          <table className="w-full text-sm min-w-[400px]">
            {/* TABLE HEAD */}
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Product
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Price / Unit
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Total
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
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
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
                // LOOPING THROUGH SALES
                sales.map((r, i) => {
                  // GET PRODUCT CONFIG FOR THIS RECORD
                  const config = PRODUCT_CONFIG[r.productType];
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      {/* PRODUCT BADGE */}
                      <td className="px-3 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold tracking-wider uppercase",
                            config.color,
                          )}
                        >
                          {config.label}
                        </Badge>
                      </td>
                      {/* QUANTITY */}
                      <td className="px-3 py-3 text-sm">
                        {r.quantity.toLocaleString()}
                        {config.unit}
                      </td>
                      {/* PRICE PER UNIT — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        ₨{r.pricePerUnit.toLocaleString()}
                      </td>
                      {/* TOTAL AMOUNT */}
                      <td className="px-3 py-3 text-sm font-semibold">
                        ₨{r.totalAmount.toLocaleString()}
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
                  );
                })}
            </tbody>
          </table>
          {/* EMPTY STATE WITH ICON */}
          {!isLoading && sales.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  No shop sales found
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add today's shop sales to get started
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
ShopSaleTableView.displayName = "ShopSaleTableView";

// <== EXPORT ==>
export default ShopSaleTableView;
