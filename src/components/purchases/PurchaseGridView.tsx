// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Purchase } from "@/types/purchase-types";
import { Edit, Trash2, Milk, Package } from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";

// <== PURCHASE GRID VIEW PROPS ==>
interface PurchaseGridViewProps {
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

// <== PURCHASE GRID VIEW COMPONENT ==>
const PurchaseGridView = memo(
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
  }: PurchaseGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* PURCHASE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card p-4 space-y-4">
                {/* SKELETON HEADER */}
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                {/* SKELETON MINI STATS */}
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                {/* SKELETON NOTE */}
                <Skeleton className="h-10 w-full rounded-lg" />
                {/* SKELETON FOOTER */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex gap-0.5">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOOPING THROUGH PURCHASES
            purchases.map((r, i) => (
              // GRID CARD
              <motion.div
                key={r._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex flex-col hover:shadow-md transition-all group relative"
              >
                {/* CARD HEADER */}
                <div className="flex items-center gap-3 mb-3">
                  {/* SUPPLIER AVATAR */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm sm:text-base font-bold text-primary">
                      {r.supplier.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* SUPPLIER NAME + DATE */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">
                      {r.supplier}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.date}
                    </p>
                  </div>
                </div>
                {/* MILK + PRICE PER LITER MINI STATS */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* MILK QUANTITY */}
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-1">
                      <Milk className="w-3 h-3" />
                      Milk
                    </p>
                    <p className="font-display text-base font-bold">
                      {r.milkQuantity.toLocaleString()}
                      <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                        L
                      </span>
                    </p>
                  </div>
                  {/* PRICE PER LITER */}
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Price / L
                    </p>
                    <p className="font-display text-base font-bold">
                      ₨{r.pricePerLiter.toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* NOTE (SHOWN ONLY WHEN PRESENT) */}
                {r.note && (
                  <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {r.note}
                    </p>
                  </div>
                )}
                {/* CARD FOOTER */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 gap-2">
                  {/* TOTAL COST */}
                  <span className="font-display text-lg sm:text-xl font-bold">
                    ₨{r.totalCost.toLocaleString()}
                  </span>
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
                </div>
              </motion.div>
            ))}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && purchases.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
          <div className="glass-card mt-0">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalFiltered={totalFiltered}
              startIndex={startIndex}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PurchaseGridView.displayName = "PurchaseGridView";

// <== EXPORT ==>
export default PurchaseGridView;
