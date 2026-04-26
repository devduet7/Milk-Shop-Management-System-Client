// <== IMPORTS ==>
import {
  format,
  isSameDay,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  Info,
  XCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  useAddPayment,
  useMarkDelivery,
  useCustomerDetail,
} from "@/hooks/useCustomers";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { addPaymentSchema } from "@/validators/customerSchemas";
import type { Customer, DeliveryStatus } from "@/types/customer-types";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

// <== CUSTOMER DETAIL DIALOG PROPS ==>
interface CustomerDetailDialogProps {
  // <== SELECTED CUSTOMER (NULL = DIALOG CLOSED) ==>
  customer: Customer | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== GET NEXT DELIVERY STATUS (3-STATE CYCLE) ==>
const getNextDeliveryStatus = (
  current: DeliveryStatus | null,
): DeliveryStatus => {
  // NO RECORD OR UNMARKED → DELIVERED
  if (!current || current === "unmarked") return "delivered";
  // DELIVERED → MISSED
  if (current === "delivered") return "missed";
  // MISSED → UNMARKED (CLEARS THE RECORD)
  return "unmarked";
};

// <== CUSTOMER DETAIL DIALOG COMPONENT ==>
const CustomerDetailDialog = memo(
  ({ customer, onClose }: CustomerDetailDialogProps) => {
    // INDEPENDENT MONTH STATE FOR DIALOG (DOES NOT AFFECT MAIN PAGE)
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    // CONTROLLED PAYMENT AMOUNT INPUT
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    // PAYMENT INLINE VALIDATION ERROR
    const [paymentError, setPaymentError] = useState<string>("");
    // RESET MONTH AND PAYMENT STATE WHEN A DIFFERENT CUSTOMER IS OPENED
    useEffect(() => {
      // IF A CUSTOMER IS OPENED
      if (customer) {
        // RESET MONTH
        setSelectedMonth(new Date());
        // RESET PAYMENT
        setPaymentAmount("");
        // CLEAR PAYMENT ERROR
        setPaymentError("");
      }
    }, [customer]);
    // FORMAT MONTH AS YYYY-MM FOR API
    const monthStr = format(selectedMonth, "yyyy-MM");
    // FETCH CUSTOMER DETAIL (ENABLED ONLY WHEN CUSTOMER IS SET)
    const {
      data: detailData,
      isLoading,
      isError,
    } = useCustomerDetail(customer?._id ?? "", monthStr);
    // MARK DELIVERY MUTATION
    const markDelivery = useMarkDelivery();
    // ADD PAYMENT MUTATION
    const addPayment = useAddPayment();
    // DAYS IN SELECTED MONTH
    const daysInMonth = useMemo(
      () =>
        eachDayOfInterval({
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth),
        }),
      [selectedMonth],
    );
    // DELIVERY RECORD MAP FOR O(1) LOOKUP BY DATE STRING
    const deliveryMap = useMemo(() => {
      // BUILD MAP FROM DELIVERY RECORDS
      const map = new Map<string, DeliveryStatus>();
      // LOOP THROUGH ALL DELIVERY RECORDS
      (detailData?.deliveryRecords ?? []).forEach((r) =>
        // ADD TO MAP BY DATE STRING
        map.set(r.date, r.status),
      );
      // RETURN COMPLETED MAP
      return map;
    }, [detailData?.deliveryRecords]);
    // GET DELIVERY STATUS FOR A DATE STRING
    const getDeliveryStatus = useCallback(
      (dateStr: string): DeliveryStatus | null =>
        // RETURN DELIVERY STATUS FROM MAP
        deliveryMap.get(dateStr) ?? null,
      [deliveryMap],
    );
    // HANDLE CALENDAR DAY CLICK — CYCLES THROUGH DELIVERED → MISSED → UNMARKED
    const handleToggleDelivery = useCallback(
      (dateStr: string): void => {
        // GUARD: NO CUSTOMER
        if (!customer) return;
        // GET CURRENT STATUS FOR THIS DATE
        const current = getDeliveryStatus(dateStr);
        // COMPUTE NEXT STATUS IN CYCLE
        const nextStatus = getNextDeliveryStatus(current);
        // CALL MARK DELIVERY MUTATION
        markDelivery.mutate({
          customerId: customer._id,
          date: dateStr,
          status: nextStatus,
        });
      },
      [customer, getDeliveryStatus, markDelivery],
    );
    // HANDLE PAYMENT AMOUNT INPUT CHANGE (CLEARS ERROR ON TYPE)
    const handlePaymentAmountChange = useCallback(
      (value: string): void => {
        // UPDATE INPUT VALUE
        setPaymentAmount(value);
        // CLEAR ERROR WHEN USER TYPES
        if (paymentError) setPaymentError("");
      },
      [paymentError],
    );
    // HANDLE ADD PAYMENT — VALIDATES WITH ZOD BEFORE MUTATING
    const handleAddPayment = useCallback((): void => {
      // GUARD: NO CUSTOMER
      if (!customer) return;
      // PARSE PAYMENT AMOUNT AS FLOAT
      const amount = parseFloat(paymentAmount);
      // VALIDATE USING ZOD SCHEMA SHAPE
      const result = addPaymentSchema.shape.amount.safeParse(amount);
      // IF VALIDATION FAILS, SHOW INLINE ERROR
      if (!result.success) {
        // SHOW ERROR
        setPaymentError(result.error.errors[0].message);
        // RETURN FROM FUNCTION
        return;
      }
      // CLEAR ANY PREVIOUS ERROR
      setPaymentError("");
      // CALL ADD PAYMENT MUTATION
      addPayment.mutate(
        { customerId: customer._id, amount, billingMonth: monthStr },
        // CLEAR INPUT ON SUCCESS
        {
          onSuccess: () => {
            setPaymentAmount("");
            setPaymentError("");
          },
        },
      );
    }, [customer, paymentAmount, monthStr, addPayment]);
    // MONTHLY STATS FROM DETAIL QUERY OR UNDEFINED WHILE LOADING
    const stats = detailData?.monthlyStats;
    // TODAY AS DATE OBJECT FOR COMPARISONS (STABLE REFERENCE)
    const today = useMemo(() => new Date(), []);
    // RETURNING CUSTOMER DETAIL DIALOG
    return (
      // DIALOG WRAPPER
      <Dialog open={!!customer} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {customer && (
            <>
              {/* DIALOG HEADER */}
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  {/* AVATAR */}
                  <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-base font-bold text-primary">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  {/* NAME */}
                  <span className="truncate">{customer.name}</span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View customer details, delivery calendar, and payment
                  information.
                </DialogDescription>
              </DialogHeader>
              {/* MONTH NAVIGATION */}
              <div className="flex items-center justify-between py-2">
                {/* PREVIOUS MONTH */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1),
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {/* MONTH LABEL */}
                <span className="font-medium text-sm sm:text-base">
                  {format(selectedMonth, "MMMM yyyy")}
                </span>
                {/* NEXT MONTH (BLOCKED FOR FUTURE MONTHS) */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={
                    selectedMonth.getMonth() >= today.getMonth() &&
                    selectedMonth.getFullYear() >= today.getFullYear()
                  }
                  onClick={() =>
                    setSelectedMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1),
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {/* CALENDAR GRID */}
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                {/* INSTRUCTION BOX */}
                <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 mb-3">
                  <Info className="w-3.5 h-3.5 text-primary mt-px shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      Click to cycle:{" "}
                    </span>
                    1st →{" "}
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Delivered
                    </span>
                    {"  "}·{"  "}2nd →{" "}
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Missed
                    </span>
                    {"  "}·{"  "}3rd →{" "}
                    <span className="font-medium">Clear</span>
                  </p>
                </div>
                {/* DAY HEADERS */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                {/* DATE CELLS */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {/* EMPTY CELLS BEFORE MONTH START */}
                  {Array.from({
                    length: startOfMonth(selectedMonth).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {/* DAY CELLS */}
                  {daysInMonth.map((date) => {
                    // FORMAT DATE STRING
                    const dateStr = format(date, "yyyy-MM-dd");
                    // DELIVERY STATUS FOR THIS DATE
                    const status = getDeliveryStatus(dateStr);
                    // IS TODAY
                    const isToday = isSameDay(date, today);
                    // IS FUTURE DATE (CANNOT MARK)
                    const isFuture = date > today;
                    // IS MUTATION IN PROGRESS
                    const isUpdating = markDelivery.isPending;
                    // RETURNING DATE CELL
                    return (
                      <button
                        key={dateStr}
                        onClick={() =>
                          !isFuture && handleToggleDelivery(dateStr)
                        }
                        disabled={isFuture || isUpdating}
                        className={cn(
                          "aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs transition-all",
                          isFuture && "opacity-40 cursor-not-allowed",
                          isUpdating && !isFuture && "opacity-60 cursor-wait",
                          !isFuture &&
                            !isUpdating &&
                            "hover:ring-2 hover:ring-primary/50 cursor-pointer",
                          isToday && "ring-2 ring-primary",
                          status === "delivered" &&
                            "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                          status === "missed" &&
                            "bg-red-500/20 text-red-700 dark:text-red-300",
                          (!status || status === "unmarked") &&
                            !isFuture &&
                            "bg-muted hover:bg-muted/80",
                        )}
                      >
                        {/* DAY NUMBER */}
                        <span className="font-medium leading-none">
                          {format(date, "d")}
                        </span>
                        {/* STATUS ICON */}
                        {status === "delivered" && (
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
                        )}
                        {status === "missed" && (
                          <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* CALENDAR LEGEND */}
                <div className="flex items-center justify-center flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-500/20 inline-block" />
                    Delivered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-500/20 inline-block" />
                    Missed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-muted inline-block" />
                    Not marked
                  </span>
                </div>
              </div>
              {/* MONTHLY SUMMARY CARDS */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
                {/* TOTAL DUE */}
                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                    Total Due
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mx-auto mt-1" />
                  ) : (
                    <p className="font-display text-sm sm:text-base md:text-lg font-bold">
                      ₨{(stats?.monthlyTotal ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
                {/* PAID */}
                <div className="bg-emerald-500/10 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                    Paid
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mx-auto mt-1" />
                  ) : (
                    <p className="font-display text-sm sm:text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₨{(stats?.totalPaid ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
                {/* PENDING */}
                <div className="bg-red-500/10 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                    Pending
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mx-auto mt-1" />
                  ) : (
                    <p className="font-display text-sm sm:text-base md:text-lg font-bold text-red-600 dark:text-red-400">
                      ₨{(stats?.pending ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              {/* ERROR STATE */}
              {isError && (
                <p className="text-sm text-destructive text-center py-2">
                  Failed to load delivery data. Please try again.
                </p>
              )}
              {/* ADD PAYMENT SECTION */}
              <div className="mt-2 space-y-1.5">
                {/* INPUT ROW */}
                <div className="flex gap-2">
                  {/* PAYMENT AMOUNT INPUT — NO SPINNER, NO NEGATIVE */}
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="Enter payment amount (₨)"
                      value={paymentAmount}
                      onChange={(e) =>
                        handlePaymentAmountChange(e.target.value)
                      }
                      // HIDE NATIVE BROWSER SPINNER ARROWS
                      className={cn(
                        "w-full",
                        NO_SPINNER,
                        paymentError &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      disabled={addPayment.isPending}
                    />
                  </div>
                  {/* SUBMIT PAYMENT BUTTON */}
                  <Button
                    onClick={handleAddPayment}
                    disabled={addPayment.isPending || !paymentAmount}
                    className="shrink-0"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    {addPayment.isPending ? "Adding..." : "Add Payment"}
                  </Button>
                </div>
                {/* INLINE PAYMENT VALIDATION ERROR */}
                {paymentError && (
                  <p className="text-destructive text-xs">{paymentError}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
CustomerDetailDialog.displayName = "CustomerDetailDialog";

// <== EXPORT ==>
export default CustomerDetailDialog;
