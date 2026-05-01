// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { memo } from "react";
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {/* DIALOG HEADER */}
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-3">
              {/* STAFF AVATAR */}
              {staff && (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">
                    {staff.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* STAFF NAME + MONTH */}
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">
                  {staff?.name ?? "Staff Member"}
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  Extra Allocations — {month}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Extra allocation history for {staff?.name}
            </DialogDescription>
          </DialogHeader>
          {/* LOADING STATE */}
          {isLoading && (
            <div className="space-y-3 mt-2">
              {/* TOTAL SKELETON */}
              <Skeleton className="h-12 w-full rounded-lg" />
              {/* ITEM SKELETONS */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50"
                >
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          )}
          {/* ERROR STATE */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center mt-2">
              <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Failed to load extra allocations.
              </p>
            </div>
          )}
          {/* DATA STATE */}
          {!isLoading && !isError && data && (
            <div className="mt-2 space-y-3">
              {/* TOTAL EXTRA ALLOCATED SUMMARY */}
              <div className="bg-amber-500/10 rounded-lg p-3 flex items-center justify-between">
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
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ExtraHistoryModal.displayName = "ExtraHistoryModal";

// <== EXPORT ==>
export default ExtraHistoryModal;
