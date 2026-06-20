// <== IMPORTS ==>
import { motion } from "framer-motion";
import { memo, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Compass, Home } from "lucide-react";

// <== NOT FOUND PAGE COMPONENT ==>
const NotFound = memo(() => {
  // GETTING CURRENT LOCATION
  const location = useLocation();
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // LOG 404 ERROR ON MOUNT
  useEffect(() => {
    // LOGGING 404 ERROR WITH ATTEMPTED ROUTE
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);
  // RETURNING NOT FOUND PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* THEME TOGGLE — FIXED TO CORNER ON ALL SCREEN SIZES */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          {theme === "light" ? (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
      {/* BACKGROUND CIRCLE TOP LEFT */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      {/* BACKGROUND CIRCLE BOTTOM RIGHT */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      {/* CONTENT CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="text-center max-w-md"
      >
        {/* COMPASS ICON WITH SHAKE ANIMATION */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Compass className="w-10 h-10 text-muted-foreground" />
          </div>
        </motion.div>
        {/* ERROR CODE LABEL */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2"
        >
          Error 404
        </motion.p>
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold mb-3"
        >
          Page Not Found
        </motion.h1>
        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mb-6 sm:mb-8"
        >
          The page you're looking for doesn't exist or may have been moved.
        </motion.p>
        {/* HOME BUTTON */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
NotFound.displayName = "NotFound";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default NotFound;
