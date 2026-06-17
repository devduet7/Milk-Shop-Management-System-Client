// <== IMPORTS ==>
import { z } from "zod";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddQuickSale } from "@/hooks/useQuickSales";
import type { QuickSaleType } from "@/types/quick-sale-types";
import { Milk, IceCream, Plus, Edit2, Check, X } from "lucide-react";
import { memo, useState, useCallback, useRef, useEffect } from "react";

// <== LOCAL STORAGE MILK RATE KEY FOR PERSISTED RATES ==>
const MILK_RATE_KEY = "qs_milk_rate";
// <== LOCAL STORAGE YOGHURT RATE KEY FOR PERSISTED RATES ==>
const YOGHURT_RATE_KEY = "qs_yoghurt_rate";

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== ENTRY FORM SCHEMA — VALIDATES QUANTITY INPUT ONLY ==>
const entrySchema = z.object({
  // <== QUANTITY FIELD (REQUIRED) ==>
  quantity: z
    .number({
      required_error: "Quantity is Required!",
      invalid_type_error: "Please enter a Valid Quantity!",
    })
    .min(0.1, { message: "Minimum 0.1!" })
    .max(10_000, { message: "Too Large!" }),
});

// <== HELPER: READ PERSISTED RATE FROM LOCAL STORAGE ==>
const getPersistedRate = (key: string, fallback: number): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem(key);
  // PARSE SAVED VALUE
  const parsed = parseFloat(saved ?? "");
  // RETURN SAVED RATE OR FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

// <== LOCKED RATE DISPLAY PROPS ==>
interface LockedRateDisplayProps {
  // <== PRODUCT TYPE FOR UNIT LABEL ==>
  type: QuickSaleType;
  // <== CURRENT RATE ==>
  rate: number;
  // <== LOCAL STORAGE KEY FOR PERSISTENCE ==>
  storageKey: string;
  // <== RATE CHANGE CALLBACK ==>
  onRateChange: (newRate: number) => void;
}

