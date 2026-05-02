// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {staff && (
            <>
              {/* DIALOG HEADER */}
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  {/* STAFF AVATAR */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-primary">
                      {staff.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* STAFF NAME + MONTH */}
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">
                      {staff.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-normal">
                      Extra Allocation — {month}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Allocate extra money to {staff.name}
                </DialogDescription>
              </DialogHeader>
              {/* EXISTING EXTRA TOTAL SUMMARY */}
              {(staff.monthRecord?.totalExtraAllocated ?? 0) > 0 && (
                <div className="bg-amber-500/10 rounded-lg p-2.5 text-center mt-1">
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
              {/* FORM */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                {/* AMOUNT FIELD */}
                <div>
                  <Label htmlFor="ea-amount">Amount (₨)</Label>
                  <Input
                    id="ea-amount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    className={`mt-1.5 ${NO_SPINNER}`}
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
                  <Label htmlFor="ea-date">
                    Date{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional — defaults to today)
                    </span>
                  </Label>
                  <Input
                    id="ea-date"
                    placeholder="YYYY-MM-DD"
                    className="mt-1.5"
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
                  <Label htmlFor="ea-note">
                    Reason{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="ea-note"
                    placeholder="e.g. Eid bonus, advance..."
                    className="mt-1.5"
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
                {/* SUBMIT BUTTON */}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    "Allocate Extra"
                  )}
                </Button>
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
