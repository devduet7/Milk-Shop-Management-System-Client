// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Purchase } from "@/types/purchase-types";
import { Edit, Trash2, Milk, Calendar, Package } from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";

// <== PURCHASE LIST VIEW PROPS ==>
interface PurchaseListViewProps {
  // <== PAGINATED PURCHASE RECORDS ==>
  purchases: Purchase[];
  // <== TOTAL FILTERED COUNT ==>
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

// <== PURCHASE LIST VIEW COMPONENT ==>
const PurchaseListView = memo(
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
  }: PurchaseListViewProps) => {
    // RETURNING LIST VIEW
    return (
      // LIST CARD WRAPPER
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* LIST ITEMS */}
        <div className="divide-y divide-border/50">
          {/* LOADING SKELETONS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="p-3 sm:p-4 flex items-center gap-3"
              >
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-5 w-20 shrink-0 hidden sm:block" />
                <div className="flex gap-0.5 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH PURCHASES
            purchases.map((r, i) => (
              // LIST ITEM
              <motion.div
                key={r._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
              >
                {/* SUPPLIER AVATAR */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {r.supplier.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* MAIN INFO */}
                <div className="flex-1 min-w-0">
                  {/* SUPPLIER NAME */}
                  <p className="font-semibold text-sm truncate">{r.supplier}</p>
                  {/* MILK + DATE + NOTE */}
                  <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Milk className="w-3 h-3 shrink-0" />
                      {r.milkQuantity.toLocaleString()}L
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {r.date}
                    </span>
                    {r.note && (
                      <span className="hidden sm:block truncate max-w-[160px] md:max-w-[240px]">
                        {r.note}
                      </span>
                    )}
                  </div>
                </div>
                {/* TOTAL COST — HIDDEN ON VERY SMALL */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-display text-sm sm:text-base font-bold">
                    ₨{r.totalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₨{r.pricePerLiter.toLocaleString()}/L
                  </p>
                </div>
                {/* ACTION BUTTONS — ALWAYS VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
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
              </motion.div>
            ))}
        </div>
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
PurchaseListView.displayName = "PurchaseListView";

// <== EXPORT ==>
export default PurchaseListView;