// <== LOCKED RATE DISPLAY COMPONENT ==>
const LockedRateDisplay = memo(
  ({ type, rate, storageKey, onRateChange }: LockedRateDisplayProps) => {
    // EDITING MODE STATE
    const [isEditing, setIsEditing] = useState<boolean>(false);
    // DRAFT VALUE DURING EDIT
    const [draft, setDraft] = useState<string>(String(rate));
    // INPUT REF FOR AUTO-FOCUS ON EDIT
    const inputRef = useRef<HTMLInputElement>(null);
    // FOCUS INPUT WHEN EDITING STARTS
    useEffect(() => {
      // FOCUS INPUT IF EDITING MODE IS ACTIVE
      if (isEditing) inputRef.current?.focus();
    }, [isEditing]);
    // HANDLE SAVE — VALIDATE, PERSIST TO LOCAL STORAGE, NOTIFY PARENT
    const handleSave = useCallback((): void => {
      // PARSE DRAFT VALUE
      const parsed = parseFloat(draft);
      // REVERT IF INVALID
      if (Number.isNaN(parsed) || parsed < 1) {
        // RESET DRAFT TO CURRENT RATE
        setDraft(String(rate));
        // EXIT EDIT MODE WITHOUT SAVING
        setIsEditing(false);
        // EXIT FUNCTION
        return;
      }
      // PERSIST NEW RATE TO LOCAL STORAGE
      localStorage.setItem(storageKey, String(parsed));
      // NOTIFY PARENT OF NEW RATE
      onRateChange(parsed);
      // EXIT EDIT MODE
      setIsEditing(false);
    }, [draft, rate, storageKey, onRateChange]);
    // HANDLE CANCEL — REVERT DRAFT AND EXIT EDIT MODE
    const handleCancel = useCallback((): void => {
      // REVERT DRAFT TO CURRENT RATE
      setDraft(String(rate));
      // EXIT EDIT MODE WITHOUT SAVING
      setIsEditing(false);
    }, [rate]);
    // HANDLE KEY DOWN — ENTER SAVES, ESCAPE CANCELS
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>): void => {
        // SAVE ON ENTER
        if (e.key === "Enter") handleSave();
        // CANCEL ON ESCAPE
        if (e.key === "Escape") handleCancel();
      },
      [handleSave, handleCancel],
    );
    // RETURNING LOCKED RATE DISPLAY
    return (
      // RATE ROW CONTAINER
      <div className="flex items-center gap-1.5 shrink-0">
        {/* UNIT LABEL */}
        <span className="text-xs text-muted-foreground">
          ₨/{type === "milk" ? "L" : "kg"}
        </span>
        {/* EDIT MODE — INLINE INPUT WITH SAVE AND CANCEL */}
        {isEditing ? (
          // INPUT AND BUTTONS ROW
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn("h-8 w-20 text-xs", NO_SPINNER)}
            />
            {/* BUTTON ROW */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={handleSave}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              {/* CANCEL BUTTON */}
              <button
                type="button"
                onClick={handleCancel}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          // LOCKED MODE — RATE VALUE WITH EDIT TRIGGER
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">₨{rate}</span>
            {/* EDIT TRIGGER */}
            <button
              type="button"
              onClick={() => {
                setDraft(String(rate));
                setIsEditing(true);
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit rate"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
LockedRateDisplay.displayName = "LockedRateDisplay";

// <== SALE FORM PROPS ==>
interface SaleFormProps {
  // <== PRODUCT TYPE ==>
  type: QuickSaleType;
  // <== CURRENT PERSISTED RATE ==>
  rate: number;
  // <== LOCAL STORAGE KEY FOR RATE PERSISTENCE ==>
  storageKey: string;
  // <== RATE CHANGE CALLBACK ==>
  onRateChange: (r: number) => void;
  // <== MUTATION PENDING STATE ==>
  isPending: boolean;
  // <== SUBMIT CALLBACK — CALLED WITH VALIDATED QUANTITY ==>
  onSubmit: (quantity: number) => void;
}

// <== SALE FORM COMPONENT — SHARED BY MILK AND YOGHURT ENTRY FORMS ==>
const SaleForm = memo(
  ({
    type,
    rate,
    storageKey,
    onRateChange,
    isPending,
    onSubmit,
  }: SaleFormProps) => {
    // IS MILK FOR LABEL AND STYLE SWITCHING
    const isMilk = type === "milk";
    // CONTROLLED INPUT VALUE — PURE REACT STATE, NO RHF INTERFERENCE
    const [inputValue, setInputValue] = useState<string>("");
    // INLINE VALIDATION ERROR — CLEARED ON RESET, SET ON INVALID INPUT
    const [inputError, setInputError] = useState<string | null>(null);
    // DERIVED NUMERIC QUANTITY — 0 WHEN EMPTY OR NON-NUMERIC, NEVER NaN
    const inputQty = parseFloat(inputValue) || 0;
    // COMPUTED PREVIEW TOTAL — DERIVED FROM CONTROLLED VALUE, ALWAYS IN SYNC
    const previewTotal = parseFloat(
      ((inputQty > 0 ? inputQty : 0) * rate).toFixed(2),
    );
    // HANDLE INPUT CHANGE — UPDATE VALUE AND RUN INLINE ZOD VALIDATION
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        // READ RAW STRING FROM THE INPUT
        const str = e.target.value;
        // UPDATE CONTROLLED VALUE — REACT NOW OWNS THIS COMPLETELY
        setInputValue(str);
        // CLEAR ERROR WHEN FIELD IS EMPTY — NO ERROR SHOWN FOR BLANK INPUT
        if (!str) {
          setInputError(null);
          return;
        }
        // PARSE STRING TO NUMBER FOR SCHEMA VALIDATION
        const num = parseFloat(str);
        // VALIDATE AGAINST SCHEMA — COVERS MIN, MAX, AND TYPE ERRORS
        const result = entrySchema.shape.quantity.safeParse(
          Number.isNaN(num) ? undefined : num,
        );
        // APPLY OR CLEAR INLINE ERROR BASED ON RESULT
        setInputError(result.success ? null : result.error.errors[0].message);
      },
      [],
    );
    // HANDLE FORM SUBMIT — FINAL VALIDATE, CALL PARENT, RESET ALL STATE
    const handleFormSubmit = useCallback(
      (e: React.FormEvent<HTMLFormElement>): void => {
        // PREVENT NATIVE BROWSER FORM SUBMISSION
        e.preventDefault();
        // GUARD: ABORT IF NO VALID POSITIVE QUANTITY PRESENT
        if (inputQty <= 0) return;
        // FINAL ZOD VALIDATION BEFORE CALLING PARENT
        const result = entrySchema.safeParse({ quantity: inputQty });
        // SHOW ERROR AND ABORT IF SCHEMA VALIDATION FAILS
        if (!result.success) {
          // SET INLINE ERROR TO FIRST SCHEMA ERROR MESSAGE
          setInputError(result.error.errors[0].message);
          // ABORT SUBMISSION
          return;
        }
        // CALL PARENT WITH VALIDATED QUANTITY
        onSubmit(result.data.quantity);
        // CLEAR CONTROLLED VALUE TO RESET FORM
        setInputValue("");
        // CLEAR ANY DISPLAYED VALIDATION ERROR
        setInputError(null);
      },
      [inputQty, onSubmit],
    );
    // RETURNING SALE FORM
    return (
      <motion.div
        initial={{ opacity: 0, x: isMilk ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* FORM HEADER WITH GRADIENT */}
        <div
          className={cn(
            "px-4 sm:px-5 py-3.5 border-b border-border/50 flex items-center justify-between gap-2",
            isMilk
              ? "bg-gradient-to-r from-blue-500/8 to-transparent"
              : "bg-gradient-to-r from-purple-500/8 to-transparent",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* PRODUCT ICON BADGE */}
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ring-1",
                isMilk
                  ? "bg-blue-500/10 ring-blue-500/20"
                  : "bg-purple-500/10 ring-purple-500/20",
              )}
            >
              {isMilk ? (
                <Milk className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
              ) : (
                <IceCream className="w-[18px] h-[18px] text-purple-600 dark:text-purple-400" />
              )}
            </div>
            {/* FORM TITLE */}
            <h3 className="font-display font-semibold text-sm sm:text-[15px] truncate">
              {isMilk ? "Milk Sale" : "Yoghurt Sale"}
            </h3>
          </div>
          {/* LOCKED RATE DISPLAY */}
          <LockedRateDisplay
            type={type}
            rate={rate}
            storageKey={storageKey}
            onRateChange={onRateChange}
          />
        </div>
        {/* QUANTITY FORM BODY */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-3">
          {/* QUANTITY FIELD */}
          <div>
            <Label
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
              htmlFor={`${type}-qty`}
            >
              Quantity ({isMilk ? "Liters" : "kg"})
            </Label>
            <Input
              id={`${type}-qty`}
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              placeholder={isMilk ? "e.g. 2.5" : "e.g. 1.5"}
              className={cn("mt-1.5 h-10", NO_SPINNER)}
              disabled={isPending}
              value={inputValue}
              onChange={handleChange}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                // PREVENT NEGATIVE AND SCIENTIFIC NOTATION INPUT
                if (e.key === "-" || e.key === "e" || e.key === "E")
                  // PREVENT DEFAULT TO BLOCK THE KEY INPUT
                  e.preventDefault();
              }}
            />
            {/* VALIDATION ERROR — ONLY SHOWN WHEN FIELD HAS A POSITIVE VALUE */}
            {inputError && inputQty > 0 && (
              <p className="text-destructive text-xs mt-1">{inputError}</p>
            )}
          </div>
          {/* LIVE TOTAL PREVIEW */}
          {previewTotal > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg px-3 py-2 flex items-center justify-between border",
                isMilk
                  ? "bg-blue-500/5 border-blue-500/15"
                  : "bg-purple-500/5 border-purple-500/15",
              )}
            >
              <span className="text-xs text-muted-foreground">Total</span>
              <span
                className={cn(
                  "font-display text-sm font-bold",
                  isMilk
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-purple-600 dark:text-purple-400",
                )}
              >
                ₨{previewTotal.toLocaleString()}
              </span>
            </motion.div>
          )}
          {/* SUBMIT BUTTON — ENABLED ONLY WHEN QUANTITY IS POSITIVE AND VALID */}
          <Button
            type="submit"
            className={cn(
              "w-full h-10 text-white gap-2",
              isMilk
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700",
            )}
            disabled={isPending || !(inputQty > 0) || !!inputError}
          >
            <Plus className="w-4 h-4" />
            {isPending
              ? "Recording..."
              : `Add ${isMilk ? "Milk" : "Yoghurt"} Sale`}
          </Button>
        </form>
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SaleForm.displayName = "SaleForm";

// <== QUICK SALE ENTRY PANEL COMPONENT ==>
const QuickSaleEntryPanel = memo(() => {
  // PERSISTED MILK RATE — INITIALISED FROM LOCAL STORAGE WITH FALLBACK TO ₨120
  const [milkRate, setMilkRate] = useState<number>(() =>
    getPersistedRate(MILK_RATE_KEY, 120),
  );
  // PERSISTED YOGHURT RATE — INITIALISED FROM LOCAL STORAGE WITH FALLBACK TO ₨180
  const [yoghurtRate, setYoghurtRate] = useState<number>(() =>
    getPersistedRate(YOGHURT_RATE_KEY, 180),
  );
  // ADD QUICK SALE MUTATION
  const addMutation = useAddQuickSale();
  // HANDLE MILK SALE SUBMIT
  const handleMilkSubmit = useCallback(
    (quantity: number): void => {
      // CALL MUTATION WITH MILK SALE DATA
      addMutation.mutate({ type: "milk", quantity, rate: milkRate });
    },
    [addMutation, milkRate],
  );
  // HANDLE YOGHURT SALE SUBMIT
  const handleYoghurtSubmit = useCallback(
    (quantity: number): void => {
      // CALL MUTATION WITH YOGHURT SALE DATA
      addMutation.mutate({ type: "yoghurt", quantity, rate: yoghurtRate });
    },
    [addMutation, yoghurtRate],
  );
  // RETURNING ENTRY PANEL
  return (
    // TWO-COLUMN GRID — MILK AND YOGHURT FORMS SIDE BY SIDE ON LG AND ABOVE
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* MILK ENTRY FORM */}
      <SaleForm
        type="milk"
        rate={milkRate}
        storageKey={MILK_RATE_KEY}
        onRateChange={setMilkRate}
        isPending={addMutation.isPending}
        onSubmit={handleMilkSubmit}
      />
      {/* YOGHURT ENTRY FORM */}
      <SaleForm
        type="yoghurt"
        rate={yoghurtRate}
        storageKey={YOGHURT_RATE_KEY}
        onRateChange={setYoghurtRate}
        isPending={addMutation.isPending}
        onSubmit={handleYoghurtSubmit}
      />
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
QuickSaleEntryPanel.displayName = "QuickSaleEntryPanel";

// <== EXPORT ==>
export default QuickSaleEntryPanel;
