// <== IMPORTS ==>
import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShieldX, Home } from "lucide-react";

// <== UNAUTHORIZED PAGE COMPONENT ==>
const Unauthorized = () => {
  // THEME HOOK
  const { theme, toggleTheme } = useTheme();
  // RETURNING UNAUTHORIZED PAGE COMPONENT
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
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>
        </motion.div>
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold mb-3"
        >
          Access Restricted
        </motion.h1>
        {/* DESCRIPTION — REFLECTS THE ACTUAL CASE: LOGGED IN, BUT LACKING PERMISSION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground mb-6 sm:mb-8"
        >
          You don't have permission to access this page. If you believe this is
          a mistake, contact your account administrator.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* LINK BACK TO THE ROOT PAGE */}
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// <== DISPLAY NAME FOR DEVTOOLS ==>
Unauthorized.displayName = "Unauthorized";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(Unauthorized);
