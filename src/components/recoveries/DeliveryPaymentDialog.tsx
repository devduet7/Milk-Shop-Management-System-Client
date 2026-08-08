// <== IMPORTS ==>
import {
  useAddDeliveryPayment,
  useAddBulkDeliveryPayment,
} from "@/hooks/useRecoveries";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerDetail } from "@/hooks/useCustomers";
import type { DeliveryRecovery } from "@/types/recovery-types";
import { addPaymentSchema } from "@/validators/customerSchemas";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

// <== SENTINEL VALUE FOR THE BULK SELECT OPTION ==>
const BULK_PAYMENT_TARGET = "__all__";

// <== DELIVERY PAYMENT DIALOG PROPS ==>
interface DeliveryPaymentDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== CUSTOMER DELIVERY RECOVERY RECORD ==>
  customer: DeliveryRecovery | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== DELIVERY PAYMENT DIALOG COMPONENT ==>
const DeliveryPaymentDialog = memo(
  ({ open, customer, onClose }: DeliveryPaymentDialogProps) => {
    // PAYMENT TARGET STATE — EITHER A BILLING MONTH STRING OR BULK_PAYMENT_TARGET
    const [paymentTarget, setPaymentTarget] = useState<string>("");
    // PAYMENT AMOUNT INPUT STATE
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    // PAYMENT VALIDATION ERROR STATE
    const [paymentError, setPaymentError] = useState<string>("");
    // FETCHING THE CUSTOMER'S FULL MONTHLY BREAKDOWN
    const { data: detailData, isLoading } = useCustomerDetail(
      customer?._id ?? "",
      customer?.monthlyStats.month ?? "",
    );
    // ADD DELIVERY PAYMENT MUTATION (SINGLE MONTH)
    const addPayment = useAddDeliveryPayment();
    // ADD BULK DELIVERY PAYMENT MUTATION (ACROSS ALL OUTSTANDING MONTHS)
    const addBulkPayment = useAddBulkDeliveryPayment();
    // COMBINED PENDING STATE FOR BOTH PAYMENT MUTATIONS
    const isPending = addPayment.isPending || addBulkPayment.isPending;
    // ALL MONTHS WITH AN OUTSTANDING BALANCE, OLDEST FIRST
    const allOutstandingMonths = useMemo(
      () => (detailData?.monthlyBreakdown ?? []).filter((m) => m.pending > 0),
      [detailData?.monthlyBreakdown],
    );
    // RESETTING LOCAL STATE WHENEVER THE DIALOG OPENS FOR A NEW CUSTOMER
    useEffect(() => {
      // ONLY RESETTING WHEN THE DIALOG IS ACTUALLY OPEN WITH A CUSTOMER
      if (open && customer) {
        // CLEARING THE PAYMENT TARGET
        setPaymentTarget("");
        // CLEARING THE PAYMENT AMOUNT
        setPaymentAmount("");
        // CLEARING ANY PAYMENT ERROR
        setPaymentError("");
      }
    }, [open, customer]);
    // KEEPING THE PAYMENT TARGET POINTED AT A VALID OUTSTANDING MONTH (OR BULK) AS DATA LOADS
    useEffect(() => {
      // WAITING UNTIL DETAIL DATA HAS LOADED
      if (!detailData) return;
      // CHECKING WHETHER THE CURRENTLY SELECTED TARGET IS STILL A VALID CHOICE
      const targetStillValid =
        allOutstandingMonths.some((m) => m.month === paymentTarget) ||
        (paymentTarget === BULK_PAYMENT_TARGET &&
          allOutstandingMonths.length > 1);
      // LEAVING THE USER'S CHOICE ALONE IF IT IS STILL VALID
      if (targetStillValid) return;
      // FALLING BACK TO THE OLDEST OUTSTANDING MONTH
      if (allOutstandingMonths.length > 0) {
        // SETTING TARGET TO THE OLDEST OUTSTANDING MONTH
        setPaymentTarget(allOutstandingMonths[0].month);
        // PREFILLING THE AMOUNT WITH THAT MONTH'S PENDING BALANCE
        setPaymentAmount(String(allOutstandingMonths[0].pending));
      } else {
        // CLEARING THE TARGET IF THERE ARE NO OUTSTANDING MONTHS
        setPaymentTarget("");
        // CLEARING THE AMOUNT INPUT
        setPaymentAmount("");
      }
    }, [detailData, allOutstandingMonths, paymentTarget]);
    // HANDLE PAYMENT TARGET CHANGE — SWITCHING TARGETS AUTO-FILLS THE FULL AMOUNT OWED FOR IT
    const handlePaymentTargetChange = useCallback(
      (value: string): void => {
        // UPDATING THE TARGET
        setPaymentTarget(value);
        // CLEARING ANY PRIOR ERROR
        setPaymentError("");
        // IF THE BULK TARGET WAS CHOSEN, PREFILL WITH THE FULL ALL-TIME OUTSTANDING BALANCE
        if (value === BULK_PAYMENT_TARGET) {
          // PREFILLING WITH THE SERVER-COMPUTED ALL-TIME OUTSTANDING FIGURE
          setPaymentAmount(String(detailData?.allTimeOutstanding ?? 0));
        } else {
          // FINDING THE SELECTED MONTH'S OUTSTANDING ENTRY
          const target = allOutstandingMonths.find((m) => m.month === value);
          // PREFILLING WITH THAT MONTH'S PENDING BALANCE
          setPaymentAmount(target ? String(target.pending) : "");
        }
      },
      [allOutstandingMonths, detailData?.allTimeOutstanding],
    );
    // HANDLE PAYMENT AMOUNT INPUT CHANGE — CLEARS ANY PRIOR ERROR AS THE USER TYPES
    const handlePaymentAmountChange = useCallback((value: string): void => {
      // UPDATING THE AMOUNT INPUT
      setPaymentAmount(value);
      // CLEARING THE ERROR ONCE THE USER STARTS CORRECTING IT
      setPaymentError("");
    }, []);
    // HANDLE PAYMENT SUBMISSION — ROUTES TO THE SINGLE-MONTH OR BULK ENDPOINT BASED ON TARGET
    const handleSubmit = useCallback((): void => {
      // GUARD: NO CUSTOMER OR NO TARGET SELECTED
      if (!customer || !paymentTarget) return;
      // PARSING THE AMOUNT INPUT
      const amount = parseFloat(paymentAmount);
      // VALIDATING THE AMOUNT AGAINST THE SHARED SCHEMA RULE
      const result = addPaymentSchema.shape.amount.safeParse(amount);
      // IF VALIDATION FAILED
      if (!result.success) {
        // SETTING THE ERROR MESSAGE
        setPaymentError(result.error.errors[0].message);
        // RETURNING FROM FUNCTION
        return;
      }
      // CLEARING ANY PRIOR ERROR
      setPaymentError("");
      // IF THE BULK TARGET IS SELECTED, ALLOCATE ACROSS ALL OUTSTANDING MONTHS
      if (paymentTarget === BULK_PAYMENT_TARGET) {
        // CALLING THE BULK PAYMENT MUTATION
        addBulkPayment.mutate(
          { customerId: customer._id, amount },
          { onSuccess: onClose },
        );
      } else {
        // CALLING THE SINGLE-MONTH PAYMENT MUTATION FOR THE SELECTED BILLING MONTH
        addPayment.mutate(
          {
            customerId: customer._id,
            data: {
              amount,
              billingMonth: paymentTarget,
              paymentDate: "",
              note: "",
            },
          },
          { onSuccess: onClose },
        );
      }
    }, [
      customer,
      paymentTarget,
      paymentAmount,
      addPayment,
      addBulkPayment,
      onClose,
    ]);
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
              {/* BODY */}
              <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
                {isLoading ? (
                  <Skeleton className="w-full h-40 rounded-xl" />
                ) : (
                  <>
                    {/* OUTSTANDING SUMMARY */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          {customer.monthlyStats.month} Pending
                        </p>
                        <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                          ₨{customer.monthlyStats.pending.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          All-Time Outstanding
                        </p>
                        <p className="font-display text-sm font-bold">
                          ₨
                          {(
                            detailData?.allTimeOutstanding ??
                            customer.allTimeOutstanding
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {/* OTHER OUTSTANDING MONTHS — READ-ONLY VISIBILITY */}
                    {allOutstandingMonths.length > 1 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Outstanding by Month
                        </p>
                        <div className="space-y-1">
                          {allOutstandingMonths.map((m) => (
                            <div
                              key={m.month}
                              className="flex items-center justify-between text-xs bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5"
                            >
                              <span className="text-foreground">
                                {format(parseISO(`${m.month}-01`), "MMMM yyyy")}
                              </span>
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                ₨{m.pending.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* PAYMENT TARGET */}
                    {allOutstandingMonths.length > 0 ? (
                      <>
                        <div>
                          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Apply Payment To
                          </Label>
                          <Select
                            value={paymentTarget}
                            onValueChange={handlePaymentTargetChange}
                          >
                            <SelectTrigger className="mt-1.5 h-9 text-xs">
                              <SelectValue placeholder="Select a Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {allOutstandingMonths.map((m) => (
                                <SelectItem key={m.month} value={m.month}>
                                  {format(
                                    parseISO(`${m.month}-01`),
                                    "MMMM yyyy",
                                  )}{" "}
                                  — ₨{m.pending.toLocaleString()} Pending
                                </SelectItem>
                              ))}
                              {allOutstandingMonths.length > 1 && (
                                <SelectItem value={BULK_PAYMENT_TARGET}>
                                  Pay All Outstanding — ₨
                                  {(
                                    detailData?.allTimeOutstanding ?? 0
                                  ).toLocaleString()}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
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
                            className={cn(
                              "mt-1.5 h-10",
                              paymentError &&
                                "border-destructive focus-visible:ring-destructive",
                            )}
                            disabled={isPending}
                            value={paymentAmount}
                            onChange={(e) =>
                              handlePaymentAmountChange(e.target.value)
                            }
                          />
                          {paymentError && (
                            <p className="text-destructive text-xs mt-1">
                              {paymentError}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center py-1.5 font-medium">
                        ✓ Fully Paid — No Outstanding Balance
                      </p>
                    )}
                  </>
                )}
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
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={
                    isPending ||
                    !paymentTarget ||
                    !paymentAmount ||
                    allOutstandingMonths.length === 0
                  }
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
