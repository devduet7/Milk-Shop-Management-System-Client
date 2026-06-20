// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addCustomerSchema,
  type AddCustomerFormValues,
} from "@/validators/customerSchemas";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Users, Loader2 } from "lucide-react";
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
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE — CUSTOMER INITIAL IN EDIT MODE, USERS ICON IN ADD MODE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                {editCustomer ? (
                  <span className="text-base font-bold text-primary">
                    {editCustomer.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Users className="w-[18px] h-[18px] text-primary" />
                )}
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  {editCustomer ? "Edit" : "Add"} Customer
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {editCustomer
                    ? "Update customer details below"
                    : "Fill in the details to add a new customer"}
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
              {/* NAME FIELD */}
              <div>
                <Label
                  htmlFor="cf-name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="cf-name"
                  placeholder="Customer name"
                  className="mt-1.5 h-10"
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
                <Label
                  htmlFor="cf-phone"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Phone{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cf-phone"
                  placeholder="e.g. 0300-1234567"
                  className="mt-1.5 h-10"
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
                <Label
                  htmlFor="cf-address"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Address{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cf-address"
                  placeholder="Customer address"
                  className="mt-1.5 h-10"
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
                  <Label
                    htmlFor="cf-dailyMilk"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Daily Milk (L)
                  </Label>
                  <Input
                    id="cf-dailyMilk"
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 1.5"
                    className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                  <Label
                    htmlFor="cf-pricePerLiter"
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Price/Liter (₨)
                  </Label>
                  <Input
                    id="cf-pricePerLiter"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 180"
                    className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                    {editCustomer ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  `${editCustomer ? "Update" : "Add"} Customer`
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
CustomerFormDialog.displayName = "CustomerFormDialog";

// <== EXPORT ==>
export default CustomerFormDialog;
