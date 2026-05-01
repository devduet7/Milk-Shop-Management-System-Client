// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  paySalarySchema,
  type PaySalaryFormValues,
} from "@/validators/staffSchemas";
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
                      Salary Payment — {month}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Record salary payment for {staff.name}
                </DialogDescription>
              </DialogHeader>
              {/* SALARY SUMMARY */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {/* MONTHLY SALARY */}
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Salary
                  </p>
                  <p className="font-display text-sm font-bold">
                    ₨{staff.monthlySalary.toLocaleString()}
                  </p>
                </div>
                {/* ALREADY PAID */}
                <div className="bg-emerald-500/10 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Paid
                  </p>
                  <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ₨{existingPaid.toLocaleString()}
                  </p>
                </div>
                {/* REMAINING DUE */}
                <div className="bg-red-500/10 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Remaining
                  </p>
                  <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                    ₨{remaining.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* FORM */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                {/* AMOUNT FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="sp-amount">Payment Amount (₨)</Label>
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
                    className={`${NO_SPINNER}`}
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
                  className={`rounded-lg px-3.5 py-2.5 flex items-center justify-between ${
                    newRemaining > 0 ? "bg-red-500/10" : "bg-emerald-500/10"
                  }`}
                >
                  <span className="text-sm text-muted-foreground">
                    After Payment
                  </span>
                  <span
                    className={`font-display font-bold text-sm ${
                      newRemaining > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {newRemaining > 0
                      ? `₨${newRemaining.toLocaleString()} due`
                      : "Fully Cleared ✓"}
                  </span>
                </div>
                {/* HIDDEN MONTH FIELD */}
                <input type="hidden" {...register("month")} value={month} />
                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending || remaining === 0}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : remaining === 0 ? (
                    "Salary Already Cleared"
                  ) : (
                    "Record Payment"
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
SalaryPaymentDialog.displayName = "SalaryPaymentDialog";

// <== EXPORT ==>
export default SalaryPaymentDialog;
