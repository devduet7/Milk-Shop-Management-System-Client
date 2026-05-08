// <== IMPORTS ==>
import { type CSSProperties } from "react";

// <== SHARED TOOLTIP STYLE — USED ACROSS ALL CHART COMPONENTS ==>
export const TOOLTIP_STYLE: CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
  boxShadow: "0 8px 30px -10px rgba(0,0,0,0.15)",
  padding: "8px 12px",
};

// <== SHARED AXIS TICK STYLE ==>
export const AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
};

// <== CHART COLOR PALETTE — CONSISTENT ACROSS ALL CHART COMPONENTS ==>
export const CHART_COLORS = {
  revenue: "#10b981",
  expenses: "#ef4444",
  purchases: "#10b981",
  expenditures: "#f59e0b",
  milk: "#3b82f6",
  yoghurt: "#8b5cf6",
  customerMilk: "#3b82f6",
  customerYoghurt: "#8b5cf6",
  shopMilk: "#6366f1",
  shopYoghurt: "#a855f7",
  delivered: "#10b981",
  missed: "#ef4444",
  staff: "#8b5cf6",
  recoveryCollected: "#10b981",
  recoveryOutstanding: "#ef4444",
  categories: {
    supplies: "#3b82f6",
    meals: "#f59e0b",
    transport: "#8b5cf6",
    misc: "#94a3b8",
  },
} as const;
