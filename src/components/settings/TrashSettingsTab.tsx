// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { Trash2, Clock, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { TrashRetentionDays } from "@/types/settings-types";
import { useGetProfile, useUpdateTrashSettings } from "@/hooks/useSettings";

// <== RETENTION DAYS OPTIONS ==>
const RETENTION_OPTIONS: TrashRetentionDays[] = [7, 15, 30];

// <== DELETION MODE TOGGLE CARD PROPS ==>
interface DeletionModeToggleCardProps {
  // <== CURRENT TRASH MODE ENABLED STATE ==>
  enabled: boolean;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== TOGGLE CALLBACK ==>
  onToggle: (newValue: boolean) => void;
}

// <== DELETION MODE TOGGLE CARD COMPONENT ==>
const DeletionModeToggleCard = memo(
  ({ enabled, isLoading, onToggle }: DeletionModeToggleCardProps) => (
    // CARD CONTAINER
    <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl gap-4">
      {/* ICON + LABEL */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Move Deleted Items to Trash</p>
          <p className="text-xs text-muted-foreground">
            {enabled
              ? "Deleted records are kept in Trash before being removed permanently"
              : "Deleted records are removed permanently and immediately"}
          </p>
        </div>
      </div>
      {/* CUSTOM TOGGLE SWITCH */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        disabled={isLoading}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          enabled ? "bg-primary" : "bg-muted-foreground/30",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* TOGGLE THUMB */}
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
            enabled ? "translate-x-6" : "translate-x-1",
          )}
        />
        {/* LOADING SPINNER OVERLAY */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          </span>
        )}
      </button>
    </div>
  ),
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeletionModeToggleCard.displayName = "DeletionModeToggleCard";

// <== RETENTION DAYS SELECTOR PROPS ==>
interface RetentionDaysSelectorProps {
  // <== CURRENTLY SELECTED RETENTION DAYS ==>
  value: TrashRetentionDays;
  // <== WHETHER THE SELECTOR IS DISABLED (INSTANT MODE) ==>
  disabled: boolean;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== SELECT CALLBACK ==>
  onSelect: (days: TrashRetentionDays) => void;
}

// <== RETENTION DAYS SELECTOR COMPONENT ==>
const RetentionDaysSelector = memo(
  ({ value, disabled, isLoading, onSelect }: RetentionDaysSelectorProps) => (
    // SELECTOR CONTAINER
    <div
      className={cn(
        "p-4 bg-muted/40 rounded-xl transition-opacity",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      {/* ICON + LABEL */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Auto-Purge After</p>
          <p className="text-xs text-muted-foreground">
            Items in Trash are permanently removed after this many days
          </p>
        </div>
      </div>
      {/* PILL OPTIONS */}
      <div className="flex gap-2">
        {RETENTION_OPTIONS.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => onSelect(days)}
            disabled={disabled || isLoading}
            className={cn(
              "flex-1 h-9 rounded-lg text-sm font-medium transition-colors",
              value === days
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground border border-border",
            )}
          >
            {days} Days
          </button>
        ))}
      </div>
    </div>
  ),
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
RetentionDaysSelector.displayName = "RetentionDaysSelector";

// <== TRASH SETTINGS TAB COMPONENT ==>
const TrashSettingsTab = memo(() => {
  // FETCH PROFILE
  const { data: profile } = useGetProfile();
  // UPDATE TRASH SETTINGS MUTATION
  const updateTrash = useUpdateTrashSettings();
  // WHETHER TRASH MODE IS CURRENTLY ENABLED
  const isTrashMode = (profile?.deletionMode ?? "trash") === "trash";
  // HANDLE DELETION MODE TOGGLE
  const handleModeToggle = useCallback(
    (newValue: boolean): void => {
      // UPDATE DELETION MODE
      updateTrash.mutate({ deletionMode: newValue ? "trash" : "instant" });
    },
    [updateTrash],
  );
  // HANDLE RETENTION DAYS SELECT
  const handleRetentionSelect = useCallback(
    (days: TrashRetentionDays): void => {
      // UPDATE RETENTION DAYS
      updateTrash.mutate({ trashRetentionDays: days });
    },
    [updateTrash],
  );
  // RETURNING TRASH SETTINGS TAB
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6 space-y-6"
    >
      {/* HEADER */}
      <div>
        <h2 className="font-display font-semibold text-lg">Trash</h2>
        <p className="text-sm text-muted-foreground">
          Control what happens to records you delete
        </p>
      </div>
      <Separator />
      {/* SETTINGS CARDS */}
      <div className="space-y-3">
        {/* DELETION MODE TOGGLE */}
        <DeletionModeToggleCard
          enabled={isTrashMode}
          isLoading={updateTrash.isPending}
          onToggle={handleModeToggle}
        />
        {/* RETENTION DAYS SELECTOR */}
        <RetentionDaysSelector
          value={profile?.trashRetentionDays ?? 30}
          disabled={!isTrashMode}
          isLoading={updateTrash.isPending}
          onSelect={handleRetentionSelect}
        />
      </div>
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
TrashSettingsTab.displayName = "TrashSettingsTab";

// <== EXPORT ==>
export default TrashSettingsTab;
