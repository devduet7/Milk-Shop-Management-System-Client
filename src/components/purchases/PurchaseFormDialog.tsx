// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addPurchaseSchema,
  type AddPurchaseFormValues,
} from "@/validators/purchaseSchemas";
import { memo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Purchase } from "@/types/purchase-types";
import { useAddPurchase, useUpdatePurchase } from "@/hooks/usePurchases";

// <== PURCHASE FORM DIALOG PROPS ==>
interface PurchaseFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== PURCHASE TO EDIT (NULL = ADD MODE) ==>
  editPurchase: Purchase | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== PURCHASE FORM DIALOG COMPONENT ==>
const PurchaseFormDialog = memo(
  ({ open, editPurchase, onClose }: PurchaseFormDialogProps) => {
    // ADD PURCHASE MUTATION
    const addMutation = useAddPurchase();
    // UPDATE PURCHASE MUTATION
    const updateMutation = useUpdatePurchase();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddPurchaseFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addPurchaseSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        supplier: "",
        milkQuantity: undefined as unknown as number,
        totalCost: undefined as unknown as number,
        note: "",
      },
    });
    // RESET FORM EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET FORM VALUES
        reset({
          supplier: editPurchase?.supplier ?? "",
          milkQuantity:
            editPurchase?.milkQuantity ?? (undefined as unknown as number),
          totalCost:
            editPurchase?.totalCost ?? (undefined as unknown as number),
          note: editPurchase?.note ?? "",
        });
      }
    }, [open, editPurchase, reset]);

    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddPurchaseFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        supplier: data.supplier,
        milkQuantity: data.milkQuantity,
        totalCost: data.totalCost,
        note: data.note,
      } satisfies AddPurchaseFormValues;
      // EDIT MODE: UPDATE EXISTING PURCHASE
      if (editPurchase) {
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { id: editPurchase._id, data: payload },
          // CLOSE DIALOG ON SUCCESS
          { onSuccess: onClose },
        );
        // RETURN FROM FUNCTION
        return;
      }
      // ADD MODE: CREATE NEW PURCHASE
      addMutation.mutate(payload, { onSuccess: onClose });
    };

    // RETURNING PURCHASE FORM DIALOG
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
              {editPurchase ? "Edit" : "Add"} Purchase
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editPurchase
                ? "Edit an existing purchase"
                : "Add a new purchase"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* SUPPLIER FIELD */}
            <div>
              <Label htmlFor="pf-supplier">Supplier</Label>
              <Input
                id="pf-supplier"
                placeholder="e.g. Farm A"
                className="mt-1.5"
                disabled={isPending}
                {...register("supplier")}
              />
              {/* SUPPLIER VALIDATION ERROR */}
              {errors.supplier && (
                <p className="text-destructive text-xs mt-1">
                  {errors.supplier.message}
                </p>
              )}
            </div>
            {/* MILK QUANTITY AND TOTAL COST GRID */}
            <div className="grid grid-cols-2 gap-3">
              {/* MILK QUANTITY FIELD */}
              <div>
                <Label htmlFor="pf-milkQuantity">Milk Qty (L)</Label>
                <Input
                  id="pf-milkQuantity"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 50"
                  // HIDE NATIVE BROWSER SPINNER ARROWS
                  className={`mt-1.5 ${NO_SPINNER}`}
                  disabled={isPending}
                  {...register("milkQuantity", { valueAsNumber: true })}
                />
                {/* MILK QUANTITY VALIDATION ERROR */}
                {errors.milkQuantity && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.milkQuantity.message}
                  </p>
                )}
              </div>
              {/* TOTAL COST FIELD */}
              <div>
                <Label htmlFor="pf-totalCost">Total Cost (₨)</Label>
                <Input
                  id="pf-totalCost"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  // HIDE NATIVE BROWSER SPINNER ARROWS
                  className={`mt-1.5 ${NO_SPINNER}`}
                  disabled={isPending}
                  {...register("totalCost", { valueAsNumber: true })}
                />
                {/* TOTAL COST VALIDATION ERROR */}
                {errors.totalCost && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.totalCost.message}
                  </p>
                )}
              </div>
            </div>
            {/* NOTE FIELD */}
            <div>
              <Label htmlFor="pf-note">
                Note{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="pf-note"
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
                  {editPurchase ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editPurchase ? "Update" : "Add"} Purchase`
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PurchaseFormDialog.displayName = "PurchaseFormDialog";

// <== EXPORT ==>
export default PurchaseFormDialog;
