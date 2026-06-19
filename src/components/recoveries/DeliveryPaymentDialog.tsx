// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addDeliveryPaymentSchema,
  type AddDeliveryPaymentFormValues,
} from "@/validators/recoverySchemas";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddDeliveryPayment } from "@/hooks/useRecoveries";
import type { DeliveryRecovery } from "@/types/recovery-types";

// <== DELIVERY PAYMENT DIALOG PROPS ==>
interface DeliveryPaymentDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== CUSTOMER DELIVERY RECOVERY RECORD ==>
  customer: DeliveryRecovery | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== DELIVERY PAYMENT DIALOG COMPONENT ==>
const DeliveryPaymentDialog = memo(
  ({ open, customer, onClose }: DeliveryPaymentDialogProps) => {
    // ADD DELIVERY PAYMENT MUTATION
    const addPaymentMutation = useAddDeliveryPayment();
    // PENDING STATE
    const isPending = addPaymentMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddDeliveryPaymentFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addDeliveryPaymentSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        amount: undefined as unknown as number,
        billingMonth: "",
        paymentDate: "",
        note: "",
      },
    });
    // RESET FORM WHEN DIALOG OPENS WITH A NEW CUSTOMER
    useEffect(() => {
      // IF OPEN AND CUSTOMER EXISTS
      if (open && customer) {
        // RESET FORM WITH DEFAULT VALUES
        reset({
          amount: undefined as unknown as number,
          billingMonth: customer.monthlyStats.month,
          paymentDate: "",
          note: "",
        });
      }
    }, [open, customer, reset]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddDeliveryPaymentFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        amount: data.amount,
        billingMonth: data.billingMonth,
        paymentDate: data.paymentDate,
        note: data.note,
      } satisfies AddDeliveryPaymentFormValues;
      // GUARD: NO CUSTOMER
      if (!customer) return;
      // CALL ADD DELIVERY PAYMENT MUTATION
      addPaymentMutation.mutate(
        { customerId: customer._id, data: payload },
        // CLOSE DIALOG ON SUCCESS
        { onSuccess: onClose },
      );
    };
    // RETURNING DELIVERY PAYMENT DIALOG
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
          {customer && (
            <>
              {/* FIXED PRIMARY GRADIENT HEADER */}
              <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                <div className="flex items-start gap-3">
                  {/* CUSTOMER AVATAR BADGE */}
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                    <span className="text-base font-bold text-primary">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* TITLE AND DESCRIPTION */}
                  <div className="min-w-0 pt-0.5">
                    <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                      Record Payment
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left truncate">
                      {customer.name}
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
                  {/* OUTSTANDING SUMMARY */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* MONTHLY PENDING */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        {customer.monthlyStats.month} Pending
                      </p>
                      <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                        ₨{customer.monthlyStats.pending.toLocaleString()}
                      </p>
                    </div>
                    {/* ALL-TIME OUTSTANDING */}
                    <div className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        All-Time Outstanding
                      </p>
                      <p className="font-display text-sm font-bold">
                        ₨{customer.allTimeOutstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* BILLING MONTH FIELD */}
                  <div>
                    <Label
                      htmlFor="dp-billingMonth"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Billing Month (YYYY-MM)
                    </Label>
                    <Input
                      id="dp-billingMonth"
                      placeholder="e.g. 2026-04"
                      className="mt-1.5 h-10"
                      disabled={isPending}
                      {...register("billingMonth")}
                    />
                    {/* BILLING MONTH VALIDATION ERROR */}
                    {errors.billingMonth && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.billingMonth.message}
                      </p>
                    )}
                  </div>
                  {/* PAYMENT AMOUNT FIELD */}
                  <div>
                    <Label
                      htmlFor="dp-amount"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Payment Amount (₨)
                    </Label>
                    <Input
                      id="dp-amount"
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
                  {/* NOTE FIELD */}
                  <div>
                    <Label
                      htmlFor="dp-note"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Note{" "}
                      <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="dp-note"
                      placeholder="Optional details"
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
                        Recording...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Record Payment
                      </>
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
DeliveryPaymentDialog.displayName = "DeliveryPaymentDialog";

// <== EXPORT ==>
export default DeliveryPaymentDialog;
