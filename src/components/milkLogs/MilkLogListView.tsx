// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MilkLog } from "@/types/milk-log-types";
import { Edit, Trash2, Milk, IceCream } from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";

// <== MILK LOG LIST VIEW PROPS ==>
interface MilkLogListViewProps {
  // <== PAGINATED MILK LOG RECORDS ==>
  milkLogs: MilkLog[];
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
  // <== EDIT HANDLER ==>
  onEdit: (record: MilkLog) => void;
  // <== ON DELETE HANDLER ==>
  onDelete: (record: MilkLog) => void;
  // <== WHETHER THE CURRENT USER CAN EDIT RECORDS ==>
  canEdit: boolean;
  // <== WHETHER THE CURRENT USER CAN DELETE RECORDS ==>
  canDelete: boolean;
}

// <== MILK LOG LIST VIEW COMPONENT ==>
const MilkLogListView = memo(
  ({
    milkLogs,
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
    canEdit,
    canDelete,
  }: MilkLogListViewProps) => {
    // WHETHER THE ACTIONS AREA SHOULD RENDER AT ALL
    const hasActions = canEdit || canDelete;
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
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
                {/* ACTIONS SKELETON — OMITTED WHEN NO ROW ACTIONS ARE AVAILABLE */}
                {hasActions && (
                  <div className="flex gap-0.5 shrink-0">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                )}
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH MILK LOGS
            milkLogs.map((r, i) => {
              // IS THIS ENTRY A LEFTOVER ENTRY
              const isLeftover = r.type === "leftover";
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* TYPE ICON BADGE */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isLeftover ? "bg-blue-500/10" : "bg-purple-500/10",
                    )}
                  >
                    {isLeftover ? (
                      <Milk className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <IceCream className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* QUANTITY + TYPE */}
                    <p className="font-semibold text-sm truncate">
                      {r.quantity.toLocaleString()}L{" "}
                      {isLeftover ? "Leftover" : "for Yoghurt"}
                    </p>
                    {/* DATE + NOTE */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{r.date}</span>
                      {r.note && (
                        <span className="hidden sm:block truncate max-w-[160px] md:max-w-[240px]">
                          {r.note}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* ACTION BUTTONS — OMITTED ENTIRELY WHEN NO ROW ACTIONS ARE AVAILABLE */}
                  {hasActions && (
                    <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      {/* EDIT — HIDDEN WHEN USER LACKS EDIT PERMISSION */}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => onEdit(r)}
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
                          onClick={() => onDelete(r)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && milkLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Milk className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                No milk log entries found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add your first entry to get started
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
MilkLogListView.displayName = "MilkLogListView";

// <== EXPORT ==>
export default MilkLogListView;
