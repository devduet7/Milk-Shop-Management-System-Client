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
interface StaffTableViewProps {
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

// <== STAFF TABLE VIEW COMPONENT ==>
const StaffTableView = memo(
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
  }: StaffTableViewProps) => {
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
          <table className="w-full text-sm min-w-[640px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Staff Member
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Monthly Salary
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Paid
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Extra
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
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
                      <Skeleton className="h-4 w-24 mb-1.5" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-8 w-32 rounded-md" />
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOPING THROUGH STAFF MEMBERS RECORDS
                records.map((r, i) => {
                  // IS CLEARED FOR THIS BILLING MONTH
                  const isCleared = r.monthRecord?.status === "cleared";
                  // PAID AMOUNT WITH FALLBACK
                  const paidAmount = r.monthRecord?.paidAmount ?? 0;
                  // TOTAL EXTRA ALLOCATED WITH FALLBACK
                  const totalExtra = r.monthRecord?.totalExtraAllocated ?? 0;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* STAFF NAME + NOTE */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-sm">{r.name}</div>
                        {r.note && (
                          <div className="text-xs text-muted-foreground hidden md:block truncate max-w-[140px]">
                            {r.note}
                          </div>
                        )}
                      </td>
                      {/* MONTHLY SALARY — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm hidden sm:table-cell">
                        ₨{r.monthlySalary.toLocaleString()}
                      </td>
                      {/* STATUS BADGE */}
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
                            : `₨${r.salaryDue.toLocaleString()} DUE`}
                        </Badge>
                      </td>
                      {/* PAID AMOUNT — HIDDEN ON MEDIUM */}
                      <td className="px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400 hidden md:table-cell">
                        ₨{paidAmount.toLocaleString()}
                      </td>
                      {/* TOTAL EXTRA — HIDDEN ON MEDIUM */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        {totalExtra > 0 ? (
                          <button
                            onClick={() => onViewExtra(r)}
                            className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline"
                          >
                            ₨{totalExtra.toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      {/* ACTION BUTTONS */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* PAY SALARY BUTTON */}
                          <Button
                            variant={isCleared ? "outline" : "default"}
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => onPaySalary(r)}
                          >
                            <Banknote className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {isCleared ? "Paid" : "Pay"}
                            </span>
                          </Button>
                          {/* EXTRA ALLOCATION BUTTON */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => onExtraAllocation(r)}
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">Extra</span>
                          </Button>
                          {/* EDIT BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => onEdit(r)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {/* DELETE BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(r)}
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
          {/* EMPTY STATE */}
          {!isLoading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground/40" />
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
StaffTableView.displayName = "StaffTableView";

// <== EXPORT ==>
export default StaffTableView;
