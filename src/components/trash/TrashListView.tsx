// <== IMPORTS ==>
import {
  getItemTitle,
  getItemSubtitle,
  CATEGORY_CONFIG,
  getDaysUntilPurge,
} from "@/lib/trashUtils";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrashRecord } from "@/types/trash-types";
import PaginationControls from "../common/PaginationControls";

// <== TRASH LIST VIEW PROPS ==>
interface TrashListViewProps {
  // <== PAGINATED TRASH RECORDS ==>
  records: TrashRecord[];
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
  // <== RESTORE HANDLER ==>
  onRestore: (record: TrashRecord) => void;
  // <== DELETE HANDLER ==>
  onDelete: (record: TrashRecord) => void;
  // <== WHETHER A RESTORE OR DELETE MUTATION IS CURRENTLY PENDING ==>
  isMutating: boolean;
}

// <== TRASH LIST VIEW COMPONENT ==>
const TrashListView = memo(
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
    onRestore,
    onDelete,
    isMutating,
  }: TrashListViewProps) => {
    // RETURNING LIST VIEW
    return (
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
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-44" />
                </div>
                <div className="flex gap-1 shrink-0">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            records.map((record, i) => {
              // RESOLVING CATEGORY DISPLAY CONFIG
              const config = CATEGORY_CONFIG[record.entityType];
              // RESOLVING ICON COMPONENT
              const Icon = config.icon;
              // COMPUTING DAYS REMAINING UNTIL AUTO-PURGE
              const daysLeft = getDaysUntilPurge(record.expiresAt);
              // RETURNING LIST ROW
              return (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* CATEGORY ICON */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      config.className,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {getItemTitle(record)}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {getItemSubtitle(record)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      Deleted by {record.deletedBy?.fullName ?? "Unknown"} ·{" "}
                      {daysLeft === 0
                        ? "Purges today"
                        : `Purges in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  {/* ACTION BUTTONS */}
                  <div className="flex gap-1 shrink-0">
                    {/* RESTORE */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                      disabled={isMutating}
                      onClick={() => onRestore(record)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                    {/* PERMANENT DELETE */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isMutating}
                      onClick={() => onDelete(record)}
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
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Trash is empty
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Deleted records will appear here
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
TrashListView.displayName = "TrashListView";

// <== EXPORT ==>
export default TrashListView;
