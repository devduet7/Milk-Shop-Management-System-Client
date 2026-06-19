// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExtraAllocations } from "@/hooks/useStaff";
import type { StaffMember } from "@/types/staff-types";
import { Loader2, Calendar, Banknote } from "lucide-react";

// <== EXTRA HISTORY MODAL PROPS ==>
interface ExtraHistoryModalProps {
  // <== MODAL OPEN STATE ==>
  open: boolean;
  // <== STAFF MEMBER RECORD ==>
  staff: StaffMember | null;
  // <== ACTIVE BILLING MONTH ==>
  month: string;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== EXTRA HISTORY MODAL COMPONENT ==>
const ExtraHistoryModal = memo(
  ({ open, staff, month, onClose }: ExtraHistoryModalProps) => {
    // LAZY-FETCH EXTRA ALLOCATIONS — ONLY WHEN MODAL IS OPEN AND STAFF EXISTS
    const { data, isLoading, isError } = useExtraAllocations(
      staff?._id ?? "",
      month,
      open && !!staff,
    );
    // RETURNING EXTRA HISTORY MODAL
    return (
      // DIALOG WRAPPER
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-lg max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* STAFF AVATAR BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <span className="text-base font-bold text-primary">
                  {(staff?.name ?? "S").charAt(0).toUpperCase()}
                </span>
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left truncate">
                  {staff?.name ?? "Staff Member"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  Extra Allocations — {month}
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* SCROLLABLE MODAL BODY */}
          <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-3">
            {/* LOADING STATE */}
            {isLoading && (
              <>
                {/* TOTAL SKELETON */}
                <Skeleton className="h-12 w-full rounded-xl" />
                {/* ITEM SKELETONS */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50"
                  >
                    <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </>
            )}
            {/* ERROR STATE */}
            {isError && !isLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Failed to load extra allocations.
                </p>
              </div>
            )}
            {/* DATA STATE */}
            {!isLoading && !isError && data && (
              <>
                {/* TOTAL EXTRA ALLOCATED SUMMARY */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Total Extra — {month}
                  </span>
                  <span className="font-display font-bold text-amber-600 dark:text-amber-400">
                    ₨{data.totalExtraAllocated.toLocaleString()}
                  </span>
                </div>
                {/* EMPTY STATE */}
                {data.allocations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground text-sm">
                        No extra allocations this month
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Use the Extra Allocation button to add one
                      </p>
                    </div>
                  </div>
                )}
                {/* ALLOCATIONS LIST */}
                {data.allocations.length > 0 && (
                  <div className="divide-y divide-border/50 rounded-lg border border-border/50 overflow-hidden">
                    {data.allocations.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                      >
                        {/* AMOUNT ICON */}
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Banknote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        {/* DATE + NOTE */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{a.date}</span>
                          </div>
                          {a.note && (
                            <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                              {a.note}
                            </p>
                          )}
                        </div>
                        {/* AMOUNT */}
                        <span className="font-display font-bold text-sm text-amber-600 dark:text-amber-400 shrink-0">
                          ₨{a.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {/* FIXED FOOTER */}
          <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ExtraHistoryModal.displayName = "ExtraHistoryModal";

// <== EXPORT ==>
export default ExtraHistoryModal;
