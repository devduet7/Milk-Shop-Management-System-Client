// <== IMPORTS ==>
import {
  format,
  parseISO,
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
} from "lucide-react";
import {
  useAddPayment,
  useMarkDelivery,
  useCustomerDetail,
  useAddBulkPayment,
} from "@/hooks/useCustomers";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { addPaymentSchema } from "@/validators/customerSchemas";
import type { Customer, DeliveryStatus } from "@/types/customer-types";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// <== SENTINEL VALUE FOR THE BULK SELECT OPTION ==>
const BULK_PAYMENT_TARGET = "__all__";

// <== CUSTOMER DETAIL DIALOG PROPS ==>
interface CustomerDetailDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== CUSTOMER RECORD ==>
  customer: Customer | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== CUSTOMER DETAIL DIALOG COMPONENT ==>
const CustomerDetailDialog = memo(
  ({ open, customer, onClose }: CustomerDetailDialogProps) => {
    // SELECTED MONTH STATE — DRIVES THE CALENDAR VIEW
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    // SELECTED DAY STATE — THE DAY CURRENTLY OPEN IN THE ACTION PANEL BELOW THE CALENDAR
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    // QUANTITY INPUT FOR THE SELECTED DAY'S ACTION PANEL
    const [selectedDayQuantity, setSelectedDayQuantity] = useState<string>("");
    // PAYMENT TARGET STATE — EITHER A BILLING MONTH STRING OR BULK_PAYMENT_TARGET
    const [paymentTarget, setPaymentTarget] = useState<string>("");
    // PAYMENT AMOUNT INPUT STATE
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    // PAYMENT VALIDATION ERROR STATE
    const [paymentError, setPaymentError] = useState<string>("");
    // REF TO THE SELECTED DAY ACTION PANEL — SCROLLED INTO VIEW WHEN A DAY IS TAPPED
    const actionPanelRef = useRef<HTMLDivElement>(null);
    // REF TO THE CALENDAR GRID — SCROLLED BACK INTO VIEW ONCE A DAY ACTION IS RECORDED
    const calendarGridRef = useRef<HTMLDivElement>(null);
    // FORMATTED MONTH STRING FOR API QUERY
    const monthStr = format(selectedMonth, "yyyy-MM");
    // FETCH CUSTOMER DETAIL FOR SELECTED MONTH
    const { data: detailData, isLoading } = useCustomerDetail(
      customer?._id ?? "",
      monthStr,
    );
    // MARK DELIVERY MUTATION
    const markDelivery = useMarkDelivery();
    // ADD PAYMENT MUTATION (SINGLE MONTH)
    const addPayment = useAddPayment();
    // ADD BULK PAYMENT MUTATION (ACROSS ALL OUTSTANDING MONTHS)
    const addBulkPayment = useAddBulkPayment();
    // COMBINED PENDING STATE FOR BOTH PAYMENT MUTATIONS
    const isPaymentPending = addPayment.isPending || addBulkPayment.isPending;
    // TODAY'S DATE FOR CALENDAR BOUNDS
    const today = useMemo(() => new Date(), []);
    // ALL DAYS IN THE SELECTED MONTH
    const daysInMonth = useMemo(
      () =>
        eachDayOfInterval({
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth),
        }),
      [selectedMonth],
    );
    // IS NEXT MONTH NAVIGATION DISABLED — BLOCK FUTURE MONTHS
    const isNextMonthDisabled =
      selectedMonth.getMonth() >= today.getMonth() &&
      selectedMonth.getFullYear() >= today.getFullYear();
    // BUILDING A DATE-STRING TO DELIVERY-INFO MAP FOR FAST CALENDAR LOOKUPS
    const deliveryMap = useMemo(() => {
      // CREATING THE LOOKUP MAP
      const map = new Map<
        string,
        { status: DeliveryStatus; milkQuantity: number }
      >();
      // POPULATING THE MAP FROM THE SELECTED MONTH'S DELIVERY RECORDS
      (detailData?.deliveryRecords ?? []).forEach((r) =>
        map.set(r.date, { status: r.status, milkQuantity: r.milkQuantity }),
      );
      // RETURNING THE BUILT MAP
      return map;
    }, [detailData?.deliveryRecords]);
    // MONTHLY STATS ALIAS FOR CONVENIENCE
    const stats = detailData?.monthlyStats;
    // ALL MONTHS WITH AN OUTSTANDING BALANCE, OLDEST FIRST
    const allOutstandingMonths = useMemo(
      () => (detailData?.monthlyBreakdown ?? []).filter((m) => m.pending > 0),
      [detailData?.monthlyBreakdown],
    );
    // OUTSTANDING MONTHS EXCLUDING WHICHEVER MONTH THE CALENDAR IS CURRENTLY SHOWING
    const otherOutstandingMonths = useMemo(
      () => allOutstandingMonths.filter((m) => m.month !== monthStr),
      [allOutstandingMonths, monthStr],
    );
    // WHETHER THIS CUSTOMER HAS ANY OUTSTANDING BALANCE AT ALL, ANY MONTH
    const hasAnyOutstanding = allOutstandingMonths.length > 0;
    // RESETTING ALL LOCAL STATE WHENEVER THE DIALOG OPENS FOR A NEW CUSTOMER
    useEffect(() => {
      // ONLY RESETTING WHEN A CUSTOMER IS ACTUALLY PRESENT
      if (customer) {
        // RESETTING CALENDAR TO THE CURRENT MONTH
        setSelectedMonth(new Date());
        // CLEARING ANY SELECTED DAY
        setSelectedDay(null);
        // CLEARING THE DAY QUANTITY INPUT
        setSelectedDayQuantity("");
        // CLEARING THE PAYMENT TARGET
        setPaymentTarget("");
        // CLEARING THE PAYMENT AMOUNT
        setPaymentAmount("");
        // CLEARING ANY PAYMENT ERROR
        setPaymentError("");
      }
    }, [customer]);
    // SCROLLING THE SELECTED DAY'S ACTION PANEL INTO VIEW WHEN A DAY IS SELECTED
    useEffect(() => {
      // ONLY SCROLLING WHEN A DAY IS ACTUALLY SELECTED AND THE PANEL HAS MOUNTED
      if (selectedDay && actionPanelRef.current) {
        // SCROLLING SMOOTHLY TO THE PANEL
        actionPanelRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [selectedDay]);
    // SYNCHRONIZING PAYMENT TARGET AND AMOUNT WHEN DETAIL DATA OR OUTSTANDING MONTHS CHANGE
    useEffect(() => {
      // WAITING UNTIL DETAIL DATA HAS LOADED
      if (!detailData) return;
      // FINDING THE CURRENTLY SELECTED TARGET'S LIVE OUTSTANDING ENTRY, IF ANY
      const currentTargetEntry =
        paymentTarget === BULK_PAYMENT_TARGET
          ? null
          : allOutstandingMonths.find((m) => m.month === paymentTarget);
      // CHECKING WHETHER THE CURRENTLY SELECTED TARGET IS STILL A VALID CHOICE
      const targetStillValid =
        !!currentTargetEntry ||
        (paymentTarget === BULK_PAYMENT_TARGET &&
          allOutstandingMonths.length > 1);
      // IF THE CURRENT TARGET IS STILL VALID, KEEP IT AND UPDATE THE AMOUNT TO MATCH THE LATEST FIGURE
      if (targetStillValid) {
        // RE-SYNCING THE BULK TARGET'S AMOUNT TO THE LATEST ALL-TIME OUTSTANDING FIGURE
        if (paymentTarget === BULK_PAYMENT_TARGET) {
          // UPDATING THE AMOUNT INPUT WITH THE LATEST ALL-TIME OUTSTANDING BALANCE
          setPaymentAmount(String(detailData.allTimeOutstanding ?? 0));
        } else if (currentTargetEntry) {
          // UPDATING THE AMOUNT INPUT WITH THE TARGET MONTH'S LATEST PENDING BALANCE
          setPaymentAmount(String(currentTargetEntry.pending));
        }
        // RETURNING FROM EFFECT — TARGET ITSELF DOES NOT NEED TO CHANGE
        return;
      }
      // PREFERRING THE CURRENTLY VIEWED MONTH IF IT HAS A PENDING BALANCE
      if (stats && stats.pending > 0) {
        // SETTING TARGET TO THE CURRENTLY VIEWED MONTH
        setPaymentTarget(monthStr);
        // PREFILLING THE AMOUNT WITH THE FULL PENDING BALANCE
        setPaymentAmount(String(stats.pending));
      } else if (allOutstandingMonths.length > 0) {
        // FALLING BACK TO THE OLDEST OUTSTANDING MONTH
        setPaymentTarget(allOutstandingMonths[0].month);
        // PREFILLING THE AMOUNT WITH THAT MONTH'S PENDING BALANCE
        setPaymentAmount(String(allOutstandingMonths[0].pending));
      } else {
        // CLEARING THE TARGET — NO OUTSTANDING MONTHS LEFT
        setPaymentTarget("");
        // CLEARING THE AMOUNT INPUT
        setPaymentAmount("");
      }
    }, [detailData, allOutstandingMonths, paymentTarget, stats, monthStr]);
    // HANDLE PREV MONTH
    const handlePrevMonth = useCallback((): void => {
      // DECREMENT MONTH BY ONE
      setSelectedMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
      );
      // CLOSING ANY OPEN DAY PANEL — IT BELONGED TO THE PREVIOUS MONTH VIEW
      setSelectedDay(null);
    }, []);
    // HANDLE NEXT MONTH
    const handleNextMonth = useCallback((): void => {
      // INCREMENT MONTH BY ONE
      setSelectedMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
      );
      // CLOSING ANY OPEN DAY PANEL — IT BELONGED TO THE PREVIOUS MONTH VIEW
      setSelectedDay(null);
    }, []);
    // HANDLE DAY SELECTION — OPENS THE ACTION PANEL FOR THAT DAY, PREFILLING ITS QUANTITY
    const handleSelectDay = useCallback(
      (dateStr: string): void => {
        // GUARD: NO CUSTOMER LOADED
        if (!customer) return;
        // SELECTING THE DAY
        setSelectedDay(dateStr);
        // LOOKING UP ANY EXISTING RECORD FOR THIS DAY
        const info = deliveryMap.get(dateStr);
        // PREFILLING THE QUANTITY INPUT — EXISTING DELIVERED QUANTITY, OR THE CUSTOMER'S DEFAULT
        setSelectedDayQuantity(
          info && info.status === "delivered"
            ? String(info.milkQuantity)
            : String(customer.dailyMilk),
        );
      },
      [customer, deliveryMap],
    );
    // HANDLE MARKING THE SELECTED DAY WITH A GIVEN STATUS
    const handleMarkSelectedDay = useCallback(
      (status: DeliveryStatus): void => {
        // GUARD: NO CUSTOMER OR NO DAY SELECTED
        if (!customer || !selectedDay) return;
        // PARSING THE QUANTITY INPUT
        const parsedQuantity = parseFloat(selectedDayQuantity);
        // CALLING THE MARK DELIVERY MUTATION WITH APPROPRIATE PAYLOAD
        markDelivery.mutate(
          {
            customerId: customer._id,
            date: selectedDay,
            status,
            ...(status === "delivered" &&
            Number.isFinite(parsedQuantity) &&
            parsedQuantity > 0
              ? { milkQuantity: parsedQuantity }
              : {}),
          },
          {
            // CLOSING THE PANEL AND SCROLLING BACK UP TO THE CALENDAR ON SUCCESS
            onSuccess: () => {
              // CLOSING THE ACTION PANEL
              setSelectedDay(null);
              // SCROLLING BACK UP TO THE CALENDAR GRID
              calendarGridRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            },
          },
        );
      },
      [customer, selectedDay, selectedDayQuantity, markDelivery],
    );
    // WHETHER THE CURRENTLY SELECTED DAY HAS NO EXISTING RECORD (ALREADY EFFECTIVELY CLEAR)
    const selectedDayIsAlreadyClear = useMemo(() => {
      // NO DAY SELECTED — NOTHING TO EVALUATE
      if (!selectedDay) return true;
      // LOOKING UP THE SELECTED DAY'S CURRENT STATUS
      const info = deliveryMap.get(selectedDay);
      // CLEAR IF THERE IS NO RECORD, OR THE RECORD IS ALREADY UNMARKED
      return !info || info.status === "unmarked";
    }, [selectedDay, deliveryMap]);
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
    const handleAddPayment = useCallback((): void => {
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
      // SHARED SUCCESS HANDLER — CLEARS THE AMOUNT INPUT ONCE RECORDED
      const onSuccess = (): void => {
        // CLEARING THE AMOUNT INPUT
        setPaymentAmount("");
        // CLEARING ANY ERROR
        setPaymentError("");
      };
      // IF THE BULK TARGET IS SELECTED, ALLOCATE ACROSS ALL OUTSTANDING MONTHS
      if (paymentTarget === BULK_PAYMENT_TARGET) {
        // CALLING THE BULK PAYMENT MUTATION
        addBulkPayment.mutate(
          { customerId: customer._id, amount },
          { onSuccess },
        );
      } else {
        // CALLING THE SINGLE-MONTH PAYMENT MUTATION FOR THE SELECTED BILLING MONTH
        addPayment.mutate(
          { customerId: customer._id, amount, billingMonth: paymentTarget },
          { onSuccess },
        );
      }
    }, [customer, paymentTarget, paymentAmount, addPayment, addBulkPayment]);
    // RETURNING CUSTOMER DETAIL DIALOG
    return (
      // DIALOG WRAPPER
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !markDelivery.isPending && !isPaymentPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-lg max-h-[92vh] overflow-hidden gap-0">
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
                      {customer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                      {customer.dailyMilk}L/day · ₨{customer.pricePerLiter}/L
                    </DialogDescription>
                  </div>
                </div>
              </div>
              {/* SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
                {/* MONTH NAVIGATION */}
                <div className="flex items-center justify-center gap-1 bg-muted/50 rounded-xl border border-border/50 px-1 py-1 w-fit mx-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold whitespace-nowrap min-w-[110px] text-center px-1">
                    {format(selectedMonth, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    disabled={isNextMonthDisabled}
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {/* CALENDAR GRID */}
                {isLoading ? (
                  <div className="space-y-3">
                    {/* WEEKDAY HEADER ROW SKELETON */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton
                          key={`wd-${i}`}
                          className="h-3 w-4 mx-auto rounded-sm"
                        />
                      ))}
                    </div>
                    {/* DAY CELL GRID SKELETON — 5 ROWS OF 7 MATCHES A TYPICAL MONTH LAYOUT */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton
                          key={`day-${i}`}
                          className="aspect-square rounded-md sm:rounded-lg"
                        />
                      ))}
                    </div>
                    {/* LEGEND / INSTRUCTION SKELETON */}
                    <Skeleton className="h-11 w-full rounded-lg" />
                    {/* MONTHLY SUMMARY CARDS SKELETON */}
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={`sum-${i}`}
                          className="h-16 rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      ref={calendarGridRef}
                      className="grid grid-cols-7 gap-1 sm:gap-1.5"
                    >
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <div
                          key={d}
                          className="text-center text-[10px] font-semibold text-muted-foreground py-1"
                        >
                          {d}
                        </div>
                      ))}
                      {/* LEADING BLANK CELLS FOR MONTH OFFSET */}
                      {Array.from({
                        length: startOfMonth(selectedMonth).getDay(),
                      }).map((_, i) => (
                        <div key={`blank-${i}`} />
                      ))}
                      {/* DAY CELLS */}
                      {daysInMonth.map((date) => {
                        // FORMATTING THE DATE AS YYYY-MM-DD
                        const dateStr = format(date, "yyyy-MM-dd");
                        // LOOKING UP THIS DAY'S DELIVERY INFO
                        const info = deliveryMap.get(dateStr);
                        // EXTRACTING THE STATUS
                        const status = info?.status ?? null;
                        // IS THIS DAY TODAY
                        const isToday = isSameDay(date, today);
                        // IS THIS DAY IN THE FUTURE
                        const isFuture = date > today;
                        // IS THIS DAY CURRENTLY SELECTED
                        const isSelected = selectedDay === dateStr;
                        // RETURNING THE DAY CELL
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() =>
                              !isFuture && handleSelectDay(dateStr)
                            }
                            disabled={isFuture}
                            className={cn(
                              "aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs font-medium transition-all",
                              isFuture && "opacity-30 cursor-not-allowed",
                              !isFuture &&
                                "cursor-pointer hover:ring-2 hover:ring-primary/40",
                              isSelected && "ring-2 ring-primary",
                              !isSelected &&
                                isToday &&
                                "ring-1 ring-primary/60",
                              status === "delivered" &&
                                "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                              status === "missed" &&
                                "bg-red-500/20 text-red-700 dark:text-red-300",
                              (!status || status === "unmarked") &&
                                !isFuture &&
                                "bg-muted hover:bg-muted/80",
                            )}
                          >
                            <span className="leading-none">
                              {format(date, "d")}
                            </span>
                            {status === "delivered" && (
                              <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5">
                                {info!.milkQuantity}L
                              </span>
                            )}
                            {status === "missed" && (
                              <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* LEGEND / INSTRUCTION */}
                    <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-2.5">
                      <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                          Tap a day
                        </span>{" "}
                        to set its delivery status and quantity below. Delivered
                        days show the exact liters logged for that day.
                      </p>
                    </div>
                    {/* SELECTED DAY ACTION PANEL */}
                    {selectedDay && (
                      <div
                        ref={actionPanelRef}
                        className="bg-background border border-border rounded-xl p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {format(parseISO(selectedDay), "EEEE, d MMMM yyyy")}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedDay(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Close
                          </button>
                        </div>
                        <div>
                          <Label
                            htmlFor="delivery-qty"
                            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                          >
                            Milk Quantity (L) — Applies if Marked Delivered
                          </Label>
                          <Input
                            id="delivery-qty"
                            type="number"
                            inputMode="decimal"
                            min="0.1"
                            step="0.5"
                            placeholder={`Default: ${customer.dailyMilk}L`}
                            value={selectedDayQuantity}
                            onChange={(e) =>
                              setSelectedDayQuantity(e.target.value)
                            }
                            className="mt-1.5 h-9"
                            disabled={markDelivery.isPending}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleMarkSelectedDay("delivered")}
                            disabled={markDelivery.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Delivered
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMarkSelectedDay("missed")}
                            disabled={markDelivery.isPending}
                          >
                            Missed
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSelectedDay("unmarked")}
                            disabled={
                              markDelivery.isPending ||
                              selectedDayIsAlreadyClear
                            }
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {/* MONTHLY SUMMARY CARDS — SKELETON VERSION ABOVE COVERS THE LOADING STATE */}
                {!isLoading && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/50 border border-border/50 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Monthly Total
                      </p>
                      <p className="font-display text-sm font-bold">
                        ₨{(stats?.monthlyTotal ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Paid
                      </p>
                      <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₨{(stats?.totalPaid ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Pending
                      </p>
                      <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                        ₨{(stats?.pending ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {/* PAYMENT SECTION — ONLY SHOWN WHEN SOMETHING IS ACTUALLY OUTSTANDING */}
                {hasAnyOutstanding ? (
                  <div className="space-y-2">
                    {/* OTHER OUTSTANDING MONTHS — READ-ONLY VISIBILITY BEFORE CHOOSING WHAT TO PAY */}
                    {otherOutstandingMonths.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Other Outstanding Months
                        </p>
                        <div className="space-y-1">
                          {otherOutstandingMonths.map((m) => (
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
                    {/* PAYMENT TARGET + AMOUNT + SUBMIT */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Apply Payment To
                      </Label>
                      <Select
                        value={paymentTarget}
                        onValueChange={handlePaymentTargetChange}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select a Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {stats && stats.pending > 0 && (
                            <SelectItem value={monthStr}>
                              {format(selectedMonth, "MMMM yyyy")} — ₨
                              {stats.pending.toLocaleString()} Pending
                            </SelectItem>
                          )}
                          {otherOutstandingMonths.map((m) => (
                            <SelectItem key={m.month} value={m.month}>
                              {format(parseISO(`${m.month}-01`), "MMMM yyyy")} —
                              ₨{m.pending.toLocaleString()} Pending
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
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          placeholder="Enter payment amount (₨)"
                          value={paymentAmount}
                          onChange={(e) =>
                            handlePaymentAmountChange(e.target.value)
                          }
                          className={cn(
                            "flex-1",
                            paymentError &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                          disabled={isPaymentPending}
                        />
                        <Button
                          onClick={handleAddPayment}
                          disabled={
                            isPaymentPending || !paymentAmount || !paymentTarget
                          }
                          className="shrink-0"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          {isPaymentPending ? "Recording..." : "Record"}
                        </Button>
                      </div>
                      {paymentError && (
                        <p className="text-destructive text-xs">
                          {paymentError}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center py-1.5 font-medium">
                    ✓ Fully Paid — No Outstanding Balance
                  </p>
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
