// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleProductType } from "@/types/sale-types";
import type { SaleRecovery } from "@/types/recovery-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== PRODUCT CONFIG MAP ==>
const PRODUCT_CONFIG: Record<
  SaleProductType,
  { label: string; unit: string; color: string; topBar: string }
> = {
  milk: {
    label: "Milk",
    unit: "L",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    topBar: "bg-blue-500",
  },
  yoghurt: {
    label: "Yoghurt",
    unit: "kg",
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    topBar: "bg-amber-500",
  },
};

// <== SALE RECOVERY GRID VIEW PROPS ==>
interface SaleRecoveryGridViewProps {
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

// <== SALE RECOVERY GRID VIEW COMPONENT ==>
const SaleRecoveryGridView = memo(
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
  }: SaleRecoveryGridViewProps) => {
    // RETURNING THE GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card overflow-hidden">
                <div className="h-[3px] bg-muted/60" />
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-11 h-11 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOOPING THROUGH SALE RECOVERY RECORDS
            records.map((r, i) => {
              // GET PRODUCT CONFIG
              const config = PRODUCT_CONFIG[r.productType];
              // IS CLEARED
              const isCleared = r.pendingAmount === 0;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden flex flex-col hover:shadow-md transition-all"
                >
                  {/* PRODUCT TYPE TOP COLOR BAR */}
                  <div className={cn("h-[3px]", config.topBar)} />
                  {/* CARD BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* CUSTOMER AVATAR */}
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm sm:text-base font-bold text-primary">
                            {(r.customerName ?? "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* CUSTOMER NAME + DATE */}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight truncate">
                            {r.customerName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.date}
                          </p>
                        </div>
                      </div>
                      {/* PRODUCT BADGE */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0 ml-2",
                          config.color,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {/* QTY + PRICE MINI STATS */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Quantity
                        </p>
                        <p className="font-display text-base font-bold">
                          {r.quantity.toLocaleString()}
                          <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                            {config.unit}
                          </span>
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Price / {config.unit}
                        </p>
                        <p className="font-display text-base font-bold">
                          ₨{r.pricePerUnit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {/* PAYMENT SUMMARY */}
                    <div className="space-y-1.5 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Total
                        </span>
                        <span className="text-xs font-semibold">
                          ₨{r.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Paid
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          ₨{r.paidAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* CARD FOOTER */}
                    <div className="mt-auto pt-3 border-t border-border/50 space-y-3">
                      {/* PENDING STATUS BADGE */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase w-full justify-center py-1",
                          isCleared
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                        )}
                      >
                        {isCleared
                          ? "FULLY CLEARED"
                          : `₨${r.pendingAmount.toLocaleString()} PENDING`}
                      </Badge>
                      {/* ACTION BUTTON */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 text-xs gap-1.5"
                        onClick={() => onUpdatePayment(r)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Update Payment
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-muted-foreground/40" />
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
SaleRecoveryGridView.displayName = "SaleRecoveryGridView";

// <== EXPORT ==>
export default SaleRecoveryGridView;
