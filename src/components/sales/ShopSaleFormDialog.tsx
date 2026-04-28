// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
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
import { memo, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Sale } from "@/types/sale-types";
import { useAddShopSale, useUpdateSale } from "@/hooks/useSales";
import {
  addShopSaleSchema,
  type AddShopSaleFormValues,
} from "@/validators/saleSchemas";

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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* DIALOG HEADER */}
          <DialogHeader>
            <DialogTitle className="font-display">
              {editSale ? "Edit" : "Add"} Shop Sale
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editSale ? "Edit an existing sale" : "Add a new sale"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* PRODUCT TYPE FIELD */}
            <div>
              <Label htmlFor="ssf-productType">Product</Label>
              <Controller
                control={control}
                name="productType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="ssf-productType" className="mt-1.5">
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
                <Label htmlFor="ssf-quantity">
                  Quantity ({watchedProductType === "milk" ? "L" : "kg"})
                </Label>
                <Input
                  id="ssf-quantity"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 20"
                  className={`mt-1.5 ${NO_SPINNER}`}
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
                <Label htmlFor="ssf-pricePerUnit">
                  Price / {watchedProductType === "milk" ? "L" : "kg"} (₨)
                </Label>
                <Input
                  id="ssf-pricePerUnit"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 120"
                  className={`mt-1.5 ${NO_SPINNER}`}
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
            <div className="bg-muted/50 rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Amount
              </span>
              <span className="font-display font-bold text-sm">
                ₨{computedTotal.toLocaleString()}
              </span>
            </div>
            {/* FULLY PAID NOTICE */}
            <div className="bg-emerald-500/10 rounded-lg px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Always Fully Paid
              </span>
            </div>
            {/* NOTE FIELD */}
            <div>
              <Label htmlFor="ssf-note">
                Note{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="ssf-note"
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
                  {editSale ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editSale ? "Update" : "Add"} Shop Sale`
              )}
            </Button>
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
