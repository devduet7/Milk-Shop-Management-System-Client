// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addExtraAllocationSchema,
  type AddExtraAllocationFormValues,
} from "@/validators/staffSchemas";
import { Loader2 } from "lucide-react";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StaffMember } from "@/types/staff-types";
import { useAddExtraAllocation } from "@/hooks/useStaff";

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== EXTRA ALLOCATION DIALOG PROPS ==>
interface ExtraAllocationDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== STAFF MEMBER RECORD ==>
  staff: StaffMember | null;
  // <== ACTIVE BILLING MONTH ==>
  month: string;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== EXTRA ALLOCATION DIALOG COMPONENT ==>
const ExtraAllocationDialog = memo(
  ({ open, staff, month, onClose }: ExtraAllocationDialogProps) => {
    // ADD EXTRA ALLOCATION MUTATION
    const addMutation = useAddExtraAllocation();
    // PENDING STATE
    const isPending = addMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddExtraAllocationFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addExtraAllocationSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        amount: undefined as unknown as number,
        date: "",
        note: "",
      },
    });
    // RESET FORM WHEN DIALOG OPENS WITH A NEW STAFF MEMBER
    useEffect(() => {
      // IF OPEN AND STAFF EXISTS
      if (open && staff) {
        // RESET FORM WITH DEFAULT VALUES
        reset({
          amount: undefined as unknown as number,
          date: "",
          note: "",
        });
      }
    }, [open, staff, reset]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddExtraAllocationFormValues): void => {
      // GUARD: NO STAFF
      if (!staff) return;
      // BUILDING PAYLOAD
      const payload = { amount: data.amount, date: data.date, note: data.note };
      // CALL ADD EXTRA ALLOCATION MUTATION
      addMutation.mutate(
        { staffId: staff._id, month, data: payload },
        { onSuccess: onClose },
      );
    };
    // RETURNING EXTRA ALLOCATION DIALOG
    return (
      // DIALOG WRAPPER
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !isPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {staff && (
            <>
              {/* FIXED PRIMARY GRADIENT HEADER */}
              <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                <div className="flex items-start gap-3">
                  {/* STAFF AVATAR BADGE */}
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                    <span className="text-base font-bold text-primary">
                      {staff.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* TITLE AND DESCRIPTION */}
                  <div className="min-w-0 pt-0.5">
                    <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left truncate">
                      {staff.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                      Extra Allocation — {month}
                    </DialogDescription>
                  </div>
                </div>
              </div>
              {/* FORM — FLEX COLUMN TO SUPPORT FIXED FOOTER */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col flex-1 min-h-0"
              >
                {/* SCROLLABLE FORM BODY */}
                <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
                  {/* EXISTING EXTRA TOTAL SUMMARY */}
                  {(staff.monthRecord?.totalExtraAllocated ?? 0) > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Already Allocated This Month
                      </p>
                      <p className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">
                        ₨
                        {(
                          staff.monthRecord?.totalExtraAllocated ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {/* AMOUNT FIELD */}
                  <div>
                    <Label
                      htmlFor="ea-amount"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Amount (₨)
                    </Label>
                    <Input
                      id="ea-amount"
                      type="number"
                      inputMode="numeric"
                      placeholder="Enter amount"
                      className={`mt-1.5 h-10 ${NO_SPINNER}`}
                      disabled={isPending}
                      {...register("amount", { valueAsNumber: true })}
                    />
                    {/* AMOUNT VALIDATION ERROR */}
                    {errors.amount && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                  {/* DATE FIELD (OPTIONAL) */}
                  <div>
                    <Label
                      htmlFor="ea-date"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Date{" "}
                      <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                        (optional — defaults to today)
                      </span>
                    </Label>
                    <Input
                      id="ea-date"
                      placeholder="YYYY-MM-DD"
                      className="mt-1.5 h-10"
                      disabled={isPending}
                      {...register("date")}
                    />
                    {/* DATE VALIDATION ERROR */}
                    {errors.date && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                  {/* NOTE FIELD */}
                  <div>
                    <Label
                      htmlFor="ea-note"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Reason{" "}
                      <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="ea-note"
                      placeholder="e.g. Eid bonus, advance..."
                      className="mt-1.5 h-10"
                      disabled={isPending}
                      {...register("note")}
                    />
                    {/* NOTE VALIDATION ERROR */}
                    {errors.note && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.note.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* FIXED FOOTER */}
                <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
                  {/* CANCEL BUTTON */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    disabled={isPending}
                    className="h-9 px-4"
                  >
                    Cancel
                  </Button>
                  {/* SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="h-9 px-4 gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Allocating...
                      </>
                    ) : (
                      "Allocate Extra"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ExtraAllocationDialog.displayName = "ExtraAllocationDialog";

// <== EXPORT ==>
export default ExtraAllocationDialog;
