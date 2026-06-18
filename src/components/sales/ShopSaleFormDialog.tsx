// <== IMPORTS ==>
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
import {
  addShopSaleSchema,
  type AddShopSaleFormValues,
} from "@/validators/saleSchemas";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Sale } from "@/types/sale-types";
import { Button } from "@/components/ui/button";
import { memo, useEffect, useMemo } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useAddShopSale, useUpdateSale } from "@/hooks/useSales";

// <== SHOP SALE FORM DIALOG PROPS ==>
interface ShopSaleFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== SALE TO EDIT (NULL = ADD MODE) ==>
  editSale: Sale | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== SHOP SALE FORM DIALOG COMPONENT ==>
const ShopSaleFormDialog = memo(
  ({ open, editSale, onClose }: ShopSaleFormDialogProps) => {
    // ADD SHOP SALE MUTATION
    const addMutation = useAddShopSale();
    // UPDATE SALE MUTATION (SHARED)
    const updateMutation = useUpdateSale();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      watch,
      control,
      formState: { errors },
    } = useForm<AddShopSaleFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addShopSaleSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        productType: "milk",
        quantity: undefined as unknown as number,
        pricePerUnit: undefined as unknown as number,
        note: "",
      },
    });
    // RESET FORM EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET FORM VALUES
        reset({
          productType: editSale?.productType ?? "milk",
          quantity: editSale?.quantity ?? (undefined as unknown as number),
          pricePerUnit:
            editSale?.pricePerUnit ?? (undefined as unknown as number),
          note: editSale?.note ?? "",
        });
      }
    }, [open, editSale, reset]);
    // WATCH QUANTITY FOR REACTIVE COMPUTATION
    const watchedQuantity = watch("quantity");
    // WATCH PRICE PER UNIT FOR REACTIVE COMPUTATION
    const watchedPricePerUnit = watch("pricePerUnit");
    // WATCH PRODUCT TYPE FOR REACTIVE COMPUTATION
    const watchedProductType = watch("productType");
    // COMPUTE TOTAL AMOUNT REACTIVELY FROM QUANTITY × PRICE PER UNIT
    const computedTotal = useMemo(() => {
      // PARSING WATCHED QUANTITY SAFELY
      const q = Number(watchedQuantity) || 0;
      // PARSING WATCHED PRICE PER UNIT SAFELY
      const p = Number(watchedPricePerUnit) || 0;
      // RETURN COMPUTED TOTAL
      return parseFloat((q * p).toFixed(2));
    }, [watchedQuantity, watchedPricePerUnit]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddShopSaleFormValues): void => {
      const payload = {
        productType: data.productType,
        quantity: data.quantity,
        pricePerUnit: data.pricePerUnit,
        note: data.note,
      } satisfies AddShopSaleFormValues;
      // EDIT MODE: UPDATE EXISTING SALE
      if (editSale) {
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { id: editSale._id, data: payload },
          // CLOSE DIALOG ON SUCCESS
          { onSuccess: onClose },
        );
        // RETURN FROM FUNCTION
        return;
      }
      // ADD MODE: CREATE NEW SHOP SALE
      addMutation.mutate(payload, { onSuccess: onClose });
    };
    // RETURNING SHOP SALE FORM DIALOG
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
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <ShoppingCart className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  {editSale ? "Edit" : "Add"} Shop Sale
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {editSale
                    ? "Update the sale details below"
                    : "Fill in the details to record a new sale"}
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
              {/* PRODUCT TYPE FIELD */}
              <div>
                <Label
                  htmlFor="ssf-productType"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Product
                </Label>
                <Controller
                  control={control}
                  name="productType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="ssf-productType"
                        className="mt-1.5 h-10"
                      >
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milk">Milk (Liters)</SelectItem>
                        <SelectItem value="yoghurt">Yoghurt (Kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {/* PRODUCT TYPE VALIDATION ERROR */}
                {errors.productType && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.productType.message}
                  </p>
                )}
              </div>
              {/* QUANTITY AND PRICE PER UNIT GRID */}
              <div className="grid grid-cols-2 gap-3">
                {/* QUANTITY FIELD */}
                <div>
                  <Label
                    htmlFor="ssf-quantity"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Qty ({watchedProductType === "milk" ? "L" : "kg"})
                  </Label>
                  <Input
                    id="ssf-quantity"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 20"
                    className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                {/* PRICE PER UNIT FIELD */}
                <div>
                  <Label
                    htmlFor="ssf-pricePerUnit"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Price / {watchedProductType === "milk" ? "L" : "kg"} (₨)
                  </Label>
                  <Input
                    id="ssf-pricePerUnit"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 120"
                    className={`mt-1.5 h-10 ${NO_SPINNER}`}
                    disabled={isPending}
                    {...register("pricePerUnit", { valueAsNumber: true })}
                  />
                  {/* PRICE PER UNIT VALIDATION ERROR */}
                  {errors.pricePerUnit && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.pricePerUnit.message}
                    </p>
                  )}
                </div>
              </div>
              {/* COMPUTED TOTAL AMOUNT DISPLAY */}
              <div
                className={cn(
                  "rounded-xl px-4 py-3 flex items-center justify-between border transition-all duration-200",
                  computedTotal > 0
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/40 border-border/50",
                )}
              >
                <span className="text-xs text-muted-foreground font-medium">
                  Total Amount
                </span>
                <span className="font-display font-bold text-sm">
                  {computedTotal > 0
                    ? `₨${computedTotal.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              {/* FULLY PAID NOTICE */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Payment
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Always Fully Paid
                </span>
              </div>
              {/* NOTE FIELD */}
              <div>
                <Label
                  htmlFor="ssf-note"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Note{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ssf-note"
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
                    {editSale ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  `${editSale ? "Update" : "Add"} Sale`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ShopSaleFormDialog.displayName = "ShopSaleFormDialog";

// <== EXPORT ==>
export default ShopSaleFormDialog;
