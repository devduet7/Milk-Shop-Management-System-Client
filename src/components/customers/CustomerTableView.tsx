// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/types/customer-types";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import PaginationControls from "../common/PaginationControls";

// <== CUSTOMER TABLE VIEW PROPS ==>
interface CustomerTableViewProps {
  // <== PAGINATED CUSTOMERS ==>
  customers: Customer[];
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
  // <== VIEW CUSTOMER HANDLER ==>
  onView: (customer: Customer) => void;
  // <== EDIT CUSTOMER HANDLER ==>
  onEdit: (customer: Customer) => void;
  // <== ON DELETE HANDLER ==>
  onDelete: (record: Customer) => void;
  // <== WHETHER THE CURRENT USER CAN EDIT RECORDS ==>
  canEdit: boolean;
  // <== WHETHER THE CURRENT USER CAN DELETE RECORDS ==>
  canDelete: boolean;
}

// <== CUSTOMER TABLE VIEW COMPONENT ==>
const CustomerTableView = memo(
  ({
    customers,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    onView,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
  }: CustomerTableViewProps) => {
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
          <table className="w-full text-sm min-w-[520px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Customer
                </th>
                {/* HIDDEN ON SMALL SCREENS */}
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Contact
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Daily Milk
                </th>
                {/* HIDDEN ON SMALL SCREENS */}
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">
                  Rate
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Monthly Due
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Paid
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Pending
                </th>
                {/* ACTIONS HEADER — ALWAYS RENDERED SINCE VIEW IS ALWAYS AVAILABLE */}
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
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-10" />
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOPING THROUGH CUSTOMERS
                customers.map((c, i) => {
                  // MONTHLY TOTAL FROM SERVER-COMPUTED STATS
                  const monthlyTotal = c.monthlyStats.monthlyTotal;
                  // PENDING AMOUNT FROM SERVER-COMPUTED STATS
                  const pending = c.monthlyStats.pending;
                  // PAID AMOUNT FROM SERVER-COMPUTED STATS
                  const paid = c.monthlyStats.totalPaid;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={c._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* CUSTOMER NAME + ADDRESS */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-sm">{c.name}</div>
                        {c.address && (
                          <div className="text-xs text-muted-foreground truncate max-w-[130px] hidden md:block mt-0.5">
                            {c.address}
                          </div>
                        )}
                      </td>
                      {/* PHONE — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {c.phone ?? "—"}
                      </td>
                      {/* DAILY MILK — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm hidden sm:table-cell">
                        {c.dailyMilk}L
                      </td>
                      {/* RATE — HIDDEN ON LARGE+ ONLY */}
                      <td className="px-3 py-3 text-sm hidden lg:table-cell">
                        ₨{c.pricePerLiter}/L
                      </td>
                      {/* MONTHLY DUE — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm font-semibold hidden sm:table-cell">
                        ₨{monthlyTotal.toLocaleString()}
                      </td>
                      {/* PAID — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400 hidden md:table-cell">
                        ₨{paid.toLocaleString()}
                      </td>
                      {/* PENDING BADGE */}
                      <td className="px-3 py-3">
                        <Badge
                          variant={pending > 0 ? "destructive" : "secondary"}
                          className="text-xs whitespace-nowrap"
                        >
                          ₨{pending.toLocaleString()}
                        </Badge>
                      </td>
                      {/* ACTION BUTTONS — VIEW IS ALWAYS AVAILABLE; EDIT/DELETE ARE PERMISSION-GATED */}
                      <td className="px-3 py-3">
                        <div className="flex gap-0.5">
                          {/* VIEW DETAILS — NEVER GATED, ANYONE WITH PAGE ACCESS CAN VIEW */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => onView(c)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {/* EDIT — HIDDEN WHEN USER LACKS EDIT PERMISSION */}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() => onEdit(c)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {/* DELETE — ADMIN-TIER ONLY, NEVER PART OF THE PERMISSION MATRIX */}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDelete(c)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
          {/* EMPTY STATE WITH ICON */}
          {!isLoading && customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  No customers found
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first customer to get started
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
CustomerTableView.displayName = "CustomerTableView";

// <== EXPORT ==>
export default CustomerTableView;
