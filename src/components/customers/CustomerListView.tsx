// <== IMPORTS ==>
import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "./PaginationControls";
import type { Customer } from "@/types/customer-types";
import { Eye, Edit, Trash2, Phone, Milk, MapPin, Users } from "lucide-react";

// <== CUSTOMER LIST VIEW PROPS ==>
interface CustomerListViewProps {
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

// <== CUSTOMER LIST VIEW COMPONENT ==>
const CustomerListView = memo(
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
  }: CustomerListViewProps) => {
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
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="shrink-0 hidden sm:block text-right space-y-1">
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH CUSTOMERS
            customers.map((c, i) => {
              // MONTHLY TOTAL FROM SERVER-COMPUTED STATS
              const monthlyTotal = c.monthlyStats.monthlyTotal;
              // PENDING FROM SERVER-COMPUTED STATS
              const pending = c.monthlyStats.pending;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {c.name.charAt(0)}
                    </span>
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* NAME + BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {c.name}
                      </span>
                      <Badge
                        variant={pending > 0 ? "destructive" : "secondary"}
                        className="text-[10px] shrink-0"
                      >
                        {pending > 0
                          ? `₨${pending.toLocaleString()} DUE`
                          : "PAID"}
                      </Badge>
                    </div>
                    {/* CONTACT + MILK + ADDRESS */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {c.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Milk className="w-3 h-3 shrink-0" />
                        {c.dailyMilk}L/day
                      </span>
                      {c.address && (
                        <span className="items-center gap-1 hidden sm:flex">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px] md:max-w-[200px]">
                            {c.address}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* MONTHLY TOTAL — HIDDEN ON VERY SMALL */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-display text-sm sm:text-base font-bold">
                      ₨{monthlyTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                  {/* ACTION BUTTONS — ALWAYS VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                  <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    {/* VIEW DETAILS */}
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
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
CustomerListView.displayName = "CustomerListView";

// <== EXPORT ==>
export default CustomerListView;
