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

// <== TRASH TABLE VIEW PROPS ==>
interface TrashTableViewProps {
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

// <== TRASH TABLE VIEW COMPONENT ==>
const TrashTableView = memo(
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
  }: TrashTableViewProps) => {
    // RETURNING TABLE VIEW
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Item
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Details
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Deleted By
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Purges In
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
                      <Skeleton className="h-4 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
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
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* ITEM: ICON + TITLE + CATEGORY BADGE */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              config.className,
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">
                              {getItemTitle(record)}
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] mt-0.5"
                            >
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      {/* DETAILS — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {getItemSubtitle(record)}
                      </td>
                      {/* DELETED BY — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {record.deletedBy?.fullName ?? "Unknown"}
                      </td>
                      {/* PURGES IN BADGE */}
                      <td className="px-3 py-3">
                        <Badge
                          variant={daysLeft <= 1 ? "destructive" : "secondary"}
                          className="text-xs whitespace-nowrap"
                        >
                          {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </Badge>
                      </td>
                      {/* ACTION BUTTONS */}
                      <td className="px-3 py-3">
                        <div className="flex gap-0.5">
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
TrashTableView.displayName = "TrashTableView";

// <== EXPORT ==>
export default TrashTableView;
