// <== IMPORTS ==>
import {
  Zap,
  Milk,
  Users,
  Wallet,
  Package,
  UserCog,
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
  { title: "Staff", url: "/staff", icon: UserCog },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

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
    // BUILDING THE LINK ELEMENT
    const linkEl = (
      <Link
        to={item.url}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 ease-out",
          collapsed ? "justify-center w-8 h-8 mx-auto" : "gap-2.5 px-2 py-1.5",
          active
            ? "text-primary"
            : "text-sidebar-foreground/55 hover:text-sidebar-foreground",
          active &&
            collapsed &&
            "bg-primary/10 ring-1 ring-inset ring-primary/20",
          active && !collapsed && "bg-primary/10 dark:bg-primary/15",
          !active && "hover:bg-sidebar-accent",
        )}
      >
        {/* ICON — PLAIN IN COLLAPSED MODE, ELEVATED CONTAINER IN EXPANDED MODE */}
        {collapsed ? (
          <item.icon
            className={cn(
              "w-4 h-4 shrink-0 transition-all duration-200",
              active ? "stroke-[2.5]" : "stroke-2",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-all duration-200",
              active
                ? "bg-primary/15 shadow-sm shadow-primary/10"
                : "group-hover:bg-sidebar-border/40",
            )}
          >
            <item.icon
              className={cn(
                "w-[14px] h-[14px] transition-all duration-200",
                active ? "stroke-[2.5]" : "stroke-2",
              )}
            />
          </div>
        )}
        {/* NAV ITEM LABEL — HIDDEN WHEN COLLAPSED */}
        {!collapsed && (
          <motion.span
            className="whitespace-nowrap leading-none"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            {item.title}
          </motion.span>
        )}
        {/* ACTIVE INDICATOR DOT — EXPANDED STATE ONLY */}
        {active && !collapsed && (
          <span className="ml-auto w-1 h-1 rounded-full bg-primary shrink-0 opacity-70" />
        )}
      </Link>
    );
    // WRAPPING IN TOOLTIP WHEN SIDEBAR IS COLLAPSED
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium text-xs">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }
    return <>{linkEl}</>;
  },
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
NavLinkItem.displayName = "NavLinkItem";

// <== APP SIDEBAR COMPONENT ==>
const AppSidebar = memo(
  ({ onNavigate, collapsed = false }: AppSidebarProps) => {
    // GETTING CURRENT LOCATION FOR ACTIVE NAV STATE
    const location = useLocation();
    // CHECK IF A GIVEN URL MATCHES CURRENT PATHNAME
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
              collapsed ? "justify-center px-2" : "px-3.5 gap-3",
            )}
          >
            {/* BRAND LOGO MARK WITH RING GLOW */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20 ring-2 ring-primary/15 ring-offset-2 ring-offset-sidebar">
              <Milk className="w-4 h-4 text-primary-foreground stroke-[2.5]" />
            </div>
            {/* BRAND TEXT — HIDDEN WHEN COLLAPSED */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="font-display text-[15px] font-bold leading-tight text-sidebar-foreground tracking-tight">
                    Milk Shop
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/55 leading-none mt-0.5">
                    Management
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* NAVIGATION */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-2",
            collapsed ? "px-1.5" : "px-2",
          )}
        >
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem
                key={item.url}
                item={item}
                active={isActive(item.url)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </nav>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
AppSidebar.displayName = "AppSidebar";

// <== EXPORT ==>
export { AppSidebar };
