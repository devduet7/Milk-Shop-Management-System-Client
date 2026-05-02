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

// <== QUICK SALE GRID VIEW PROPS ==>
interface QuickSaleGridViewProps {
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

// <== QUICK SALE GRID VIEW COMPONENT ==>
const QuickSaleGridView = memo(
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
  }: QuickSaleGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-7 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOOPING THROUGH QUICK SALES RECORDS
            records.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex flex-col hover:shadow-md transition-all group"
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between mb-3">
                  {/* TYPE ICON */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      r.type === "milk" ? "bg-blue-500/10" : "bg-purple-500/10",
                    )}
                  >
                    {r.type === "milk" ? (
                      <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  {/* PRODUCT TYPE BADGE */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-bold tracking-wider uppercase",
                      r.type === "milk"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
                    )}
                  >
                    {r.type === "milk" ? "Milk" : "Yoghurt"}
                  </Badge>
                </div>
                {/* QUANTITY — PRIMARY DATA POINT */}
                <div className="flex-1 mb-3">
                  <p className="font-display text-2xl font-bold">
                    {r.quantity.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {r.type === "milk" ? "L" : "kg"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₨{r.rate.toLocaleString()} /{" "}
                    {r.type === "milk" ? "L" : "kg"}
                  </p>
                </div>
                {/* CARD FOOTER */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                    <p className="font-display text-base font-bold">
                      ₨{r.total.toLocaleString()}
                    </p>
                  </div>
                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                </div>
              </motion.div>
            ))}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
QuickSaleGridView.displayName = "QuickSaleGridView";

// <== EXPORT ==>
export default QuickSaleGridView;
