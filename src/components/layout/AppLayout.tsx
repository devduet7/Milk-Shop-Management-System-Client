// <== IMPORTS ==>
import {
  X,
  Sun,
  Menu,
  Moon,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import SessionExpiredModal from "../common/SessionExpiredModal";
import { memo, useRef, useState, useCallback, useMemo } from "react";

// <== ROUTE META MAP ==>
const ROUTE_META: Record<string, { title: string }> = {
  "/": { title: "Quick Sales" },
  "/dashboard": { title: "Dashboard" },
  "/sales": { title: "Sales" },
  "/purchases": { title: "Purchases" },
  "/expenditures": { title: "Expenditures" },
  "/recoveries": { title: "Recoveries" },
  "/staff": { title: "Staff" },
  "/customers": { title: "Customers" },
  "/analytics": { title: "Analytics" },
  "/team": { title: "Team" },
  "/trash": { title: "Trash" },
  "/settings": { title: "Settings" },
};

// <== APP LAYOUT COMPONENT ==>
const AppLayout = memo(() => {
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // CURRENT LOCATION FOR ROUTE-BASED PAGE TITLE
  const location = useLocation();
  // LOGOUT MUTATION HOOK - DESTRUCTURE STABLE REFERENCE ONLY
  const { mutate: logoutMutate } = useLogout();
  // MAIN CONTENT REF FOR SCROLL TO TOP
  const mainRef = useRef<HTMLElement>(null);
  // MOBILE SIDEBAR OPEN STATE
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  // DESKTOP SIDEBAR COLLAPSED STATE - INITIALIZED FROM LOCAL STORAGE
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem("sidebar_collapsed") === "true",
  );
  // DERIVING CURRENT PAGE TITLE FROM PATHNAME
  const pageMeta = useMemo(
    () => ROUTE_META[location.pathname] ?? { title: "Milk Shop" },
    [location.pathname],
  );
  // TOGGLE DESKTOP SIDEBAR COLLAPSED STATE
  const toggleCollapsed = useCallback((): void => {
    // TOGGLE COLLAPSED STATE
    setCollapsed((prev) => {
      // INVERT COLLAPSED STATE
      const next = !prev;
      // PERSIST COLLAPSED STATE TO LOCAL STORAGE
      localStorage.setItem("sidebar_collapsed", String(next));
      // RETURN NEW COLLAPSED STATE
      return next;
    });
  }, []);
  // CLOSE MOBILE SIDEBAR HANDLER
  const closeMobileSidebar = useCallback((): void => {
    // CLOSE MOBILE SIDEBAR
    setMobileOpen(false);
  }, []);
  // OPEN MOBILE SIDEBAR HANDLER
  const openMobileSidebar = useCallback((): void => {
    // OPEN MOBILE SIDEBAR
    setMobileOpen(true);
  }, []);
  // HANDLE LOGOUT
  const handleLogout = useCallback((): void => {
    // LOGOUT
    logoutMutate();
  }, [logoutMutate]);
  // RENDERING THE APP LAYOUT
  return (
    // MAIN CONTAINER
    <div className="flex h-screen overflow-hidden bg-background">
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 overflow-hidden"
        animate={{ width: collapsed ? 52 : 240 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <AppSidebar collapsed={collapsed} />
      </motion.aside>
      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={closeMobileSidebar}
            />
            {/* MOBILE SIDEBAR DRAWER */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border md:hidden flex flex-col"
            >
              {/* CLOSE BUTTON */}
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileSidebar}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <AppSidebar onNavigate={closeMobileSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="relative h-14 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-xl flex items-center justify-between px-3 top-0 z-30">
          {/* DECORATIVE GRADIENT ACCENT LINE */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
          {/* LEFT SECTION — SIDEBAR TOGGLE AND PAGE TITLE */}
          <div className="flex items-center gap-2 min-w-0">
            {/* MOBILE HAMBURGER BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 text-muted-foreground hover:text-foreground shrink-0"
              onClick={openMobileSidebar}
            >
              <Menu className="w-4 h-4" />
            </Button>
            {/* DESKTOP SIDEBAR COLLAPSE TOGGLE */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex w-9 h-9 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={toggleCollapsed}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
            {/* VERTICAL SEPARATOR */}
            <div className="hidden sm:block w-px h-5 bg-border/70 shrink-0" />
            {/* ANIMATED PAGE TITLE — TRANSITIONS ON ROUTE CHANGE */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={location.pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="hidden sm:block font-display text-[15px] font-semibold text-foreground tracking-tight truncate"
              >
                {pageMeta.title}
              </motion.h2>
            </AnimatePresence>
          </div>
          {/* RIGHT SECTION — THEME TOGGLE AND LOGOUT */}
          <div className="flex items-center gap-1 shrink-0">
            {/* ANIMATED THEME TOGGLE */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="w-9 h-9 text-muted-foreground hover:text-foreground relative overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === "light" ? (
                      <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Moon className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -45, scale: 0.6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Sun className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === "light" ? "Dark mode" : "Light mode"}
              </TooltipContent>
            </Tooltip>
            {/* LOGOUT BUTTON */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sign out</TooltipContent>
            </Tooltip>
          </div>
        </header>
        {/* SCROLLABLE PAGE CONTENT */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {/* SESSION EXPIRED MODAL */}
          <SessionExpiredModal />
          {/* SCROLL TO TOP */}
          <ScrollToTop containerRef={mainRef} />
          {/* PAGE CONTENT */}
          <Outlet />
        </main>
      </div>
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
AppLayout.displayName = "AppLayout";

// <== EXPORT ==>
export { AppLayout };
