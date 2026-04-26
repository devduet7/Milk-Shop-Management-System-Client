// <== IMPORTS ==>
import {
  Edit,
  Trash2,
  Wallet,
  Receipt,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import type {
  Expenditure,
  ExpenditureCategory,
} from "@/types/expenditure-types";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PaginationControls from "@/components/common/PaginationControls";

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

// <== EXPENDITURE LIST VIEW PROPS ==>
interface ExpenditureListViewProps {
  // <== PAGINATED EXPENDITURE RECORDS ==>
  expenditures: Expenditure[];
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
  // <== EDIT EXPENDITURE HANDLER ==>
  onEdit: (expenditure: Expenditure) => void;
  // <== DELETE EXPENDITURE HANDLER ==>
  onDelete: (id: string) => void;
}

// <== EXPENDITURE LIST VIEW COMPONENT ==>
const ExpenditureListView = memo(
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
  }: ExpenditureListViewProps) => {
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
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-20 shrink-0" />
                <div className="flex gap-0.5 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH EXPENDITURES
            expenditures.map((r, i) => {
              // GET CATEGORY CONFIG FOR THIS RECORD
              const config =
                CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.misc;
              // CATEGORY ICON COMPONENT
              const CatIcon = config.icon;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* CATEGORY ICON AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CatIcon className="w-4 h-4 text-primary" />
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* TITLE + BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {r.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0",
                          config.color,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {/* DATE AND NOTE */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{r.date}</span>
                      {r.note && (
                        <span className="hidden sm:block truncate max-w-[160px] md:max-w-[240px]">
                          {r.note}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* AMOUNT — HIDDEN ON VERY SMALL */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-display text-sm sm:text-base font-bold">
                      ₨{r.amount.toLocaleString()}
                    </p>
                  </div>
                  {/* ACTION BUTTONS — ALWAYS VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                  <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
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
                </motion.div>
              );
            })}
        </div>
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
ExpenditureListView.displayName = "ExpenditureListView";

// <== EXPORT ==>
export default ExpenditureListView;
