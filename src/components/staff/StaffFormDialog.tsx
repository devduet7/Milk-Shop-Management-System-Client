// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addStaffSchema,
  updateStaffSchema,
  type AddStaffFormValues,
  type UpdateStaffFormValues,
} from "@/validators/staffSchemas";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Users, Loader2 } from "lucide-react";
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
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE — STAFF INITIAL IN EDIT MODE, USERS ICON IN ADD MODE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                {isEditMode ? (
                  <span className="text-base font-bold text-primary">
                    {editStaff.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Users className="w-[18px] h-[18px] text-primary" />
                )}
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  {isEditMode ? `Edit — ${editStaff.name}` : "Add Staff Member"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {isEditMode
                    ? "Update staff member details below"
                    : "Fill in the details to add a new staff member"}
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
                  htmlFor="sf-name"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="sf-name"
                  placeholder="e.g. Ahmed Raza"
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
              {/* MONTHLY SALARY FIELD */}
              <div>
                <Label
                  htmlFor="sf-salary"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Monthly Salary (₨)
                </Label>
                <Input
                  id="sf-salary"
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter monthly salary"
                  className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                <Label
                  htmlFor="sf-note"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Note{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="sf-note"
                  placeholder="e.g. Driver, part-time..."
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
                    {isEditMode ? "Saving..." : "Adding..."}
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Add Staff Member"
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
StaffFormDialog.displayName = "StaffFormDialog";

// <== EXPORT ==>
export default StaffFormDialog;
