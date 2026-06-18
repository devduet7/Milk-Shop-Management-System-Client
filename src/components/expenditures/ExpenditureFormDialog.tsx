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
  useAddExpenditure,
  useUpdateExpenditure,
} from "@/hooks/useExpenditures";
import {
  addExpenditureSchema,
  type AddExpenditureFormValues,
} from "@/validators/expenditureSchemas";
import { memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2 } from "lucide-react";
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
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-md max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <Wallet className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  {editExpenditure ? "Edit" : "Add"} Expenditure
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {editExpenditure
                    ? "Update the expenditure details below"
                    : "Fill in the details to record a new expenditure"}
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
              {/* TITLE FIELD */}
              <div>
                <Label
                  htmlFor="ef-title"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Title
                </Label>
                <Input
                  id="ef-title"
                  placeholder="e.g. Shopping Bags"
                  className="mt-1.5 h-10"
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
                <Label
                  htmlFor="ef-category"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Category
                </Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger id="ef-category" className="mt-1.5 h-10">
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
                <Label
                  htmlFor="ef-amount"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Amount (₨)
                </Label>
                <Input
                  id="ef-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 1500"
                  className={`mt-1.5 h-10 ${NO_SPINNER}`}
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
                <Label
                  htmlFor="ef-note"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Note{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ef-note"
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
                    {editExpenditure ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  `${editExpenditure ? "Update" : "Add"} Expenditure`
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
ExpenditureFormDialog.displayName = "ExpenditureFormDialog";

// <== EXPORT ==>
export default ExpenditureFormDialog;
