// <== IMPORTS ==>
import {
  useDeleteSaleRecord,
  useUpdateSalePayment,
} from "@/hooks/useRecoveries";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  updateSalePaymentSchema,
  type UpdateSalePaymentFormValues,
} from "@/validators/recoverySchemas";
import { cn } from "@/lib/utils";
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
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {sale && (
            <>
              {/* FIXED PRIMARY GRADIENT HEADER */}
              <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                <div className="flex items-start gap-3">
                  {/* CUSTOMER AVATAR BADGE */}
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                    <span className="text-base font-bold text-primary">
                      {(sale.customerName ?? "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* TITLE AND DESCRIPTION */}
                  <div className="min-w-0 pt-0.5">
                    <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left truncate">
                      {sale.customerName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                      {sale.productType === "milk" ? "Milk" : "Yoghurt"} •{" "}
                      {sale.quantity.toLocaleString()}
                      {sale.productType === "milk" ? "L" : "kg"} • {sale.date}
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
                  {/* SALE SUMMARY */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* TOTAL AMOUNT */}
                    <div className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Total
                      </p>
                      <p className="font-display text-sm font-bold">
                        ₨{sale.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    {/* CURRENT PAID */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Paid
                      </p>
                      <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₨{sale.paidAmount.toLocaleString()}
                      </p>
                    </div>
                    {/* COMPUTED PENDING */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Pending
                      </p>
                      <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                        ₨{computedPending.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* NEW PAID AMOUNT FIELD */}
                  <div>
                    <Label
                      htmlFor="spud-paidAmount"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      New Paid Amount (₨){" "}
                      <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                        (max ₨{sale.totalAmount.toLocaleString()})
                      </span>
                    </Label>
                    <Input
                      id="spud-paidAmount"
                      type="number"
                      inputMode="numeric"
                      placeholder={`0 – ${sale.totalAmount.toLocaleString()}`}
                      className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                    className={cn(
                      "rounded-xl px-4 py-3 flex items-center justify-between border",
                      computedPending > 0
                        ? "bg-red-500/10 border-red-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20",
                    )}
                  >
                    <span className="text-xs text-muted-foreground font-medium">
                      New Pending
                    </span>
                    <span
                      className={cn(
                        "font-display font-bold text-sm",
                        computedPending > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {computedPending > 0
                        ? `₨${computedPending.toLocaleString()}`
                        : "Fully Cleared"}
                    </span>
                  </div>
                </div>
                {/* FIXED FOOTER — DELETE LEFT, CANCEL + UPDATE RIGHT */}
                <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
                  {/* DELETE BUTTON */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={handleDelete}
                    className="h-9 px-4 gap-1.5"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                  {/* CANCEL + UPDATE */}
                  <div className="flex items-center gap-2">
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
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending}
                      className="h-9 px-4 gap-1.5"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
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
SalePaymentUpdateDialog.displayName = "SalePaymentUpdateDialog";

// <== EXPORT ==>
export default SalePaymentUpdateDialog;
