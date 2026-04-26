// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addCustomerSchema,
  type AddCustomerFormValues,
} from "@/validators/customerSchemas";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer } from "@/types/customer-types";
import { useAddCustomer, useUpdateCustomer } from "@/hooks/useCustomers";

// <== CUSTOMER FORM DIALOG PROPS ==>
interface CustomerFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== CUSTOMER TO EDIT (NULL = ADD MODE) ==>
  editCustomer: Customer | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== CUSTOMER FORM DIALOG COMPONENT ==>
const CustomerFormDialog = memo(
  ({ open, editCustomer, onClose }: CustomerFormDialogProps) => {
    // ADD CUSTOMER MUTATION
    const addMutation = useAddCustomer();
    // UPDATE CUSTOMER MUTATION
    const updateMutation = useUpdateCustomer();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddCustomerFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addCustomerSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        name: "",
        phone: "",
        address: "",
        dailyMilk: 1,
        pricePerLiter: 180,
      },
    });
    // RESET FORM EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET FORM VALUES
        reset({
          name: editCustomer?.name ?? "",
          phone: editCustomer?.phone ?? "",
          address: editCustomer?.address ?? "",
          dailyMilk: editCustomer?.dailyMilk ?? 1,
          pricePerLiter: editCustomer?.pricePerLiter ?? 180,
        });
      }
    }, [open, editCustomer, reset]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddCustomerFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        name: data.name,
        phone: data.phone ?? "",
        address: data.address ?? "",
        dailyMilk: data.dailyMilk,
        pricePerLiter: data.pricePerLiter,
      } satisfies AddCustomerFormValues;
      // EDIT MODE: UPDATE EXISTING CUSTOMER
      if (editCustomer) {
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { id: editCustomer._id, data: payload },
          // CLOSE DIALOG ON SUCCESS
          { onSuccess: onClose },
        );
        // RETURN FROM FUNCTION
        return;
      }
      // ADD MODE: CREATE NEW CUSTOMER
      addMutation.mutate(payload, { onSuccess: onClose });
    };
    // RETURNING CUSTOMER FORM DIALOG
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
              {editCustomer ? "Edit" : "Add"} Customer
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editCustomer
                ? "Edit an existing customer"
                : "Add a new customer"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* NAME FIELD */}
            <div>
              <Label htmlFor="cf-name">Name</Label>
              <Input
                id="cf-name"
                placeholder="Customer name"
                className="mt-1.5"
                disabled={isPending}
                {...register("name")}
              />
              {/* NAME VALIDATION ERROR */}
              {errors.name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* PHONE FIELD */}
            <div>
              <Label htmlFor="cf-phone">
                Phone{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="cf-phone"
                placeholder="e.g. 0300-1234567"
                className="mt-1.5"
                disabled={isPending}
                {...register("phone")}
              />
              {/* PHONE VALIDATION ERROR */}
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            {/* ADDRESS FIELD */}
            <div>
              <Label htmlFor="cf-address">
                Address{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="cf-address"
                placeholder="Customer address"
                className="mt-1.5"
                disabled={isPending}
                {...register("address")}
              />
              {/* ADDRESS VALIDATION ERROR */}
              {errors.address && (
                <p className="text-destructive text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
            {/* MILK AND RATE GRID */}
            <div className="grid grid-cols-2 gap-3">
              {/* DAILY MILK FIELD */}
              <div>
                <Label htmlFor="cf-dailyMilk">Daily Milk (L)</Label>
                <Input
                  id="cf-dailyMilk"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 1.5"
                  // HIDE NATIVE BROWSER SPINNER ARROWS
                  className={`mt-1.5 ${NO_SPINNER}`}
                  disabled={isPending}
                  {...register("dailyMilk", { valueAsNumber: true })}
                />
                {/* DAILY MILK VALIDATION ERROR */}
                {errors.dailyMilk && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.dailyMilk.message}
                  </p>
                )}
              </div>
              {/* PRICE PER LITER FIELD */}
              <div>
                <Label htmlFor="cf-pricePerLiter">Price/Liter (₨)</Label>
                <Input
                  id="cf-pricePerLiter"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 180"
                  // HIDE NATIVE BROWSER SPINNER ARROWS
                  className={`mt-1.5 ${NO_SPINNER}`}
                  disabled={isPending}
                  {...register("pricePerLiter", { valueAsNumber: true })}
                />
                {/* PRICE VALIDATION ERROR */}
                {errors.pricePerLiter && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.pricePerLiter.message}
                  </p>
                )}
              </div>
            </div>
            {/* SUBMIT BUTTON */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editCustomer ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editCustomer ? "Update" : "Add"} Customer`
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
CustomerFormDialog.displayName = "CustomerFormDialog";

// <== EXPORT ==>
export default CustomerFormDialog;
