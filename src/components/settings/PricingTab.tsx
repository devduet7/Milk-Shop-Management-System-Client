// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { memo, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { useGetProfile, useUpdatePricing } from "@/hooks/useSettings";
import { Milk, IceCream, Edit2, Check, X, Loader2 } from "lucide-react";

// <== NO SPINNER CLASS ==>
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// <== RATE EDIT CARD PROPS ==>
interface RateEditCardProps {
  // <== LABEL ==>
  label: string;
  // <== UNIT DESCRIPTION ==>
  unit: string;
  // <== LUCIDE ICON ==>
  icon: typeof Milk;
  // <== ICON COLOR CLASS ==>
  iconClass: string;
  // <== CURRENT RATE VALUE ==>
  value: number;
  // <== IS MUTATION LOADING ==>
  isLoading: boolean;
  // <== SAVE CALLBACK ==>
  onSave: (value: number) => void;
}

// <== RATE EDIT CARD COMPONENT ==>
const RateEditCard = memo(
  ({
    label,
    unit,
    icon: Icon,
    iconClass,
    value,
    isLoading,
    onSave,
  }: RateEditCardProps) => {
    // EDITING STATE
    const [isEditing, setIsEditing] = useState<boolean>(false);
    // DRAFT VALUE
    const [draft, setDraft] = useState<string>(String(value));
    // VALIDATION ERROR
    const [error, setError] = useState<string | null>(null);
    // HANDLE SAVE
    const handleSave = useCallback((): void => {
      // PARSE DRAFT
      const parsed = parseFloat(draft);
      // IF DRAFT NOT VALID
      if (Number.isNaN(parsed) || parsed < 1) {
        // SHOW ERROR
        setError("Rate must be at least ₨1!");
        // RETURN FROM FUNCTION
        return;
      }
      // IF DRAFT TOO LARGE
      if (parsed > 100_000) {
        // SHOW ERROR
        setError("Rate seems too large. Please verify!");
        // RETURN FROM FUNCTION
        return;
      }
      // CLEAR ERROR
      setError(null);
      // IF UNCHANGED
      if (parsed === value) {
        // EXIT EDIT MODE
        setIsEditing(false);
        // RETURN FROM FUNCTION
        return;
      }
      // CALL PARENT SAVE HANDLER
      onSave(parsed);
      // EXIT EDIT MODE
      setIsEditing(false);
    }, [draft, value, onSave]);
    // HANDLE CANCEL
    const handleCancel = useCallback((): void => {
      // SET DRAFT TO CURRENT VALUE
      setDraft(String(value));
      // CLEAR PREVIOUS ERRORS
      setError(null);
      // EXIT EDIT MODE
      setIsEditing(false);
    }, [value]);
    // HANDLE KEY DOWN
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>): void => {
        // ENTER SAVES
        if (e.key === "Enter") handleSave();
        // ESCAPE CANCELS
        if (e.key === "Escape") handleCancel();
      },
      [handleSave, handleCancel],
    );
    // RETURNING RATE EDIT CARD
    return (
      // CARD CONTAINER
      <div className="glass-card p-4 sm:p-5">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                iconClass,
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{unit}</p>
            </div>
          </div>
          {/* CURRENT RATE BADGE */}
          {!isEditing && (
            <span className="text-lg font-bold font-display">
              ₨{value.toLocaleString()}
            </span>
          )}
        </div>
        {/* RATE INPUT ROW */}
        <div>
          <Label className="text-xs" htmlFor={`rate-${label}`}>
            Rate (₨)
          </Label>
          <div
            className={cn(
              "flex items-center gap-2 h-10 px-3 mt-1.5 rounded-lg border transition-colors",
              isEditing
                ? "border-primary/60 bg-background ring-1 ring-primary/20"
                : "border-border bg-muted/30",
            )}
          >
            {isEditing ? (
              // EDIT MODE
              <>
                <input
                  id={`rate-${label}`}
                  type="number"
                  inputMode="numeric"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "flex-1 bg-transparent text-sm outline-none",
                    NO_SPINNER,
                  )}
                  disabled={isLoading}
                />
                {/* SAVE BUTTON */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
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
                  className="h-6 w-6 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              // DISPLAY MODE
              <>
                <span className="flex-1 text-sm">
                  ₨{value.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(String(value));
                    setError(null);
                    setIsEditing(true);
                  }}
                  className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
          {/* VALIDATION ERROR */}
          {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
RateEditCard.displayName = "RateEditCard";

// <== PRICING TAB COMPONENT ==>
const PricingTab = memo(() => {
  // FETCH PROFILE
  const { data: profile } = useGetProfile();
  // UPDATE PRICING MUTATION
  const updatePricing = useUpdatePricing();
  // HANDLE MILK RATE SAVE
  const handleMilkSave = useCallback(
    (value: number): void => {
      // EXIT IF NO VALUE
      if (!value) return;
      // UPDATE PRICING
      updatePricing.mutate({ milkRate: value });
    },
    [updatePricing],
  );
  // HANDLE YOGHURT RATE SAVE
  const handleYoghurtSave = useCallback(
    (value: number): void => {
      // EXIT IF NO VALUE
      if (!value) return;
      // UPDATE PRICING
      updatePricing.mutate({ yoghurtRate: value });
    },
    [updatePricing],
  );
  // RETURNING PRICING TAB
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6 space-y-6"
    >
      {/* HEADER */}
      <div>
        <h2 className="font-display font-semibold text-lg">Pricing</h2>
        <p className="text-sm text-muted-foreground">
          Set default rates for milk and yoghurt sales
        </p>
      </div>
      <Separator />
      {/* RATE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* MILK RATE CARD */}
        <RateEditCard
          label="Milk Rate"
          unit="per Liter"
          icon={Milk}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          value={profile?.milkRate ?? 120}
          isLoading={updatePricing.isPending}
          onSave={handleMilkSave}
        />
        {/* YOGHURT RATE CARD */}
        <RateEditCard
          label="Yoghurt Rate"
          unit="per kg"
          icon={IceCream}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          value={profile?.yoghurtRate ?? 180}
          isLoading={updatePricing.isPending}
          onSave={handleYoghurtSave}
        />
      </div>
      {/* INFO NOTE */}
      <p className="text-xs text-muted-foreground">
        These rates are used as defaults across the application. You can
        override rates per individual sale where applicable.
      </p>
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
PricingTab.displayName = "PricingTab";

// <== EXPORT ==>
export default PricingTab;
