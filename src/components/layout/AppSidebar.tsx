// <== IMPORTS ==>
import {
  Zap,
  Milk,
  Users,
  Wallet,
  Package,
  Settings,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// <== NAV ITEM TYPE ==>
interface NavItem {
  // <== NAV ITEM TITLE ==>
  title: string;
  // <== NAV ITEM URL ==>
  url: string;
  // <== NAV ITEM ICON ==>
  icon: LucideIcon;
}
// <== NAV ITEMS LIST ==>
const NAV_ITEMS: NavItem[] = [
  { title: "Quick Sales", url: "/", icon: Zap },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Purchases", url: "/purchases", icon: Package },
  { title: "Expenditures", url: "/expenditures", icon: Wallet },
  { title: "Recoveries", url: "/recoveries", icon: RefreshCw },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;
// <== APP SIDEBAR PROPS INTERFACE ==>
interface AppSidebarProps {
  // <== ON NAVIGATE CALLBACK ==>
  onNavigate?: () => void;
  // <== COLLAPSED STATE ==>
  collapsed?: boolean;
}
// <== NAV LINK ITEM PROPS INTERFACE ==>
interface NavLinkItemProps {
  // <== NAV ITEM DATA ==>
  item: NavItem;
  // <== ACTIVE STATE ==>
  active: boolean;
  // <== COLLAPSED STATE ==>
  collapsed: boolean;
  // <== ON NAVIGATE CALLBACK ==>
  onNavigate?: () => void;
}

// <== NAV LINK ITEM COMPONENT ==>
const NavLinkItem = memo(
  ({ item, active, collapsed, onNavigate }: NavLinkItemProps) => {
    // <== LINK ELEMENT ==>
    const linkEl = (
      <Link
        to={item.url}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center rounded-lg text-sm font-medium transition-colors",
          collapsed ? "justify-center w-9 h-9 mx-auto" : "gap-3 px-3 py-2.5",
          active
            ? "text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        {/* ACTIVE INDICATOR BACKGROUND */}
        {active && <div className="absolute inset-0 bg-primary rounded-lg" />}
        {/* NAV ITEM ICON */}
        <item.icon
          className={cn(
            "relative z-10 shrink-0 transition-all duration-300",
            collapsed ? "w-[18px] h-[18px] stroke-[2.5]" : "w-4 h-4",
          )}
        />
        {/* NAV ITEM LABEL - HIDDEN WHEN COLLAPSED */}
        {!collapsed && (
          <motion.span
            className="relative z-10 whitespace-nowrap"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {item.title}
          </motion.span>
        )}
      </Link>
    );
    // WRAP IN TOOLTIP WHEN SIDEBAR IS COLLAPSED
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }
    return <div>{linkEl}</div>;
  },
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
NavLinkItem.displayName = "NavLinkItem";

// <== APP SIDEBAR COMPONENT ==>
const AppSidebar = memo(
  ({ onNavigate, collapsed = false }: AppSidebarProps) => {
    // GETTING CURRENT LOCATION FOR ACTIVE STATE
    const location = useLocation();
    // <== CHECK IF NAV ITEM IS ACTIVE ==>
    const isActive = useCallback(
      (url: string): boolean => location.pathname === url,
      [location.pathname],
    );
    // RENDERING THE SIDEBAR CONTENT
    return (
      <div className="flex flex-col h-full">
        {/* BRAND HEADER */}
        <div className="h-14 flex items-center border-b border-sidebar-border shrink-0 overflow-hidden">
          <div
            className={cn(
              "flex items-center transition-all duration-300 w-full",
              collapsed ? "justify-center px-0" : "px-4 gap-3",
            )}
          >
            {/* BRAND LOGO */}
            <div
              className={cn(
                "rounded-xl bg-primary flex items-center justify-center shrink-0 transition-all duration-300",
                collapsed ? "w-9 h-9" : "w-10 h-10",
              )}
            >
              <Milk
                className={cn(
                  "text-primary-foreground transition-all duration-300",
                  collapsed ? "w-[18px] h-[18px] stroke-[2.5]" : "w-5 h-5",
                )}
              />
            </div>
            {/* BRAND TEXT - HIDDEN WHEN COLLAPSED */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="font-display text-lg font-bold text-sidebar-foreground">
                    Milk Shop
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Management System
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* NAVIGATION ITEMS */}
        <nav
          className={cn(
            "flex-1 p-2 space-y-1 overflow-hidden",
            collapsed && "p-1.5",
          )}
        >
          {NAV_ITEMS.map((item) => (
            <NavLinkItem
              key={item.url}
              item={item}
              active={isActive(item.url)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>
    );
  },
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
AppSidebar.displayName = "AppSidebar";
// <== EXPORT ==>
export { AppSidebar };
