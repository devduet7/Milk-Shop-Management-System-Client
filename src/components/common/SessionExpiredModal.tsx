// <== IMPORTS ==>
import { LogOut } from "lucide-react";
import { useEffect, JSX } from "react";
import { useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";

// <== SESSION EXPIRED MODAL COMPONENT ==>
const SessionExpiredModal = (): JSX.Element | null => {
  // AUTH STORE TO READ AND SET SESSION EXPIRED FLAG
  const isSessionExpired = useAuthStore((state) => state.isSessionExpired);
  // SET SESSION EXPIRED ACTION FROM AUTH STORE
  const setSessionExpired = useAuthStore((state) => state.setSessionExpired);
  // THEME HOOK TO DETERMINE CURRENT THEME
  const { theme } = useTheme();
  // DERIVE IS DARK BOOLEAN FROM THEME STRING
  const isDark = theme === "dark";
  // LOGOUT MUTATION HOOK
  const logoutMutation = useLogout();
  // DETERMINE ICON BACKGROUND COLOR BASED ON THEME
  const iconBg = isDark ? "bg-red-900/30" : "bg-red-100";
  // DETERMINE ICON COLOR BASED ON THEME
  const iconColor = isDark ? "text-red-400" : "text-red-600";
  // HANDLE LOGOUT CLICK — CLEARS SESSION FLAG THEN FIRES LOGOUT MUTATION
  const handleLogout = (): void => {
    // CLEAR SESSION EXPIRED FLAG BEFORE LOGOUT SO MODAL UNMOUNTS CLEANLY
    setSessionExpired(false);
    // FIRE LOGOUT MUTATION — onError ALSO RUNS CLEANUP SO DEAD COOKIES ARE SAFE
    logoutMutation.mutate();
  };
  // PREVENT BODY SCROLL WHEN SESSION EXPIRED MODAL IS VISIBLE
  useEffect(() => {
    // ONLY LOCK SCROLL WHEN MODAL IS ACTUALLY SHOWN
    if (isSessionExpired) {
      // SAVE CURRENT OVERFLOW STYLE
      const originalOverflow = document.body.style.overflow;
      // SET BODY OVERFLOW TO HIDDEN TO PREVENT BACKGROUND SCROLL
      document.body.style.overflow = "hidden";
      // CLEANUP: RESTORE ORIGINAL OVERFLOW WHEN MODAL HIDES OR UNMOUNTS
      return () => {
        // RESTORE ORIGINAL OVERFLOW STYLE
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isSessionExpired]);
  // LISTEN FOR SESSION EXPIRED CUSTOM EVENT DISPATCHED BY API CLIENT INTERCEPTOR
  useEffect(() => {
    // HANDLE SESSION EXPIRED EVENT FIRED FROM AXIOS INTERCEPTOR
    const handleSessionExpired = (): void => {
      // SET SESSION EXPIRED FLAG TO TRUE TO TRIGGER MODAL
      setSessionExpired(true);
    };
    // ATTACH SESSION EXPIRED EVENT LISTENER TO WINDOW
    window.addEventListener("session-expired", handleSessionExpired);
    // CLEANUP: REMOVE EVENT LISTENER ON UNMOUNT
    return () => {
      // REMOVE SESSION EXPIRED EVENT LISTENER FROM WINDOW
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [setSessionExpired]);
  // IF SESSION IS NOT EXPIRED RENDER NOTHING
  if (!isSessionExpired) return null;
  // IF SESSION IS EXPIRED RENDER SESSION EXPIRED MODAL
  return (
    // MODAL OVERLAY — NON DISMISSIBLE, HIGHEST Z-INDEX
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* MODAL CONTAINER */}
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-8 max-w-md w-[90%] mx-4 border border-border">
        {/* MODAL CONTENT */}
        <div className="text-center">
          {/* WARNING ICON WRAPPER */}
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconBg} mb-4`}
          >
            {/* LOGOUT ICON */}
            <LogOut className={`h-8 w-8 ${iconColor}`} strokeWidth={2.5} />
          </div>
          {/* MODAL TITLE */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Session Expired
          </h2>
          {/* MODAL MESSAGE */}
          <p className="text-muted-foreground mb-6">
            Your session has expired. Please log in again to continue.
          </p>
          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            type="button"
            disabled={logoutMutation.isPending}
            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* LOGOUT ICON */}
            <LogOut className="h-5 w-5" strokeWidth={2.5} />
            {/* BUTTON LABEL — CHANGES WHILE LOGOUT IS IN FLIGHT */}
            <span>
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// <== EXPORT ==>
export default SessionExpiredModal;
