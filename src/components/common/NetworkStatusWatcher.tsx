// <== IMPORTS ==>
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState, JSX } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

// <== NETWORK INFORMATION INTERFACE ==>
interface NetworkInformation extends EventTarget {
  // <== EFFECTIVE CONNECTION TYPE ==>
  effectiveType?: string;
  // <== ADD EVENT LISTENER ==>
  addEventListener(type: "change", listener: () => void): void;
  // <== REMOVE EVENT LISTENER ==>
  removeEventListener(type: "change", listener: () => void): void;
}

// <== NAVIGATOR WITH CONNECTION INTERFACE ==>
interface NavigatorWithConnection extends Navigator {
  // <== STANDARD CONNECTION API ==>
  connection?: NetworkInformation;
  // <== MOZILLA CONNECTION API ==>
  mozConnection?: NetworkInformation;
  // <== WEBKIT CONNECTION API ==>
  webkitConnection?: NetworkInformation;
}

// <== MODAL PROPS INTERFACE ==>
interface ModalProps {
  // <== ICON BACKGROUND COLOR CLASS ==>
  iconBg: string;
  // <== ICON COLOR CLASS ==>
  iconColor: string;
  // <== MODAL TITLE ==>
  title: string;
  // <== MODAL MESSAGE ==>
  message: string;
  // <== BUTTON COLOR CLASS ==>
  buttonColor: string;
}

