// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { BarChart3, CalendarDays, Loader2 } from "lucide-react";
import { useGetProfile, useUpdateReportSettings } from "@/hooks/useSettings";

// <== REPORT TOGGLE CARD PROPS ==>
interface ReportToggleCardProps {
  // <== LABEL ==>
  label: string;
  // <== DESCRIPTION ==>
  description: string;
  // <== LUCIDE ICON ==>
  icon: typeof BarChart3;
  // <== CURRENT ENABLED STATE ==>
  enabled: boolean;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== TOGGLE CALLBACK ==>
  onToggle: (newValue: boolean) => void;
}

// <== REPORT TOGGLE CARD COMPONENT ==>
const ReportToggleCard = memo(
  ({
    label,
    description,
    icon: Icon,
    enabled,
    isLoading,
    onToggle,
  }: ReportToggleCardProps) => (
    // CARD CONTAINER
    <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl gap-4">
      {/* ICON + LABEL */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
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
ReportToggleCard.displayName = "ReportToggleCard";

// <== PREFERENCES TAB COMPONENT ==>
const PreferencesTab = memo(() => {
  // FETCH PROFILE
  const { data: profile } = useGetProfile();
  // UPDATE REPORT SETTINGS MUTATION
  const updateReports = useUpdateReportSettings();
  // HANDLE DAILY REPORTS TOGGLE
  const handleDailyToggle = useCallback(
    (newValue: boolean): void => {
      // UPDATE PRICING
      updateReports.mutate({ dailyReportsEnabled: newValue });
    },
    [updateReports],
  );
  // HANDLE MONTHLY REPORTS TOGGLE
  const handleMonthlyToggle = useCallback(
    (newValue: boolean): void => {
      // UPDATE PRICING
      updateReports.mutate({ monthlyReportsEnabled: newValue });
    },
    [updateReports],
  );
  // RETURNING PREFERENCES TAB
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6 space-y-6"
    >
      {/* HEADER */}
      <div>
        <h2 className="font-display font-semibold text-lg">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Configure automated reports for your shop
        </p>
      </div>
      <Separator />
      {/* TOGGLE CARDS */}
      <div className="space-y-3">
        {/* DAILY REPORTS TOGGLE */}
        <ReportToggleCard
          label="Daily Reports"
          description="Receive a daily sales and revenue summary to your email"
          icon={BarChart3}
          enabled={profile?.dailyReportsEnabled ?? false}
          isLoading={updateReports.isPending}
          onToggle={handleDailyToggle}
        />
        {/* MONTHLY REPORTS TOGGLE */}
        <ReportToggleCard
          label="Monthly Reports"
          description="Receive a detailed monthly performance report to your email"
          icon={CalendarDays}
          enabled={profile?.monthlyReportsEnabled ?? false}
          isLoading={updateReports.isPending}
          onToggle={handleMonthlyToggle}
        />
      </div>
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
PreferencesTab.displayName = "PreferencesTab";

// <== EXPORT ==>
export default PreferencesTab;
