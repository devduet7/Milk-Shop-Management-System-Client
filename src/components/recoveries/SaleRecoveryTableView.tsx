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

// <== SALE RECOVERY TABLE VIEW PROPS ==>
interface SaleRecoveryTableViewProps {
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
  // <== WHETHER THE CURRENT USER CAN EDIT ==>
  canEdit: boolean;
}

// <== SALE RECOVERY TABLE VIEW COMPONENT ==>
const SaleRecoveryTableView = memo(
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
    canEdit,
  }: SaleRecoveryTableViewProps) => {
    // RETURNING THE TABLE VIEW
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Product
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Qty
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Total
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Paid
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Pending
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Date
                </th>
                {/* ACTION HEADER — OMITTED ENTIRELY WHEN USER CANNOT EDIT */}
                {canEdit && (
                  <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {/* LOADING SKELETON ROWS */}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    {/* ACTION SKELETON — OMITTED WHEN USER CANNOT EDIT */}
                    {canEdit && (
                      <td className="px-3 py-3">
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </td>
                    )}
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOPING THROUGH SALE RECOVERY
                records.map((r, i) => {
                  // GET PRODUCT CONFIG
                  const config = PRODUCT_CONFIG[r.productType];
                  // IS CLEARED
                  const isCleared = r.pendingAmount === 0;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* CUSTOMER NAME */}
                      <td className="px-3 py-3 font-medium text-sm">
                        {r.customerName}
                      </td>
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
                      {/* QUANTITY — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm hidden sm:table-cell">
                        {r.quantity.toLocaleString()}
                        {config.unit}
                      </td>
                      {/* TOTAL AMOUNT */}
                      <td className="px-3 py-3 text-sm font-semibold">
                        ₨{r.totalAmount.toLocaleString()}
                      </td>
                      {/* PAID AMOUNT — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                        ₨{r.paidAmount.toLocaleString()}
                      </td>
                      {/* PENDING BADGE */}
                      <td className="px-3 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold tracking-wider uppercase whitespace-nowrap",
                            isCleared
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                          )}
                        >
                          {isCleared
                            ? "CLEARED"
                            : `₨${r.pendingAmount.toLocaleString()} DUE`}
                        </Badge>
                      </td>
                      {/* DATE — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {r.date}
                      </td>
                      {/* ACTION BUTTON — OMITTED ENTIRELY WHEN USER CANNOT EDIT */}
                      {canEdit && (
                        <td className="px-3 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => onUpdatePayment(r)}
                          >
                            <Edit className="w-3 h-3" />
                            Update
                          </Button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
          {/* EMPTY STATE */}
          {!isLoading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
SaleRecoveryTableView.displayName = "SaleRecoveryTableView";

// <== EXPORT ==>
export default SaleRecoveryTableView;