// <== SHARED MODAL COMPONENT ==>
const NetworkModal = ({
  iconBg,
  iconColor,
  title,
  message,
  buttonColor,
}: ModalProps): JSX.Element => (
  // <== FULL SCREEN OVERLAY WITH BLUR ==>
  <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
    {/* MODAL CONTAINER */}
    <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-8 max-w-md w-[90%] mx-4 border border-border">
      {/* MODAL CONTENT */}
      <div className="text-center">
        {/* ICON WRAPPER */}
        <div
          className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconBg} mb-4`}
        >
          {/* WIFI OFF ICON */}
          <WifiOff className={`h-8 w-8 ${iconColor}`} strokeWidth={2.5} />
        </div>
        {/* MODAL TITLE */}
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        {/* MODAL MESSAGE */}
        <p className="text-muted-foreground mb-6">{message}</p>
        {/* RELOAD BUTTON */}
        <button
          onClick={() => window.location.reload()}
          type="button"
          className={`w-full px-6 py-3 ${buttonColor} rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2`}
        >
          {/* REFRESH ICON */}
          <RefreshCcw className="h-5 w-5" strokeWidth={2.5} />
          {/* BUTTON LABEL */}
          <span>Reload</span>
        </button>
      </div>
    </div>
  </div>
);

// <== NETWORK STATUS WATCHER COMPONENT ==>
const NetworkStatusWatcher = (): JSX.Element | null => {
  // IS POOR CONNECTION STATE VARIABLE
  const [isPoor, setIsPoor] = useState<boolean>(false);
  // IS OFFLINE STATE VARIABLE
  const [isOffline, setIsOffline] = useState<boolean>(false);
  // THEME HOOK TO DETERMINE CURRENT THEME
  const { theme } = useTheme();
  // DERIVE IS DARK BOOLEAN FROM THEME STRING
  const isDark = theme === "dark";
  // AUTH STORE TO CHECK IF USER IS AUTHENTICATED
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // DETERMINE BUTTON COLOR BASED ON AUTHENTICATION STATUS
  const buttonColor = isAuthenticated
    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
    : "bg-violet-500 hover:bg-violet-600 text-white";
  // DETERMINE OFFLINE ICON BACKGROUND COLOR BASED ON THEME
  const offlineIconBg = isDark ? "bg-orange-900/30" : "bg-orange-100";
  // DETERMINE OFFLINE ICON COLOR BASED ON THEME
  const offlineIconColor = isDark ? "text-orange-400" : "text-orange-600";
  // DETERMINE POOR CONNECTION ICON BACKGROUND COLOR BASED ON THEME
  const poorIconBg = isDark ? "bg-yellow-900/30" : "bg-yellow-100";
  // DETERMINE POOR CONNECTION ICON COLOR BASED ON THEME
  const poorIconColor = isDark ? "text-yellow-400" : "text-yellow-600";
  // PREVENT BODY SCROLL WHEN OFFLINE OR POOR CONNECTION MODAL IS VISIBLE
  useEffect(() => {
    // CHECK IF EITHER MODAL SHOULD BE VISIBLE
    if (isOffline || isPoor) {
      // SAVE CURRENT OVERFLOW STYLE
      const originalOverflow = document.body.style.overflow;
      // SET BODY OVERFLOW TO HIDDEN TO PREVENT SCROLL
      document.body.style.overflow = "hidden";
      // CLEANUP: RESTORE ORIGINAL OVERFLOW ON UNMOUNT OR WHEN MODAL HIDES
      return () => {
        // RESTORE BODY OVERFLOW
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOffline, isPoor]);
  // CONNECTIVITY CHECKING EFFECT
  useEffect(() => {
    // CAST NAVIGATOR TO EXTENDED INTERFACE WITH CONNECTION API
    const nav = navigator as NavigatorWithConnection;
    // RESOLVE CONNECTION OBJECT ACROSS BROWSER VENDORS
    const connection: NetworkInformation | undefined =
      nav.connection || nav.mozConnection || nav.webkitConnection;
    // INITIAL OFFLINE STATUS CHECK ON MOUNT
    if (!navigator.onLine) {
      // SET OFFLINE STATE TO TRUE
      setIsOffline(true);
    }
    // INITIAL CONNECTION QUALITY CHECK ON MOUNT
    if (connection?.effectiveType) {
      // DEFINE SLOW CONNECTION TYPES
      const slowTypes = ["slow-2g", "2g"];
      // SET POOR STATE BASED ON CURRENT EFFECTIVE TYPE
      setIsPoor(slowTypes.includes(connection.effectiveType));
    }
    // HANDLE BROWSER GOING OFFLINE
    const handleOffline = (): void => {
      // SET OFFLINE STATE TO TRUE
      setIsOffline(true);
    };
    // HANDLE BROWSER COMING BACK ONLINE
    const handleOnline = (): void => {
      // CLEAR OFFLINE STATE
      setIsOffline(false);
      // CLEAR POOR CONNECTION STATE
      setIsPoor(false);
    };
    // QUALITY CHANGE HANDLER REFERENCE FOR CLEANUP
    let updateQuality: (() => void) | undefined;
    // ONLY ATTACH QUALITY LISTENER IF CONNECTION API IS AVAILABLE
    if (connection) {
      // DEFINE QUALITY UPDATE HANDLER
      updateQuality = (): void => {
        // DEFINE SLOW CONNECTION TYPES
        const slowTypes = ["slow-2g", "2g"];
        // UPDATE POOR STATE BASED ON CURRENT EFFECTIVE TYPE
        setIsPoor(slowTypes.includes(connection.effectiveType ?? ""));
      };
      // ATTACH CHANGE LISTENER TO CONNECTION OBJECT
      connection.addEventListener("change", updateQuality);
      // RUN QUALITY CHECK IMMEDIATELY
      updateQuality();
    }
    // ATTACH OFFLINE EVENT LISTENER TO WINDOW
    window.addEventListener("offline", handleOffline);
    // ATTACH ONLINE EVENT LISTENER TO WINDOW
    window.addEventListener("online", handleOnline);
    // CLEANUP: REMOVE ALL EVENT LISTENERS ON UNMOUNT
    return () => {
      // REMOVE OFFLINE LISTENER
      window.removeEventListener("offline", handleOffline);
      // REMOVE ONLINE LISTENER
      window.removeEventListener("online", handleOnline);
      // REMOVE QUALITY CHANGE LISTENER IF IT WAS ATTACHED
      if (connection && updateQuality) {
        // REMOVE CHANGE LISTENER FROM CONNECTION OBJECT
        connection.removeEventListener("change", updateQuality);
      }
    };
  }, []);
  // IF CONNECTION IS FINE RENDER NOTHING
  if (!isOffline && !isPoor) return null;
  // IF OFFLINE RENDER OFFLINE MODAL
  if (isOffline) {
    return (
      // OFFLINE MODAL WITH ORANGE THEME
      <NetworkModal
        iconBg={offlineIconBg}
        iconColor={offlineIconColor}
        title="You're Offline"
        message="Your Internet connection appears to be Offline."
        buttonColor={buttonColor}
      />
    );
  }
  // IF POOR CONNECTION RENDER POOR CONNECTION MODAL
  if (isPoor) {
    return (
      // POOR CONNECTION MODAL WITH YELLOW THEME
      <NetworkModal
        iconBg={poorIconBg}
        iconColor={poorIconColor}
        title="Poor Connection"
        message="Your Internet Connection appears to be very Slow."
        buttonColor={buttonColor}
      />
    );
  }
  // DEFENSIVE RETURN
  return null;
};

// <== EXPORT ==>
export default NetworkStatusWatcher;
