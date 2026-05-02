// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { StaffMember } from "@/types/staff-types";
import PaginationControls from "@/components/common/PaginationControls";
import { Edit, Trash2, Banknote, Users, PlusCircle } from "lucide-react";

// <== STAFF GRID VIEW PROPS ==>
interface StaffGridViewProps {
  // <== PAGINATED STAFF MEMBERS ==>
  records: StaffMember[];
  // <== TOTAL FILTERED COUNT (FOR PAGINATION) ==>
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
  // <== EDIT STAFF MEMBER HANDLER ==>
  onEdit: (record: StaffMember) => void;
  // <== DELETE STAFF MEMBER HANDLER ==>
  onDelete: (record: StaffMember) => void;
  // <== PAY SALARY HANDLER ==>
  onPaySalary: (record: StaffMember) => void;
  // <== EXTRA ALLOCATION HANDLER ==>
  onExtraAllocation: (record: StaffMember) => void;
  // <== VIEW EXTRA ALLOCATION HANDLER ==>
  onViewExtra: (record: StaffMember) => void;
}

// <== STAFF GRID VIEW COMPONENT ==>
const StaffGridView = memo(
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
    onEdit,
    onDelete,
    onPaySalary,
    onExtraAllocation,
    onViewExtra,
  }: StaffGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-28" />
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOPPING THROUGH STAFF MEMBERS RECORDS
            records.map((r, i) => {
              // IS CLEARED FOR THIS BILLING MONTH
              const isCleared = r.monthRecord?.status === "cleared";
              // PAID AMOUNT WITH FALLBACK
              const paidAmount = r.monthRecord?.paidAmount ?? 0;
              // TOTAL EXTRA ALLOCATED WITH FALLBACK
              const totalExtra = r.monthRecord?.totalExtraAllocated ?? 0;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex flex-col hover:shadow-md transition-all"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* STAFF AVATAR */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm sm:text-base font-bold text-primary">
                          {r.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* STAFF NAME + NOTE */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">
                          {r.name}
                        </h3>
                        {r.note && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {r.note}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* STATUS BADGE */}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase shrink-0 ml-2",
                        isCleared
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                      )}
                    >
                      {isCleared ? "CLEARED" : "PENDING"}
                    </Badge>
                  </div>
                  {/* SALARY + PAID MINI STATS */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Monthly Salary
                      </p>
                      <p className="font-display text-base font-bold">
                        ₨{r.monthlySalary.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Paid
                      </p>
                      <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                        ₨{paidAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* SALARY DUE BLOCK — SHOWN ONLY WHEN NOT CLEARED */}
                  {!isCleared && (
                    <div className="bg-red-500/10 rounded-lg p-2.5 mb-3 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Remaining Due
                      </p>
                      <p className="font-display text-base font-bold text-red-600 dark:text-red-400">
                        ₨{r.salaryDue.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {/* EXTRA ALLOCATED — CONDITIONALLY SHOWN */}
                  {totalExtra > 0 && (
                    <button
                      onClick={() => onViewExtra(r)}
                      className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-3 text-left hover:underline"
                    >
                      Extra allocated: ₨{totalExtra.toLocaleString()}
                    </button>
                  )}
                  {/* CARD FOOTER ACTIONS */}
                  <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-1.5">
                    {/* PAY SALARY BUTTON */}
                    <Button
                      variant={isCleared ? "outline" : "default"}
                      size="sm"
                      className="flex-1 h-9 text-xs gap-1.5"
                      onClick={() => onPaySalary(r)}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      {isCleared ? "Record Payment" : "Pay Salary"}
                    </Button>
                    {/* EXTRA ALLOCATION BUTTON */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => onExtraAllocation(r)}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </Button>
                    {/* EDIT BUTTON */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => onEdit(r)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {/* DELETE BUTTON */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => onDelete(r)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                No staff members found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add a staff member to get started
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
StaffGridView.displayName = "StaffGridView";

// <== EXPORT ==>
export default StaffGridView;
