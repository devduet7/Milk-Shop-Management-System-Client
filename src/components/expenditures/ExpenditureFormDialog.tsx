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
  useAddExpenditure,
  useUpdateExpenditure,
} from "@/hooks/useExpenditures";
import {
  addExpenditureSchema,
  type AddExpenditureFormValues,
} from "@/validators/expenditureSchemas";
import { Loader2 } from "lucide-react";
import { memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Expenditure } from "@/types/expenditure-types";

// <== EXPENDITURE FORM DIALOG PROPS ==>
interface ExpenditureFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== EXPENDITURE TO EDIT (NULL = ADD MODE) ==>
  editExpenditure: Expenditure | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== NO SPINNER CLASS — HIDES BROWSER NATIVE NUMBER INPUT ARROWS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== EXPENDITURE FORM DIALOG COMPONENT ==>
const ExpenditureFormDialog = memo(
  ({ open, editExpenditure, onClose }: ExpenditureFormDialogProps) => {
    // ADD EXPENDITURE MUTATION
    const addMutation = useAddExpenditure();
    // UPDATE EXPENDITURE MUTATION
    const updateMutation = useUpdateExpenditure();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors },
    } = useForm<AddExpenditureFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addExpenditureSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        title: "",
        category: "supplies",
        amount: undefined as unknown as number,
        note: "",
      },
    });
    // RESET FORM EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // RESET FORM VALUES
        reset({
          title: editExpenditure?.title ?? "",
          category: editExpenditure?.category ?? "supplies",
          amount: editExpenditure?.amount as
            | number
            | undefined as unknown as number,
          note: editExpenditure?.note ?? "",
        });
      }
    }, [open, editExpenditure, reset]);
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddExpenditureFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION
      const payload = {
        title: data.title,
        category: data.category,
        amount: data.amount,
        note: data.note,
      } satisfies AddExpenditureFormValues;
      // EDIT MODE: UPDATE EXISTING EXPENDITURE
      if (editExpenditure) {
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { id: editExpenditure._id, data: payload },
          // CLOSE DIALOG ON SUCCESS
          { onSuccess: onClose },
        );
        // RETURN FROM FUNCTION
        return;
      }
      // ADD MODE: CREATE NEW EXPENDITURE
      addMutation.mutate(payload, { onSuccess: onClose });
    };
    // RETURNING EXPENDITURE FORM DIALOG
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
              {editExpenditure ? "Edit" : "Add"} Expenditure
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editExpenditure
                ? "Edit an existing expenditure"
                : "Add a new expenditure"}
            </DialogDescription>
          </DialogHeader>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* TITLE FIELD */}
            <div>
              <Label htmlFor="ef-title">Title</Label>
              <Input
                id="ef-title"
                placeholder="e.g. Shopping Bags"
                className="mt-1.5"
                disabled={isPending}
                {...register("title")}
              />
              {/* TITLE VALIDATION ERROR */}
              {errors.title && (
                <p className="text-destructive text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            {/* CATEGORY FIELD */}
            <div>
              <Label htmlFor="ef-category">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="ef-category" className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="misc">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {/* CATEGORY VALIDATION ERROR */}
              {errors.category && (
                <p className="text-destructive text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            {/* AMOUNT FIELD */}
            <div>
              <Label htmlFor="ef-amount">Amount (₨)</Label>
              <Input
                id="ef-amount"
                type="number"
                inputMode="numeric"
                placeholder="e.g. 1500"
                // HIDE NATIVE BROWSER SPINNER ARROWS
                className={`mt-1.5 ${NO_SPINNER}`}
                disabled={isPending}
                {...register("amount", { valueAsNumber: true })}
              />
              {/* AMOUNT VALIDATION ERROR */}
              {errors.amount && (
                <p className="text-destructive text-xs mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            {/* NOTE FIELD */}
            <div>
              <Label htmlFor="ef-note">
                Note{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="ef-note"
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
                  {editExpenditure ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${editExpenditure ? "Update" : "Add"} Expenditure`
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
ExpenditureFormDialog.displayName = "ExpenditureFormDialog";

// <== EXPORT ==>
export default ExpenditureFormDialog;
