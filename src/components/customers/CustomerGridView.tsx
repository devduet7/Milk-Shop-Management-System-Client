// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "./PaginationControls";
import type { Customer } from "@/types/customer-types";
import { Eye, Edit, Trash2, MapPin, Users } from "lucide-react";

// <== CUSTOMER GRID VIEW PROPS ==>
interface CustomerGridViewProps {
  // <== PAGINATED CUSTOMERS ==>
  customers: Customer[];
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
  // <== VIEW CUSTOMER HANDLER ==>
  onView: (customer: Customer) => void;
  // <== EDIT CUSTOMER HANDLER ==>
  onEdit: (customer: Customer) => void;
  // <== DELETE CUSTOMER HANDLER ==>
  onDelete: (id: string) => void;
}

// <== CUSTOMER GRID VIEW COMPONENT ==>
const CustomerGridView = memo(
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
  }: CustomerGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CUSTOMER CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card p-4 space-y-4">
                {/* SKELETON HEADER */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                {/* SKELETON MINI STATS */}
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                {/* SKELETON FINANCIAL ROWS */}
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
                {/* SKELETON FOOTER */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <Skeleton className="h-3 w-28" />
                  <div className="flex gap-0.5">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOOPING THROUGH CUSTOMERS
            customers.map((c, i) => {
              // MONTHLY TOTAL FROM SERVER-COMPUTED STATS
              const monthlyTotal = c.monthlyStats.monthlyTotal;
              // PENDING FROM SERVER-COMPUTED STATS
              const pending = c.monthlyStats.pending;
              // PAID FROM SERVER-COMPUTED STATS
              const paid = c.monthlyStats.totalPaid;
              // DELIVERED DAYS FROM SERVER-COMPUTED STATS
              const deliveredDays = c.monthlyStats.deliveredDays;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex flex-col hover:shadow-md transition-all group relative"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between mb-3">
                    {/* AVATAR + NAME */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm sm:text-base font-bold text-primary">
                          {c.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {c.phone ?? "No phone"}
                        </p>
                      </div>
                    </div>
                    {/* STATUS BADGE */}
                    <Badge
                      variant={pending > 0 ? "destructive" : "secondary"}
                      className="text-[10px] shrink-0 ml-2"
                    >
                      {pending > 0 ? "DUE" : "PAID"}
                    </Badge>
                  </div>
                  {/* DAILY + DELIVERED DAYS MINI STATS */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Daily
                      </p>
                      <p className="font-display text-base font-bold">
                        {c.dailyMilk}
                        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                          L
                        </span>
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Delivered
                      </p>
                      <p className="font-display text-base font-bold">
                        {deliveredDays}
                        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                          days
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* FINANCIAL SUMMARY */}
                  <div className="space-y-1.5 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Total Due
                      </span>
                      <span className="text-xs font-semibold">
                        ₨{monthlyTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Paid
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        ₨{paid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                      <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        ₨{pending.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* CARD FOOTER */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 gap-2">
                    {/* ADDRESS (TRUNCATED) */}
                    {c.address ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    {/* ACTION BUTTONS — ALWAYS VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                    <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      {/* VIEW */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(c)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {/* EDIT */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(c)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {/* DELETE */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(c._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && customers.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground/40" />
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
CustomerGridView.displayName = "CustomerGridView";

// <== EXPORT ==>
export default CustomerGridView;
