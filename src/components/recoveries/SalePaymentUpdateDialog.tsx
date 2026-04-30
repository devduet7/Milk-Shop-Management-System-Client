// <== IMPORTS ==>
import {
  useDeleteSaleRecord,
  useUpdateSalePayment,
} from "@/hooks/useRecoveries";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  updateSalePaymentSchema,
  type UpdateSalePaymentFormValues,
} from "@/validators/recoverySchemas";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SaleRecovery } from "@/types/recovery-types";

// <== SALE PAYMENT UPDATE DIALOG PROPS ==>
interface SalePaymentUpdateDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== SALE RECOVERY RECORD ==>
  sale: SaleRecovery | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== SALE PAYMENT UPDATE DIALOG COMPONENT ==>
const SalePaymentUpdateDialog = memo(
  ({ open, sale, onClose }: SalePaymentUpdateDialogProps) => {
    // UPDATE SALE PAYMENT MUTATION
    const updateMutation = useUpdateSalePayment();
    // DELETE SALE RECORD MUTATION
    const deleteMutation = useDeleteSaleRecord();
    // COMBINED PENDING STATE
    const isPending = updateMutation.isPending || deleteMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm<UpdateSalePaymentFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(updateSalePaymentSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        paidAmount: 0,
      },
    });
    // RESET FORM WHEN DIALOG OPENS WITH A NEW SALE
    useEffect(() => {
      // IF OPEN AND SALE EXISTS
      if (open && sale) {
        // RESET FORM WITH DEFAULT VALUES
        reset({ paidAmount: sale.paidAmount });
      }
    }, [open, sale, reset]);
    // WATCH PAID AMOUNT FOR REACTIVE PENDING COMPUTATION
    const watchedPaidAmount = watch("paidAmount");
    // COMPUTE PENDING REACTIVELY FROM TOTAL AMOUNT - PAID AMOUNT
    const computedPending = useMemo(() => {
      // GUARD: NO SALE
      if (!sale) return 0;
      // CALCULATE PENDING AMOUNT
      const paid = Number(watchedPaidAmount) || 0;
      // RETURN PENDING AMOUNT
      return parseFloat(Math.max(0, sale.totalAmount - paid).toFixed(2));
    }, [sale, watchedPaidAmount]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: UpdateSalePaymentFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        paidAmount: data.paidAmount,
      } satisfies UpdateSalePaymentFormValues;
      // GUARD: NO SALE
      if (!sale) return;
      // CALL UPDATE SALE PAYMENT MUTATION
      updateMutation.mutate(
        { saleId: sale._id, data: payload },
        // CLOSE DIALOG ON SUCCESS
        { onSuccess: onClose },
      );
    };
    // HANDLE DELETE SALE RECORD
    const handleDelete = (): void => {
      // GUARD: NO SALE
      if (!sale) return;
      // CALL DELETE SALE RECORD MUTATION
      deleteMutation.mutate(sale._id, { onSuccess: onClose });
    };
    // RETURNING SALE PAYMENT UPDATE DIALOG
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
          {sale && (
            <>
              {/* DIALOG HEADER */}
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  {/* CUSTOMER AVATAR */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-primary">
                      {(sale.customerName ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* CUSTOMER NAME + DATE */}
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">
                      {sale.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground font-normal">
                      {sale.productType === "milk" ? "Milk" : "Yoghurt"} •{" "}
                      {sale.quantity.toLocaleString()}
                      {sale.productType === "milk" ? "L" : "kg"} • {sale.date}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Record a payment for {sale.customerName}
                </DialogDescription>
              </DialogHeader>
              {/* SALE SUMMARY */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {/* TOTAL AMOUNT */}
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Total
                  </p>
                  <p className="font-display text-sm font-bold">
                    ₨{sale.totalAmount.toLocaleString()}
                  </p>
                </div>
                {/* CURRENT PAID */}
                <div className="bg-emerald-500/10 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Paid
                  </p>
                  <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ₨{sale.paidAmount.toLocaleString()}
                  </p>
                </div>
                {/* COMPUTED PENDING */}
                <div className="bg-red-500/10 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Pending
                  </p>
                  <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                    ₨{computedPending.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* FORM */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                {/* NEW PAID AMOUNT FIELD */}
                <div>
                  <Label htmlFor="spud-paidAmount">
                    New Paid Amount (₨){" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (max ₨{sale.totalAmount.toLocaleString()})
                    </span>
                  </Label>
                  <Input
                    id="spud-paidAmount"
                    type="number"
                    inputMode="numeric"
                    placeholder={`0 – ${sale.totalAmount.toLocaleString()}`}
                    // HIDE NATIVE BROWSER SPINNER ARROWS
                    className={`mt-1.5 ${NO_SPINNER}`}
                    disabled={isPending}
                    {...register("paidAmount", { valueAsNumber: true })}
                  />
                  {/* PAID AMOUNT VALIDATION ERROR */}
                  {errors.paidAmount && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.paidAmount.message}
                    </p>
                  )}
                </div>
                {/* COMPUTED PENDING DISPLAY */}
                <div
                  className={`rounded-lg px-3.5 py-2.5 flex items-center justify-between ${
                    computedPending > 0 ? "bg-red-500/10" : "bg-emerald-500/10"
                  }`}
                >
                  <span className="text-sm text-muted-foreground">
                    New Pending
                  </span>
                  <span
                    className={`font-display font-bold text-sm ${
                      computedPending > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {computedPending > 0
                      ? `₨${computedPending.toLocaleString()}`
                      : "Fully Cleared"}
                  </span>
                </div>
                {/* SUBMIT BUTTON */}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Payment"
                  )}
                </Button>
                {/* DELETE BUTTON */}
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Sale Record"
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
SalePaymentUpdateDialog.displayName = "SalePaymentUpdateDialog";

// <== EXPORT ==>
export default SalePaymentUpdateDialog;
