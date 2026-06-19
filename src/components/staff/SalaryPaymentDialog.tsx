// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  paySalarySchema,
  type PaySalaryFormValues,
} from "@/validators/staffSchemas";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePaySalary } from "@/hooks/useStaff";
import { memo, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StaffMember } from "@/types/staff-types";

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== SALARY PAYMENT DIALOG PROPS ==>
interface SalaryPaymentDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== STAFF MEMBER RECORD ==>
  staff: StaffMember | null;
  // <== ACTIVE BILLING MONTH ==>
  month: string;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== SALARY PAYMENT DIALOG COMPONENT ==>
const SalaryPaymentDialog = memo(
  ({ open, staff, month, onClose }: SalaryPaymentDialogProps) => {
    // PAY SALARY MUTATION
    const payMutation = usePaySalary();
    // PENDING STATE
    const isPending = payMutation.isPending;
    // COMPUTED EXISTING PAID AMOUNT WITH FALLBACK
    const existingPaid = staff?.monthRecord?.paidAmount ?? 0;
    // COMPUTED REMAINING DUE
    const remaining = useMemo(() => {
      // GUARD: NO STAFF
      if (!staff) return 0;
      // CALCULATE REMAINING SALARY
      return parseFloat(
        Math.max(0, staff.monthlySalary - existingPaid).toFixed(2),
      );
    }, [staff, existingPaid]);
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<PaySalaryFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(paySalarySchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        amount: undefined as unknown as number,
        month,
      },
    });
    // RESET FORM WHEN DIALOG OPENS WITH A NEW STAFF MEMBER
    useEffect(() => {
      // IF OPEN AND STAFF EXISTS
      if (open && staff) {
        // RESET FORM WITH DEFAULT VALUES
        reset({
          amount: undefined as unknown as number,
          month,
        });
      }
    }, [open, staff, month, reset]);
    // WATCH AMOUNT FOR REACTIVE PENDING DISPLAY
    const watchedAmount = watch("amount");
    // COMPUTE NEW REMAINING REACTIVELY
    const newRemaining = useMemo(() => {
      // GUARD: NO STAFF
      if (!staff) return 0;
      // CALCULATE NEW REMAINING
      const paid = Number(watchedAmount) || 0;
      // RETURNING NEW REMAINING AFTER PAYMENT, ENSURING NOT NEGATIVE
      return parseFloat(
        Math.max(0, staff.monthlySalary - existingPaid - paid).toFixed(2),
      );
    }, [staff, existingPaid, watchedAmount]);
    // HANDLE PAY FULL SALARY BUTTON
    const handlePayFull = (): void => {
      // SET AMOUNT TO FULL REMAINING SALARY
      setValue("amount", remaining, { shouldValidate: true });
    };
    // FORM SUBMIT HANDLER
    const onSubmit = (data: PaySalaryFormValues): void => {
      // GUARD: NO STAFF
      if (!staff) return;
      // BUILDING PAYLOAD
      const payload = { amount: data.amount, month };
      // CALL PAY SALARY MUTATION
      payMutation.mutate(
        { staffId: staff._id, data: payload },
        { onSuccess: onClose },
      );
    };
    // RETURNING SALARY PAYMENT DIALOG
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
                      Salary Payment — {month}
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
                  {/* SALARY SUMMARY */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* MONTHLY SALARY */}
                    <div className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Salary
                      </p>
                      <p className="font-display text-sm font-bold">
                        ₨{staff.monthlySalary.toLocaleString()}
                      </p>
                    </div>
                    {/* ALREADY PAID */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Paid
                      </p>
                      <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₨{existingPaid.toLocaleString()}
                      </p>
                    </div>
                    {/* REMAINING DUE */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Remaining
                      </p>
                      <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                        ₨{remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* AMOUNT FIELD */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label
                        htmlFor="sp-amount"
                        className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        Payment Amount (₨)
                      </Label>
                      {/* PAY FULL SALARY SHORTCUT BUTTON */}
                      <button
                        type="button"
                        onClick={handlePayFull}
                        disabled={isPending || remaining === 0}
                        className="text-[11px] font-medium text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Pay Full (₨{remaining.toLocaleString()})
                      </button>
                    </div>
                    <Input
                      id="sp-amount"
                      type="number"
                      inputMode="numeric"
                      placeholder={`1 – ${remaining.toLocaleString()}`}
                      className={`h-10 ${NO_SPINNER}`}
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
                  {/* REACTIVE NEW REMAINING DISPLAY */}
                  <div
                    className={cn(
                      "rounded-xl px-4 py-3 flex items-center justify-between border",
                      newRemaining > 0
                        ? "bg-red-500/10 border-red-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20",
                    )}
                  >
                    <span className="text-xs text-muted-foreground font-medium">
                      After Payment
                    </span>
                    <span
                      className={cn(
                        "font-display font-bold text-sm",
                        newRemaining > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {newRemaining > 0
                        ? `₨${newRemaining.toLocaleString()} due`
                        : "Fully Cleared ✓"}
                    </span>
                  </div>
                  {/* HIDDEN MONTH FIELD */}
                  <input type="hidden" {...register("month")} value={month} />
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
                    disabled={isPending || remaining === 0}
                    className="h-9 px-4 gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Recording...
                      </>
                    ) : remaining === 0 ? (
                      "Already Cleared"
                    ) : (
                      "Record Payment"
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
SalaryPaymentDialog.displayName = "SalaryPaymentDialog";

// <== EXPORT ==>
export default SalaryPaymentDialog;
