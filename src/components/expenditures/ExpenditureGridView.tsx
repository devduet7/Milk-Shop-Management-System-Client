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
  // <== AVATAR COLOR CLASS ==>
  avatarClass: string;
  // <== TOP BAR COLOR CLASS ==>
  topBar: string;
};

// <== CATEGORY CONFIG MAP ==>
const CATEGORY_CONFIG: Record<ExpenditureCategory, CategoryConfig> = {
  // SUPPLIES CATEGORY
  supplies: {
    label: "Supplies",
    icon: ShoppingBag,
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    avatarClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    topBar: "bg-blue-500",
  },
  // MEALS CATEGORY
  meals: {
    label: "Meals",
    icon: Receipt,
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    avatarClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    topBar: "bg-amber-500",
  },
  // TRANSPORT CATEGORY
  transport: {
    label: "Transport",
    icon: Wallet,
    color:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
    avatarClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    topBar: "bg-violet-500",
  },
  // MISCELLANEOUS CATEGORY
  misc: {
    label: "Misc",
    icon: Receipt,
    color:
      "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
    avatarClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    topBar: "bg-slate-400",
  },
};

// <== EXPENDITURE GRID VIEW PROPS ==>
interface ExpenditureGridViewProps {
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
  // <== ON DELETE HANDLER ==>
  onDelete: (record: Expenditure) => void;
}

// <== EXPENDITURE GRID VIEW COMPONENT ==>
const ExpenditureGridView = memo(
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
  }: ExpenditureGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* EXPENDITURE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card overflow-hidden">
                <div className="h-[3px] bg-muted/60" />
                <div className="p-4 space-y-4">
                  {/* SKELETON HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-11 h-11 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  {/* SKELETON NOTE */}
                  <Skeleton className="h-10 w-full rounded-lg" />
                  {/* SKELETON FOOTER */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-0.5">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOOPING THROUGH EXPENDITURES
            expenditures.map((r, i) => {
              // GET CATEGORY CONFIG FOR THIS RECORD
              const config =
                CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.misc;
              // CATEGORY ICON COMPONENT
              const CatIcon = config.icon;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden flex flex-col hover:shadow-md transition-all group"
                >
                  {/* CATEGORY TOP COLOR BAR */}
                  <div className={cn("h-[3px]", config.topBar)} />
                  {/* CARD BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between mb-3">
                      {/* CATEGORY ICON + TITLE + DATE */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0",
                            config.avatarClass,
                          )}
                        >
                          <CatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight truncate">
                            {r.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.date}
                          </p>
                        </div>
                      </div>
                      {/* CATEGORY BADGE */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0 ml-2",
                          config.color,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {/* NOTE (SHOWN ONLY WHEN PRESENT) */}
                    {r.note && (
                      <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {r.note}
                        </p>
                      </div>
                    )}
                    {/* CARD FOOTER */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 gap-2">
                      {/* AMOUNT */}
                      <span className="font-display text-lg sm:text-xl font-bold">
                        ₨{r.amount.toLocaleString()}
                      </span>
                      {/* ACTION BUTTONS — ALWAYS VISIBLE ON MOBILE, HOVER ON DESKTOP */}
                      <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        {/* EDIT */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => onEdit(r)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {/* DELETE */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(r)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && expenditures.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="w-5 h-5 text-muted-foreground/40" />
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
ExpenditureGridView.displayName = "ExpenditureGridView";

// <== EXPORT ==>
export default ExpenditureGridView;
