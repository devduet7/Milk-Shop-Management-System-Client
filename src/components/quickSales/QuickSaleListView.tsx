// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuickSale } from "@/types/quick-sale-types";
import PaginationControls from "@/components/common/PaginationControls";
import { Trash2, Edit, Milk, IceCream, ShoppingBag } from "lucide-react";

// <== QUICK SALE LIST VIEW PROPS ==>
interface QuickSaleListViewProps {
  // <== PAGINATED QUICK SALE RECORDS ==>
  records: QuickSale[];
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
  // <== DELETE HANDLER ==>
  onDelete: (id: string) => void;
  // <== EDIT HANDLER ==>
  onEdit: (record: QuickSale) => void;
}

// <== QUICK SALE LIST VIEW COMPONENT ==>
const QuickSaleListView = memo(
  ({
    records,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    onDelete,
    onEdit,
  }: QuickSaleListViewProps) => {
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
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="text-right shrink-0 hidden sm:block space-y-1">
                  <Skeleton className="h-5 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH QUICK SALES RECORDS
            records.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
              >
                {/* TYPE ICON AVATAR */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    r.type === "milk" ? "bg-blue-500/10" : "bg-purple-500/10",
                  )}
                >
                  {r.type === "milk" ? (
                    <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                {/* MAIN INFO */}
                <div className="flex-1 min-w-0">
                  {/* TYPE NAME + BADGE */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm capitalize">
                      {r.type}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase shrink-0",
                        r.type === "milk"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
                      )}
                    >
                      {r.type === "milk" ? "Milk" : "Yoghurt"}
                    </Badge>
                  </div>
                  {/* QUANTITY × RATE + DATE */}
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {r.quantity.toLocaleString()}
                      {r.type === "milk" ? "L" : "kg"} × ₨
                      {r.rate.toLocaleString()}
                    </span>
                    <span className="hidden sm:inline">{r.date}</span>
                  </div>
                </div>
                {/* TOTAL + DATE — HIDDEN ON VERY SMALL */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-display text-sm font-bold">
                    ₨{r.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {/* EDIT BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(r)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  {/* DELETE BUTTON */}
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
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                No sales found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Record a sale above to get started
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
QuickSaleListView.displayName = "QuickSaleListView";

// <== EXPORT ==>
export default QuickSaleListView;
