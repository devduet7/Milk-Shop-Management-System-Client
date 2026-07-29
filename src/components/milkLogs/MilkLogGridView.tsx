// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MilkLog } from "@/types/milk-log-types";
import { Edit, Trash2, Milk, IceCream } from "lucide-react";
import PaginationControls from "@/components/common/PaginationControls";

// <== MILK LOG GRID VIEW PROPS ==>
interface MilkLogGridViewProps {
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

// <== MILK LOG GRID VIEW COMPONENT ==>
const MilkLogGridView = memo(
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
  }: MilkLogGridViewProps) => {
    // WHETHER THE ACTIONS AREA SHOULD RENDER AT ALL
    const hasActions = canEdit || canDelete;
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* MILK LOG CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card overflow-hidden">
                <div className="h-[3px] bg-muted/60" />
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 rounded-lg" />
                  <div className="flex items-center justify-end pt-1 border-t border-border/50">
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
            // LOOPING THROUGH MILK LOGS
            milkLogs.map((r, i) => {
              // IS THIS ENTRY A LEFTOVER ENTRY
              const isLeftover = r.type === "leftover";
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden flex flex-col hover:shadow-md transition-all group"
                >
                  {/* TOP COLOR BAR — MATCHES ENTRY TYPE */}
                  <div
                    className={cn(
                      "h-[3px]",
                      isLeftover ? "bg-blue-500" : "bg-purple-500",
                    )}
                  />
                  {/* CARD BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* CARD HEADER */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* TYPE ICON BADGE */}
                      <div
                        className={cn(
                          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0",
                          isLeftover ? "bg-blue-500/10" : "bg-purple-500/10",
                        )}
                      >
                        {isLeftover ? (
                          <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      {/* TYPE LABEL + DATE */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">
                          {isLeftover ? "Leftover" : "Used for Yoghurt"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.date}
                        </p>
                      </div>
                    </div>
                    {/* QUANTITY */}
                    <div className="bg-muted/50 rounded-lg p-2.5 mb-3 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Quantity
                      </p>
                      <p className="font-display text-xl font-bold">
                        {r.quantity.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          L
                        </span>
                      </p>
                    </div>
                    {/* NOTE (SHOWN ONLY WHEN PRESENT) */}
                    {r.note && (
                      <div className="bg-muted/50 rounded-lg p-2.5 mb-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {r.note}
                        </p>
                      </div>
                    )}
                    {/* CARD FOOTER — ACTIONS ONLY */}
                    {hasActions && (
                      <div className="flex items-center justify-end mt-auto pt-3 border-t border-border/50 gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE WITH ICON */}
        {!isLoading && milkLogs.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
MilkLogGridView.displayName = "MilkLogGridView";

// <== EXPORT ==>
export default MilkLogGridView;
