// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addStaffSchema,
  updateStaffSchema,
  type AddStaffFormValues,
  type UpdateStaffFormValues,
} from "@/validators/staffSchemas";
import { Loader2 } from "lucide-react";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StaffMember } from "@/types/staff-types";
import { useAddStaff, useUpdateStaff } from "@/hooks/useStaff";

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== STAFF FORM DIALOG PROPS ==>
interface StaffFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== STAFF MEMBER TO EDIT (NULL FOR ADD MODE) ==>
  editStaff: StaffMember | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== STAFF FORM DIALOG COMPONENT ==>
const StaffFormDialog = memo(
  ({ open, editStaff, onClose }: StaffFormDialogProps) => {
    // DETERMINE IF IN EDIT MODE
    const isEditMode = editStaff !== null;
    // ADD STAFF MUTATION
    const addMutation = useAddStaff();
    // UPDATE STAFF MUTATION
    const updateMutation = useUpdateStaff();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER — SCHEMA SWITCHES BASED ON MODE
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddStaffFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(isEditMode ? updateStaffSchema : addStaffSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        name: "",
        monthlySalary: undefined as unknown as number,
        note: "",
      },
    });
    // RESET FORM WHEN DIALOG OPENS OR EDIT TARGET CHANGES
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET WITH EDIT VALUES OR BLANK FOR ADD
        reset(
          isEditMode
            ? {
                name: editStaff.name,
                monthlySalary: editStaff.monthlySalary,
                note: editStaff.note ?? "",
              }
            : {
                name: "",
                monthlySalary: undefined as unknown as number,
                note: "",
              },
        );
      }
    }, [open, editStaff, isEditMode, reset]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddStaffFormValues): void => {
      // IF IN EDIT MODE — CALL UPDATE MUTATION
      if (isEditMode) {
        // BUILDING UPDATE PAYLOAD WITH ONLY CHANGED FIELDS
        const payload: UpdateStaffFormValues = {};
        // ONLY INCLUDE NAME IF CHANGED
        if (data.name !== undefined) payload.name = data.name;
        // ONLY INCLUDE SALARY IF CHANGED
        if (data.monthlySalary !== undefined)
          payload.monthlySalary = data.monthlySalary;
        // ONLY INCLUDE NOTE IF CHANGED
        if (data.note !== undefined) payload.note = data.note;
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { staffId: editStaff._id, data: payload },
          { onSuccess: onClose },
        );
        // RETURN EARLY
        return;
      }
      // IF IN ADD MODE — CALL ADD MUTATION
      addMutation.mutate(data, { onSuccess: onClose });
    };
    // RETURNING STAFF FORM DIALOG
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
              {isEditMode ? `Edit — ${editStaff.name}` : "Add Staff Member"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEditMode
                ? "Update staff member details"
                : "Add a new staff member"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* NAME FIELD */}
            <div>
              <Label htmlFor="sf-name">Full Name</Label>
              <Input
                id="sf-name"
                placeholder="e.g. Ahmed Raza"
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
            {/* MONTHLY SALARY FIELD */}
            <div>
              <Label htmlFor="sf-salary">Monthly Salary (₨)</Label>
              <Input
                id="sf-salary"
                type="number"
                inputMode="numeric"
                placeholder="Enter monthly salary"
                className={`mt-1.5 ${NO_SPINNER}`}
                disabled={isPending}
                {...register("monthlySalary", { valueAsNumber: true })}
              />
              {/* SALARY VALIDATION ERROR */}
              {errors.monthlySalary && (
                <p className="text-destructive text-xs mt-1">
                  {errors.monthlySalary.message}
                </p>
              )}
            </div>
            {/* NOTE FIELD */}
            <div>
              <Label htmlFor="sf-note">
                Note{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="sf-note"
                placeholder="e.g. Driver, part-time..."
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
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Staff Member"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
StaffFormDialog.displayName = "StaffFormDialog";

// <== EXPORT ==>
export default StaffFormDialog;
