// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Edit2, Check, X, Loader2, ShieldCheck } from "lucide-react";
import { memo, useState, useRef, useEffect, useCallback } from "react";

// <== NO SPINNER CLASS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== EDITABLE FIELD PROPS ==>
interface EditableFieldProps {
  // <== FIELD ID FOR LABEL ASSOCIATION ==>
  id: string;
  // <== FIELD LABEL ==>
  label: string;
  // <== CURRENT ACTUAL VALUE (USED TO RESET DRAFT ON CANCEL) ==>
  value: string;
  // <== DISPLAY VALUE (DIFFERENT FROM VALUE FOR MASKED FIELDS) ==>
  displayValue?: string;
  // <== PLACEHOLDER WHEN VALUE IS EMPTY ==>
  placeholder?: string;
  // <== INPUT TYPE ==>
  inputType?: "text" | "email" | "tel";
  // <== SAVE LOADING STATE ==>
  isLoading?: boolean;
  // <== WHETHER SAVING REQUIRES OTP VERIFICATION ==>
  requiresOtp?: boolean;
  // <== CLIENT-SIDE VALIDATION BEFORE CALLING onSave ==>
  validate?: (value: string) => string | null;
  // <== SAVE CALLBACK — CALLED WITH TRIMMED VALUE ==>
  onSave: (value: string) => void;
  // <== CANCEL CALLBACK — OPTIONAL CLEANUP ==>
  onCancel?: () => void;
  // <== DISABLE EDIT (E.G. WHILE OTP MODAL IS OPEN) ==>
  disabled?: boolean;
}

// <== EDITABLE FIELD COMPONENT ==>
const EditableField = memo(
  ({
    id,
    label,
    value,
    displayValue,
    placeholder = "Not set",
    inputType = "text",
    isLoading = false,
    requiresOtp = false,
    validate,
    onSave,
    onCancel,
    disabled = false,
  }: EditableFieldProps) => {
    // EDITING STATE
    const [isEditing, setIsEditing] = useState<boolean>(false);
    // DRAFT VALUE DURING EDIT
    const [draft, setDraft] = useState<string>(value);
    // VALIDATION ERROR
    const [error, setError] = useState<string | null>(null);
    // INPUT REF FOR FOCUS ON EDIT
    const inputRef = useRef<HTMLInputElement>(null);
    // SYNC DRAFT WHEN VALUE CHANGES FROM OUTSIDE (AFTER SUCCESSFUL SAVE)
    useEffect(() => {
      // ONLY SYNC WHEN NOT IN EDIT MODE
      if (!isEditing) setDraft(value);
    }, [value, isEditing]);
    // FOCUS INPUT WHEN ENTERING EDIT MODE
    useEffect(() => {
      // FOCUS INPUT IF EDITING MODE IS ACTIVE
      if (isEditing) inputRef.current?.focus();
    }, [isEditing]);
    // HANDLE ENTERING EDIT MODE
    const handleEditClick = useCallback((): void => {
      // SET DRAFT TO CURRENT VALUE
      setDraft(value);
      // CLEAR PREVIOUS ERRORS
      setError(null);
      // ENTER EDIT MODE
      setIsEditing(true);
    }, [value]);
    // HANDLE SAVE — VALIDATE THEN CALL onSave
    const handleSave = useCallback((): void => {
      // TRIM DRAFT VALUE
      const trimmed = draft.trim();
      // RUN CLIENT-SIDE VALIDATION IF PROVIDED
      if (validate) {
        // RUN VALIDATION FUNCTION
        const validationError = validate(trimmed);
        // SHOW ERROR IF VALIDATION FAILS
        if (validationError) {
          // SHOW ERROR
          setError(validationError);
          // RETURN FROM FUNCTION
          return;
        }
      }
      // CLEAR ERROR
      setError(null);
      // IF UNCHANGED — JUST EXIT EDIT MODE
      if (trimmed === value) {
        // EXIT EDIT MODE
        setIsEditing(false);
        // RETURN FROM FUNCTION
        return;
      }
      // CALL PARENT SAVE HANDLER
      onSave(trimmed);
      // EXIT EDIT MODE
      setIsEditing(false);
    }, [draft, value, validate, onSave]);
    // HANDLE CANCEL — REVERT DRAFT AND EXIT EDIT MODE
    const handleCancel = useCallback((): void => {
      // REVERT DRAFT TO CURRENT VALUE
      setDraft(value);
      // CLEAR ERRORS
      setError(null);
      // EXIT EDIT MODE
      setIsEditing(false);
      // CALL PARENT CANCEL HANDLER IF PROVIDED
      onCancel?.();
    }, [value, onCancel]);
    // HANDLE KEYBOARD — ENTER SAVES, ESCAPE CANCELS
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>): void => {
        // ENTER SAVES
        if (e.key === "Enter") handleSave();
        // ESCAPE CANCELS
        if (e.key === "Escape") handleCancel();
      },
      [handleSave, handleCancel],
    );
    // RETURNING EDITABLE FIELD
    return (
      // FIELD CONTAINER
      <div className="space-y-1.5">
        {/* LABEL ROW */}
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          {/* OTP REQUIRED BADGE */}
          {requiresOtp && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" />
              Verification Required
            </span>
          )}
        </div>
        {/* INPUT ROW */}
        <div
          className={cn(
            "flex items-center gap-2 h-10 px-3 rounded-lg border transition-colors",
            isEditing
              ? "border-primary/60 bg-background ring-1 ring-primary/20"
              : "border-border bg-muted/30",
          )}
        >
          {isEditing ? (
            // EDIT MODE — SHOW INPUT WITH SAVE AND CANCEL BUTTONS
            <>
              <input
                ref={inputRef}
                id={id}
                type={inputType}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
                  NO_SPINNER,
                )}
                disabled={isLoading}
              />
              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </button>
              {/* CANCEL BUTTON */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-6 w-6 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            // DISPLAY MODE — SHOW VALUE WITH EDIT ICON
            <>
              <span
                id={id}
                className={cn(
                  "flex-1 text-sm truncate",
                  !value && "text-muted-foreground",
                )}
              >
                {(displayValue ?? value) || placeholder}
              </span>
              {/* EDIT ICON */}
              {!disabled && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  title={`Edit ${label}`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
        {/* VALIDATION ERROR */}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
EditableField.displayName = "EditableField";

// <== EXPORT ==>
export default EditableField;
