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
import { Outlet } from "react-router-dom";
import { useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnimatePresence, motion } from "framer-motion";
import SessionExpiredModal from "./SessionExpiredModal";
import { memo, useRef, useState, useCallback } from "react";

// <== APP LAYOUT COMPONENT ==>
const AppLayout = memo(() => {
  // GETTING USER FROM AUTH STORE WITH SELECTOR TO PREVENT UNNECESSARY RE-RENDERS
  const user = useAuthStore((state) => state.user);
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
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
    <div className="flex h-screen overflow-hidden">
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
              className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border md:hidden"
            >
              {/* CLOSE BUTTON */}
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileSidebar}
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
        {/* FIXED TOP NAVBAR */}
        <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
          {/* LEFT SIDE - MENU TOGGLE AND WELCOME MESSAGE */}
          <div className="flex items-center gap-1">
            {/* MOBILE MENU BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={openMobileSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {/* DESKTOP SIDEBAR COLLAPSE TOGGLE */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex"
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
            {/* WELCOME MESSAGE */}
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline ml-1">
              Welcome, {user?.fullName}
            </span>
          </div>
          {/* RIGHT SIDE - THEME TOGGLE AND LOGOUT */}
          <div className="flex items-center gap-1">
            {/* THEME TOGGLE BUTTON */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            {/* LOGOUT BUTTON */}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
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
