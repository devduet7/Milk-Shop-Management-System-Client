// <== IMPORTS ==>
import type {
  Expenditure,
  ExpenditureCategory,
} from "@/types/expenditure-types";
import {
  Edit,
  Trash2,
  Wallet,
  Receipt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// <== CATEGORY CONFIG TYPE ==>
type CategoryConfig = {
  // <== DISPLAY LABEL ==>
  label: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== TAILWIND COLOR CLASSES ==>
  color: string;
};

// <== CATEGORY CONFIG MAP ==>
const CATEGORY_CONFIG: Record<ExpenditureCategory, CategoryConfig> = {
  // SUPPLIES CATEGORY
  supplies: {
    label: "Supplies",
    icon: ShoppingBag,
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  // MEALS CATEGORY
  meals: {
    label: "Meals",
    icon: Receipt,
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  // TRANSPORT CATEGORY
  transport: {
    label: "Transport",
    icon: Wallet,
    color:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  // MISCELLANEOUS CATEGORY
  misc: {
    label: "Misc",
    icon: Receipt,
    color:
      "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

// <== EXPENDITURE TABLE VIEW PROPS ==>
interface ExpenditureTableViewProps {
  // <== PAGINATED EXPENDITURE RECORDS ==>
  expenditures: Expenditure[];
  // <== TOTAL FILTERED COUNT FOR PAGINATION ==>
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
  // <== EDIT EXPENDITURE HANDLER ==>
  onEdit: (expenditure: Expenditure) => void;
  // <== DELETE EXPENDITURE HANDLER ==>
  onDelete: (id: string) => void;
}

// <== EXPENDITURE TABLE VIEW COMPONENT ==>
const ExpenditureTableView = memo(
  ({
    expenditures,
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
  }: ExpenditureTableViewProps) => {
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
            {/* TABLE HEAD */}
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Title
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Category
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                  Date
                </th>
                <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Note
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
                      <Skeleton className="h-4 w-32 mb-1.5" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                // LOOPING THROUGH EXPENDITURES
                expenditures.map((r, i) => {
                  // GET CATEGORY CONFIG FOR THIS RECORD
                  const config =
                    CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.misc;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      {/* TITLE */}
                      <td className="px-3 py-3 font-medium text-sm">
                        {r.title}
                      </td>
                      {/* CATEGORY BADGE */}
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
                      {/* AMOUNT */}
                      <td className="px-3 py-3 font-semibold text-sm">
                        ₨{r.amount.toLocaleString()}
                      </td>
                      {/* DATE — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {r.date}
                      </td>
                      {/* NOTE — HIDDEN ON MEDIUM */}
                      <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                        {r.note ?? "—"}
                      </td>
                      {/* ACTION BUTTONS */}
                      <td className="px-3 py-3">
                        <div className="flex gap-0.5">
                          {/* EDIT */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(r)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {/* DELETE */}
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
                  );
                })}
            </tbody>
          </table>
          {/* EMPTY STATE WITH ICON */}
          {!isLoading && expenditures.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  No expenditures found
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add your first expenditure to get started
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
ExpenditureTableView.displayName = "ExpenditureTableView";

// <== EXPORT ==>
export default ExpenditureTableView;
