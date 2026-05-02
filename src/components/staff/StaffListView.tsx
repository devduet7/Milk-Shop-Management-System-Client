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

// <== STAFF TABLE VIEW PROPS ==>
interface StaffListViewProps {
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

// <== STAFF LIST VIEW COMPONENT ==>
const StaffListView = memo(
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
  }: StaffListViewProps) => {
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
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="shrink-0 hidden sm:block text-right space-y-1">
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOPPING THROUGH STAFF MEMBERS RECORDS
            records.map((r, i) => {
              // IS CLEARED FOR THIS BILLING MONTH
              const isCleared = r.monthRecord?.status === "cleared";
              // TOTAL EXTRA ALLOCATED WITH FALLBACK
              const totalExtra = r.monthRecord?.totalExtraAllocated ?? 0;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* STAFF AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* NAME + STATUS BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {r.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0",
                          isCleared
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                        )}
                      >
                        {isCleared
                          ? "CLEARED"
                          : `₨${r.salaryDue.toLocaleString()} DUE`}
                      </Badge>
                    </div>
                    {/* SALARY + EXTRA LINE */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>₨{r.monthlySalary.toLocaleString()} / mo</span>
                      {totalExtra > 0 && (
                        <button
                          onClick={() => onViewExtra(r)}
                          className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
                        >
                          +₨{totalExtra.toLocaleString()} extra
                        </button>
                      )}
                      {r.note && (
                        <span className="hidden sm:inline truncate max-w-[120px]">
                          {r.note}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* SALARY AMOUNT — HIDDEN ON SMALL */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-display text-sm font-bold">
                      ₨{r.monthlySalary.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      monthly salary
                    </p>
                  </div>
                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {/* PAY SALARY BUTTON */}
                    <Button
                      variant={isCleared ? "outline" : "default"}
                      size="sm"
                      className="h-8 w-8 p-0 sm:w-auto sm:px-2.5 sm:gap-1 text-xs"
                      onClick={() => onPaySalary(r)}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pay</span>
                    </Button>
                    {/* EXTRA ALLOCATION BUTTON */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onExtraAllocation(r)}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </Button>
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
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
StaffListView.displayName = "StaffListView";

// <== EXPORT ==>
export default StaffListView;
