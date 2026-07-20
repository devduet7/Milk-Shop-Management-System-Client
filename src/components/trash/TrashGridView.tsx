// <== IMPORTS ==>
import {
  getItemTitle,
  getItemSubtitle,
  CATEGORY_CONFIG,
  getDaysUntilPurge,
} from "@/lib/trashUtils";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrashRecord } from "@/types/trash-types";
import PaginationControls from "../common/PaginationControls";

// <== TRASH GRID VIEW PROPS ==>
interface TrashGridViewProps {
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

// <== TRASH GRID VIEW COMPONENT ==>
const TrashGridView = memo(
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
  }: TrashGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* TRASH CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card overflow-hidden">
                <div className="h-[3px] bg-muted/60" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-3.5 w-full" />
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Skeleton className="h-3 w-20" />
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
            records.map((record, i) => {
              // RESOLVING CATEGORY DISPLAY CONFIG
              const config = CATEGORY_CONFIG[record.entityType];
              // RESOLVING ICON COMPONENT
              const Icon = config.icon;
              // COMPUTING DAYS REMAINING UNTIL AUTO-PURGE
              const daysLeft = getDaysUntilPurge(record.expiresAt);
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden flex flex-col hover:shadow-md transition-all group"
                >
                  {/* URGENCY COLOR BAR — RED IF PURGING SOON, AMBER OTHERWISE */}
                  <div
                    className={cn(
                      "h-[3px]",
                      daysLeft <= 1 ? "bg-destructive" : "bg-amber-500",
                    )}
                  />
                  {/* CARD BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* CARD HEADER */}
                    <div className="flex items-start justify-between mb-3">
                      {/* ICON + TITLE + SUBTITLE */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            config.className,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight truncate">
                            {getItemTitle(record)}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {getItemSubtitle(record)}
                          </p>
                        </div>
                      </div>
                      {/* CATEGORY BADGE */}
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0 ml-2"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {/* CARD FOOTER */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 gap-2">
                      {/* DELETED BY + PURGE COUNTDOWN */}
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          By {record.deletedBy?.fullName ?? "Unknown"}
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {daysLeft === 0
                            ? "Purges today"
                            : `Purges in ${daysLeft}d`}
                        </p>
                      </div>
                      {/* ACTION BUTTONS */}
                      <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                          disabled={isMutating}
                          onClick={() => onRestore(record)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
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
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
          <div className="glass-card mt-0">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalFiltered={totalFiltered}
              startIndex={startIndex}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              bordered={false}
            />
          </div>
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
TrashGridView.displayName = "TrashGridView";

// <== EXPORT ==>
export default TrashGridView;
