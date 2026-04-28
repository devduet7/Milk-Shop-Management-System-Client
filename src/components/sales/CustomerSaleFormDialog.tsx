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
import {
  addCustomerSaleSchema,
  type AddCustomerSaleFormValues,
} from "@/validators/saleSchemas";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Sale } from "@/types/sale-types";
import { Button } from "@/components/ui/button";
import { memo, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useAddCustomerSale, useUpdateSale } from "@/hooks/useSales";

// <== CUSTOMER SALE FORM DIALOG PROPS ==>
interface CustomerSaleFormDialogProps {
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

// <== CUSTOMER SALE FORM DIALOG COMPONENT ==>
const CustomerSaleFormDialog = memo(
  ({ open, editSale, onClose }: CustomerSaleFormDialogProps) => {
    // ADD CUSTOMER SALE MUTATION
    const addMutation = useAddCustomerSale();
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
    } = useForm<AddCustomerSaleFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addCustomerSaleSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        customerName: "",
        productType: "milk",
        quantity: undefined as unknown as number,
        pricePerUnit: undefined as unknown as number,
        paidAmount: 0,
        note: "",
      },
    });
    // RESET FORM EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET FORM VALUES
        reset({
          customerName: editSale?.customerName ?? "",
          productType: editSale?.productType ?? "milk",
          quantity: editSale?.quantity ?? (undefined as unknown as number),
          pricePerUnit:
            editSale?.pricePerUnit ?? (undefined as unknown as number),
          paidAmount: editSale?.paidAmount ?? 0,
          note: editSale?.note ?? "",
        });
      }
    }, [open, editSale, reset]);
    // WATCH QUANTITY FOR REACTIVE COMPUTATION
    const watchedQuantity = watch("quantity");
    // WATCH PRICE PER UNIT FOR REACTIVE COMPUTATION
    const watchedPricePerUnit = watch("pricePerUnit");
    // WATCH PAID AMOUNT FOR REACTIVE COMPUTATION
    const watchedPaidAmount = watch("paidAmount");
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
    // COMPUTE PENDING AMOUNT REACTIVELY FROM TOTAL - PAID
    const computedPending = useMemo(() => {
      // PARSE PAID AMOUNT SAFELY
      const paid = Number(watchedPaidAmount) || 0;
      // RETURN COMPUTED PENDING (CANNOT BE NEGATIVE)
      return parseFloat(Math.max(0, computedTotal - paid).toFixed(2));
    }, [computedTotal, watchedPaidAmount]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddCustomerSaleFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        customerName: data.customerName,
        productType: data.productType,
        quantity: data.quantity,
        pricePerUnit: data.pricePerUnit,
        paidAmount: data.paidAmount,
        note: data.note,
      } satisfies AddCustomerSaleFormValues;
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
      // ADD MODE: CREATE NEW CUSTOMER SALE
      addMutation.mutate(payload, { onSuccess: onClose });
    };
    // RETURNING CUSTOMER SALE FORM DIALOG
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
              {editSale ? "Edit" : "Add"} Customer Sale
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editSale ? "Edit an existing sale" : "Add a new sale"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* CUSTOMER NAME FIELD */}
            <div>
              <Label htmlFor="csf-customerName">Customer Name</Label>
              <Input
                id="csf-customerName"
                placeholder="e.g. Ali Khan"
                className="mt-1.5"
                disabled={isPending}
                {...register("customerName")}
              />
              {/* CUSTOMER NAME VALIDATION ERROR */}
              {errors.customerName && (
                <p className="text-destructive text-xs mt-1">
                  {errors.customerName.message}
                </p>
              )}
            </div>
            {/* PRODUCT TYPE FIELD */}
            <div>
              <Label htmlFor="csf-productType">Product</Label>
              <Controller
                control={control}
                name="productType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="csf-productType" className="mt-1.5">
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
                <Label htmlFor="csf-quantity">
                  Quantity ({watchedProductType === "milk" ? "L" : "kg"})
                </Label>
                <Input
                  id="csf-quantity"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 10"
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
                <Label htmlFor="csf-pricePerUnit">
                  Price / {watchedProductType === "milk" ? "L" : "kg"} (₨)
                </Label>
                <Input
                  id="csf-pricePerUnit"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 120"
                  // HIDE NATIVE BROWSER SPINNER ARROWS
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
            {/* PAID AMOUNT FIELD */}
            <div>
              <Label htmlFor="csf-paidAmount">Paid Amount (₨)</Label>
              <Input
                id="csf-paidAmount"
                type="number"
                inputMode="numeric"
                placeholder="Enter amount paid"
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
            {/* COMPUTED PENDING AMOUNT DISPLAY */}
            <div
              className={`rounded-lg px-3.5 py-2.5 flex items-center justify-between ${
                computedPending > 0 ? "bg-red-500/10" : "bg-emerald-500/10"
              }`}
            >
              <span className="text-sm text-muted-foreground">Pending</span>
              <span
                className={`font-display font-bold text-sm ${
                  computedPending > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {computedPending > 0
                  ? `₨${computedPending.toLocaleString()}`
                  : "Fully Paid"}
              </span>
            </div>
            {/* NOTE FIELD */}
            <div>
              <Label htmlFor="csf-note">
                Note{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="csf-note"
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
                `${editSale ? "Update" : "Add"} Customer Sale`
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
CustomerSaleFormDialog.displayName = "CustomerSaleFormDialog";

// <== EXPORT ==>
export default CustomerSaleFormDialog;
