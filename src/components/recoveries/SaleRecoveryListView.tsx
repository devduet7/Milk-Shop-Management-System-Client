// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleProductType } from "@/types/sale-types";
import type { SaleRecovery } from "@/types/recovery-types";
import { Edit, Calendar, Milk, DollarSign } from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";

// <== PRODUCT CONFIG MAP ==>
const PRODUCT_CONFIG: Record<
  SaleProductType,
  { label: string; unit: string; color: string }
> = {
  milk: {
    label: "Milk",
    unit: "L",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  yoghurt: {
    label: "Yoghurt",
    unit: "kg",
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

// <== SALE RECOVERY LIST VIEW PROPS ==>
interface SaleRecoveryListViewProps {
  // <== PAGINATED SALE RECOVERY RECORDS ==>
  records: SaleRecovery[];
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
  // <== UPDATE PAYMENT HANDLER ==>
  onUpdatePayment: (record: SaleRecovery) => void;
}

// <== SALE RECOVERY LIST VIEW COMPONENT ==>
const SaleRecoveryListView = memo(
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
    onUpdatePayment,
  }: SaleRecoveryListViewProps) => {
    // RETURNING THE LIST VIEW
    return (
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="shrink-0 hidden sm:block text-right space-y-1">
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md shrink-0" />
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOPPING THROUGH SALE RECOVERY RECORDS
            records.map((r, i) => {
              // GET PRODUCT CONFIG
              const config = PRODUCT_CONFIG[r.productType];
              // IS CLEARED
              const isCleared = r.pendingAmount === 0;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* CUSTOMER AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(r.customerName ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* NAME + PRODUCT BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {r.customerName}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0",
                          config.color,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {/* QTY + DATE */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Milk className="w-3 h-3 shrink-0" />
                        {r.quantity.toLocaleString()}
                        {config.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {r.date}
                      </span>
                    </div>
                  </div>
                  {/* TOTAL + PENDING BADGE — HIDDEN ON VERY SMALL */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-display text-sm font-bold">
                      ₨{r.totalAmount.toLocaleString()}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase mt-0.5",
                        isCleared
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                      )}
                    >
                      {isCleared
                        ? "CLEARED"
                        : `₨${r.pendingAmount.toLocaleString()} DUE`}
                    </Badge>
                  </div>
                  {/* ACTION BUTTON */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 shrink-0"
                    onClick={() => onUpdatePayment(r)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden sm:inline">Update</span>
                  </Button>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                No sale recoveries found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Customer sales with pending payments will appear here
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
SaleRecoveryListView.displayName = "SaleRecoveryListView";

// <== EXPORT ==>
export default SaleRecoveryListView;
