// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit, ShoppingBag } from "lucide-react";
import type { QuickSale } from "@/types/quick-sale-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== TYPE BADGE HELPER COMPONENT ==>
const TypeBadge = ({ type }: { type: "milk" | "yoghurt" }) => (
  // RETURNING BADGE WITH DYNAMIC STYLES BASED ON TYPE
  <Badge
    variant="secondary"
    className={cn(
      "text-[10px] font-bold tracking-wider uppercase",
      type === "milk"
        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    )}
  >
    {type === "milk" ? "Milk" : "Yoghurt"}
  </Badge>
);

// <== QUICK SALE TABLE VIEW PROPS ==>
interface QuickSaleTableViewProps {
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

// <== QUICK SALE TABLE VIEW COMPONENT ==>
const QuickSaleTableView = memo(
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
  }: QuickSaleTableViewProps) => {
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
          <table className="w-full text-sm min-w-[480px]">
            {/* TABLE HEAD */}
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Type
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Quantity
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Rate
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Total
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
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
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOPING THROUGH QUICK SALES RECORDS
                records.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                  >
                    {/* TYPE BADGE */}
                    <td className="px-3 py-3">
                      <TypeBadge type={r.type} />
                    </td>
                    {/* QUANTITY */}
                    <td className="px-3 py-3 text-sm font-medium">
                      {r.quantity.toLocaleString()}
                      <span className="text-muted-foreground text-xs ml-0.5">
                        {r.type === "milk" ? "L" : "kg"}
                      </span>
                    </td>
                    {/* RATE — HIDDEN ON SMALL */}
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      ₨{r.rate.toLocaleString()}
                    </td>
                    {/* TOTAL */}
                    <td className="px-3 py-3 text-sm font-semibold">
                      ₨{r.total.toLocaleString()}
                    </td>
                    {/* DATE — HIDDEN ON SMALL */}
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {r.date}
                    </td>
                    {/* ACTION BUTTONS */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
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
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
          {/* EMPTY STATE */}
          {!isLoading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
QuickSaleTableView.displayName = "QuickSaleTableView";

// <== EXPORT ==>
export default QuickSaleTableView;
