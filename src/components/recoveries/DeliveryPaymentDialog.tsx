// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addDeliveryPaymentSchema,
  type AddDeliveryPaymentFormValues,
} from "@/validators/recoverySchemas";
import { memo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {customer && (
            <>
              {/* DIALOG HEADER */}
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  {/* CUSTOMER AVATAR */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-primary">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* CUSTOMER NAME */}
                  <span className="truncate">
                    Record Payment — {customer.name}
                  </span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Record a payment for {customer.name}
                </DialogDescription>
              </DialogHeader>
              {/* OUTSTANDING SUMMARY */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* MONTHLY PENDING */}
                <div className="bg-red-500/10 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    {customer.monthlyStats.month} Pending
                  </p>
                  <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                    ₨{customer.monthlyStats.pending.toLocaleString()}
                  </p>
                </div>
                {/* ALL-TIME OUTSTANDING */}
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    All-Time Outstanding
                  </p>
                  <p className="font-display text-sm font-bold">
                    ₨{customer.allTimeOutstanding.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* FORM */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                {/* BILLING MONTH FIELD */}
                <div>
                  <Label htmlFor="dp-billingMonth">
                    Billing Month (YYYY-MM)
                  </Label>
                  <Input
                    id="dp-billingMonth"
                    placeholder="e.g. 2026-04"
                    className="mt-1.5"
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
                  <Label htmlFor="dp-amount">Payment Amount (₨)</Label>
                  <Input
                    id="dp-amount"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    // HIDE NATIVE BROWSER SPINNER ARROWS
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
                {/* NOTE FIELD */}
                <div>
                  <Label htmlFor="dp-note">
                    Note{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="dp-note"
                    placeholder="Optional details"
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
                      Recording...
                    </>
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
DeliveryPaymentDialog.displayName = "DeliveryPaymentDialog";

// <== EXPORT ==>
export default DeliveryPaymentDialog;
