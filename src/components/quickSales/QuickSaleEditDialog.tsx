// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  editQuickSaleSchema,
  type EditQuickSaleFormValues,
} from "@/validators/quickSaleSchemas";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateQuickSale } from "@/hooks/useQuickSales";
import { Loader2, Milk, IceCream, Edit2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { QuickSale, QuickSaleType } from "@/types/quick-sale-types";

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== QUICK SALE EDIT DIALOG PROPS ==>
interface QuickSaleEditDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== QUICK SALE RECORD TO EDIT ==>
  record: QuickSale | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== QUICK SALE EDIT DIALOG COMPONENT ==>
const QuickSaleEditDialog = memo(
  ({ open, record, onClose }: QuickSaleEditDialogProps) => {
    // UPDATE MUTATION
    const updateMutation = useUpdateQuickSale();
    // PENDING STATE
    const isPending = updateMutation.isPending;
    // LOCAL TYPE STATE — MANAGED OUTSIDE RHF TO AVOID HIDDEN INPUT COMPLEXITY
    const [selectedType, setSelectedType] = useState<QuickSaleType>(
      record?.type ?? "milk",
    );
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm<EditQuickSaleFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(editQuickSaleSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        quantity: undefined as unknown as number,
        rate: undefined as unknown as number,
        date: "",
        note: "",
      },
    });
    // RESET FORM AND LOCAL TYPE WHEN DIALOG OPENS WITH A NEW RECORD
    useEffect(() => {
      // IF OPEN AND RECORD EXISTS
      if (open && record) {
        // SYNC LOCAL TYPE STATE WITH RECORD
        setSelectedType(record.type);
        // RESET FORM WITH RECORD VALUES
        reset({
          quantity: record.quantity,
          rate: record.rate,
          date: record.date,
          note: record.note ?? "",
        });
      }
    }, [open, record, reset]);
    // WATCH QUANTITY FOR TOTAL COMPUTATION
    const watchedQty = watch("quantity");
    // WATCH RATE FOR TOTAL COMPUTATION
    const watchedRate = watch("rate");
    // COMPUTE NEW TOTAL REACTIVELY
    const newTotal = useMemo(
      () =>
        parseFloat(
          ((Number(watchedQty) || 0) * (Number(watchedRate) || 0)).toFixed(2),
        ),
      [watchedQty, watchedRate],
    );
    // HANDLE TYPE TOGGLE
    const handleTypeSelect = useCallback((type: QuickSaleType): void => {
      // UPDATE LOCAL TYPE STATE
      setSelectedType(type);
    }, []);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: EditQuickSaleFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        quantity: data.quantity,
        rate: data.rate,
        date: data.date,
        note: data.note,
      } satisfies EditQuickSaleFormValues;
      // GUARD: NO RECORD
      if (!record) return;
      // COMBINE FORM DATA WITH LOCAL TYPE STATE
      updateMutation.mutate(
        {
          id: record._id,
          data: { ...payload, type: selectedType },
        },
        // CLOSE DIALOG ON SUCCESS
        { onSuccess: onClose },
      );
    };
    // IS MILK FOR LABEL SWITCHING
    const isMilk = selectedType === "milk";
    // RETURNING QUICK SALE EDIT DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !isPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* EDIT ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <Edit2 className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  Edit Sale Record
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  Update the sale details below
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* FORM — FLEX COLUMN TO SUPPORT FIXED FOOTER */}
          {record && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* SCROLLABLE FORM BODY */}
              <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
                {/* TYPE TOGGLE */}
                <div>
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Product Type
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {/* MILK BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleTypeSelect("milk")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200",
                        selectedType === "milk"
                          ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Milk className="w-4 h-4" />
                      Milk
                    </button>
                    {/* YOGHURT BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleTypeSelect("yoghurt")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200",
                        selectedType === "yoghurt"
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <IceCream className="w-4 h-4" />
                      Yoghurt
                    </button>
                  </div>
                </div>
                {/* QUANTITY AND RATE — 2-COLUMN GRID */}
                <div className="grid grid-cols-2 gap-3">
                  {/* QUANTITY FIELD */}
                  <div>
                    <Label
                      htmlFor="eq-quantity"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Qty ({isMilk ? "L" : "kg"})
                    </Label>
                    <Input
                      id="eq-quantity"
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      className={cn("mt-1.5 h-10", NO_SPINNER)}
                      disabled={isPending}
                      {...register("quantity", { valueAsNumber: true })}
                    />
                    {/* QUANTITY VALIDATION ERROR */}
                    {errors.quantity && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                  {/* RATE FIELD */}
                  <div>
                    <Label
                      htmlFor="eq-rate"
                      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      Rate (₨/{isMilk ? "L" : "kg"})
                    </Label>
                    <Input
                      id="eq-rate"
                      type="number"
                      inputMode="numeric"
                      className={cn("mt-1.5 h-10", NO_SPINNER)}
                      disabled={isPending}
                      {...register("rate", { valueAsNumber: true })}
                    />
                    {/* RATE VALIDATION ERROR */}
                    {errors.rate && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.rate.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* LIVE TOTAL PREVIEW */}
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 flex items-center justify-between border transition-all duration-200",
                    newTotal > 0
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/40 border-border/50",
                  )}
                >
                  <span className="text-xs text-muted-foreground font-medium">
                    New Total
                  </span>
                  <span className="font-display font-bold text-sm">
                    {newTotal > 0 ? `₨${newTotal.toLocaleString()}` : "—"}
                  </span>
                </div>
                {/* DATE FIELD */}
                <div>
                  <Label
                    htmlFor="eq-date"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Date{" "}
                    <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                      (YYYY-MM-DD)
                    </span>
                  </Label>
                  <Input
                    id="eq-date"
                    placeholder="e.g. 2026-05-02"
                    className="mt-1.5 h-10"
                    disabled={isPending}
                    {...register("date")}
                  />
                  {/* DATE VALIDATION ERROR */}
                  {errors.date && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                {/* NOTE FIELD */}
                <div>
                  <Label
                    htmlFor="eq-note"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Note{" "}
                    <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="eq-note"
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
QuickSaleEditDialog.displayName = "QuickSaleEditDialog";

// <== EXPORT ==>
export default QuickSaleEditDialog;
