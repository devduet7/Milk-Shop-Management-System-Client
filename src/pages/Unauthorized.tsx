// <== IMPORTS ==>
import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";

// <== UNAUTHORIZED PAGE COMPONENT ==>
const Unauthorized = () => {
  // RETURNING UNAUTHORIZED PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
          Access Denied
        </motion.h1>
        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          You need to sign in to access this page. Please log in to continue.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild>
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go to Login
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(Unauthorized);
