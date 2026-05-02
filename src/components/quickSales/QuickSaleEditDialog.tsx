// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
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
import { Loader2, Milk, IceCream } from "lucide-react";
import { useUpdateQuickSale } from "@/hooks/useQuickSales";
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
      // DIALOG WRAPPER
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !isPending) onClose();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* DIALOG HEADER */}
          <DialogHeader>
            <DialogTitle className="font-display">Edit Sale Record</DialogTitle>
            <DialogDescription className="sr-only">
              Edit quick sale record details
            </DialogDescription>
          </DialogHeader>
          {record && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              {/* TYPE TOGGLE */}
              <div>
                <Label>Product Type</Label>
                <div className="flex gap-2 mt-1.5">
                  {/* MILK BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("milk")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all duration-200",
                      selectedType === "milk"
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400"
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
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all duration-200",
                      selectedType === "yoghurt"
                        ? "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400"
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
                  <Label htmlFor="eq-quantity">
                    Quantity ({isMilk ? "L" : "kg"})
                  </Label>
                  <Input
                    id="eq-quantity"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    className={cn("mt-1.5", NO_SPINNER)}
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
                  <Label htmlFor="eq-rate">
                    Rate (₨/{isMilk ? "L" : "kg"})
                  </Label>
                  <Input
                    id="eq-rate"
                    type="number"
                    inputMode="numeric"
                    className={cn("mt-1.5", NO_SPINNER)}
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
                  "rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-colors",
                  newTotal > 0 ? "bg-muted/50" : "bg-muted/30",
                )}
              >
                <span className="text-sm text-muted-foreground">New Total</span>
                <span className="font-display font-bold text-sm">
                  {newTotal > 0 ? `₨${newTotal.toLocaleString()}` : "—"}
                </span>
              </div>
              {/* DATE FIELD */}
              <div>
                <Label htmlFor="eq-date">
                  Date{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (YYYY-MM-DD)
                  </span>
                </Label>
                <Input
                  id="eq-date"
                  placeholder="e.g. 2026-05-02"
                  className="mt-1.5"
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
                <Label htmlFor="eq-note">
                  Note{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="eq-note"
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
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
