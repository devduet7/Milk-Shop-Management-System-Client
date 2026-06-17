// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState, useCallback, type ReactNode } from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

// <== STAT CHIP PROPS ==>
interface StatChipProps {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== COLOR CLASS ==>
  colorClass?: string;
}

// <== STAT CHIP — COMPACT INLINE METRIC DISPLAY ==>
export const StatChip = memo(
  ({
    label,
    value,
    colorClass = "bg-muted/60 text-foreground",
  }: StatChipProps) => (
    <div
      className={cn(
        "flex flex-col items-center px-2.5 py-1.5 rounded-lg text-center shrink-0",
        colorClass,
      )}
    >
      <span className="text-[9px] font-semibold uppercase tracking-widest leading-none">
        {label}
      </span>
      {value && (
        <span className="text-[11px] font-bold leading-none mt-0.5">
          {value}
        </span>
      )}
    </div>
  ),
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
StatChip.displayName = "StatChip";

// <== DASHBOARD SECTION CARD PROPS ==>
interface DashboardSectionCardProps {
  // <== TITLE ==>
  title: string;
  // <== ICON ==>
  icon: LucideIcon;
  // <== ICON CLASS ==>
  iconClass?: string;
  // <== STATS CHIPS ==>
  chips: StatChipProps[];
  // <== CHILDREN ==>
  children: ReactNode;
  // <== DEFAULT EXPANDED STATE ==>
  defaultExpanded?: boolean;
}

// <== DASHBOARD SECTION CARD — COLLAPSIBLE SECTION WITH STATS CHIPS AND RECORDS TABLE ==>
const DashboardSectionCard = memo(
  ({
    title,
    icon: Icon,
    iconClass = "bg-primary/10 text-primary",
    chips,
    children,
    defaultExpanded = true,
  }: DashboardSectionCardProps) => {
    // EXPANDED STATE
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
    // TOGGLE HANDLER
    const handleToggle = useCallback(() => setIsExpanded((prev) => !prev), []);
    // RETURNING SECTION CARD
    return (
      <div className="glass-card overflow-hidden">
        {/* SECTION HEADER — ALWAYS VISIBLE AND FULLY CLICKABLE */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-4 sm:p-5 hover:bg-muted/20 transition-colors text-left"
        >
          {/* TOP ROW — ICON, TITLE, MOBILE CHEVRON */}
          <div className="flex items-center gap-3 w-full sm:min-w-0 sm:flex-1">
            {/* SECTION ICON BADGE */}
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                iconClass,
              )}
            >
              <Icon className="w-[17px] h-[17px]" />
            </div>
            {/* SECTION TITLE */}
            <h3 className="font-display font-semibold text-sm sm:text-base flex-1 min-w-0">
              {title}
            </h3>
            {/* CHEVRON — MOBILE ONLY, INLINE WITH TITLE */}
            <div className="sm:hidden shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
          {/* STAT CHIPS ROW */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {chips.map((chip) => (
              <StatChip key={chip.label} {...chip} />
            ))}
          </div>
          {/* CHEVRON — DESKTOP ONLY */}
          <div className="hidden sm:block shrink-0 sm:ml-2 text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>
        {/* COLLAPSIBLE BODY */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/50">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DashboardSectionCard.displayName = "DashboardSectionCard";

// <== EXPORT ==>
export default DashboardSectionCard;
