// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addMilkLogSchema,
  type AddMilkLogFormValues,
} from "@/validators/milkLogSchemas";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Milk, IceCream, Loader2 } from "lucide-react";
import { memo, useEffect, useState, useCallback } from "react";
import { useAddMilkLog, useUpdateMilkLog } from "@/hooks/useMilkLogs";
import type { MilkLog, MilkLogEntryType } from "@/types/milk-log-types";

// <== MILK LOG FORM DIALOG PROPS ==>
interface MilkLogFormDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== MILK LOG ENTRY TO EDIT ==>
  editMilkLog: MilkLog | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== MILK LOG FORM DIALOG COMPONENT ==>
const MilkLogFormDialog = memo(
  ({ open, editMilkLog, onClose }: MilkLogFormDialogProps) => {
    // ADD MILK LOG MUTATION
    const addMutation = useAddMilkLog();
    // UPDATE MILK LOG MUTATION
    const updateMutation = useUpdateMilkLog();
    // COMBINED PENDING STATE
    const isPending = addMutation.isPending || updateMutation.isPending;
    // LOCAL TYPE STATE FOR FORM
    const [selectedType, setSelectedType] = useState<MilkLogEntryType>(
      editMilkLog?.type ?? "leftover",
    );
    // FORM SETUP WITH ZOD RESOLVER
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<AddMilkLogFormValues>({
      // ZOD SCHEMA RESOLVER FOR VALIDATION
      resolver: zodResolver(addMilkLogSchema),
      // VALIDATE AND CLEAR ERRORS ON CHANGE (ERRORS DISAPPEAR AS USER TYPES)
      mode: "onChange",
      // DEFAULT VALUES
      defaultValues: {
        type: "leftover",
        quantity: undefined as unknown as number,
        note: "",
      },
    });
    // RESET FORM AND LOCAL TYPE EACH TIME THE DIALOG OPENS OR SWITCHES BETWEEN ADD / EDIT
    useEffect(() => {
      // IF DIALOG IS OPEN
      if (open) {
        // SYNC LOCAL TYPE STATE
        setSelectedType(editMilkLog?.type ?? "leftover");
        // RESET FORM VALUES
        reset({
          type: editMilkLog?.type ?? "leftover",
          quantity: editMilkLog?.quantity ?? (undefined as unknown as number),
          note: editMilkLog?.note ?? "",
        });
      }
    }, [open, editMilkLog, reset]);
    // HANDLE TYPE TOGGLE
    const handleTypeSelect = useCallback((type: MilkLogEntryType): void => {
      // UPDATE LOCAL TYPE STATE
      setSelectedType(type);
    }, []);
    // IS LEFTOVER FOR LABEL AND STYLE SWITCHING
    const isLeftover = selectedType === "leftover";
    // FORM SUBMIT HANDLER
    const onSubmit = (data: AddMilkLogFormValues): void => {
      // PREPARE FORM DATA FOR MUTATION — COMBINING RHF DATA WITH LOCAL TYPE STATE
      const payload = {
        type: selectedType,
        quantity: data.quantity,
        note: data.note,
      } satisfies AddMilkLogFormValues;
      // EDIT MODE: UPDATE EXISTING MILK LOG ENTRY
      if (editMilkLog) {
        // CALL UPDATE MUTATION
        updateMutation.mutate(
          { id: editMilkLog._id, data: payload },
          // CLOSE DIALOG ON SUCCESS
          { onSuccess: onClose },
        );
        // RETURN FROM FUNCTION
        return;
      }
      // ADD MODE: CREATE NEW MILK LOG ENTRY
      addMutation.mutate(payload, { onSuccess: onClose });
    };
    // RETURNING MILK LOG FORM DIALOG
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
                <Milk className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  {editMilkLog ? "Edit" : "Add"} Milk Log Entry
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {editMilkLog
                    ? "Update the milk log entry below"
                    : "Record leftover milk or milk used for yoghurt"}
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
              {/* ENTRY TYPE TOGGLE */}
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Entry Type
                </Label>
                <div className="flex gap-2 mt-2">
                  {/* LEFTOVER BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("leftover")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200",
                      isLeftover
                        ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Milk className="w-4 h-4" />
                    Leftover
                  </button>
                  {/* YOGHURT BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("yoghurt")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200",
                      !isLeftover
                        ? "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <IceCream className="w-4 h-4" />
                    Yoghurt
                  </button>
                </div>
              </div>
              {/* QUANTITY FIELD */}
              <div>
                <Label
                  htmlFor="ml-quantity"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Quantity (L)
                </Label>
                <Input
                  id="ml-quantity"
                  type="number"
                  inputMode="decimal"
                  placeholder={isLeftover ? "e.g. 5" : "e.g. 10"}
                  className="mt-1.5 h-10"
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
              {/* NOTE FIELD */}
              <div>
                <Label
                  htmlFor="ml-note"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Note{" "}
                  <span className="text-muted-foreground text-xs font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ml-note"
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
                    {editMilkLog ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  `${editMilkLog ? "Update" : "Add"} Entry`
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
MilkLogFormDialog.displayName = "MilkLogFormDialog";

// <== EXPORT ==>
export default MilkLogFormDialog;
