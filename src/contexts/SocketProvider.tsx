// <== IMPORTS ==>
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, type ReactNode } from "react";
import { connectSocket, disconnectSocket, socket } from "@/lib/socket";

// <== SOCKET PROVIDER PROPS ==>
interface SocketProviderProps {
  // <== CHILDREN ==>
  children: ReactNode;
}

/**
 * SOCKET PROVIDER COMPONENT FOR MANAGING THE LIFECYCLE OF THE SINGLETON SOCKET.IO CONNECTION
 * @param children THE CHILDREN TO RENDER INSIDE THE PROVIDER
 */
// <== SOCKET PROVIDER COMPONENT ==>
export const SocketProvider = ({ children }: SocketProviderProps) => {
  // READING ONLY THE PRIMITIVE BOOLEAN AUTHENTICATED FROM THE AUTH STORE
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // GUARD AGAINST OVERLAPPING VERIFICATION CALLS IF MULTIPLE REVOCATION EVENTS ARRIVE IN QUICK SUCCESSION
  const isVerifyingRef = useRef<boolean>(false);
  // EFFECT FOR MANAGING THE SOCKET CONNECTION AND LISTENERS BASED ON AUTHENTICATION STATE
  useEffect(() => {
    // IF NOT AUTHENTICATED, ENSURE THE SOCKET IS DISCONNECTED AND DO NOTHING ELSE
    if (!isAuthenticated) {
      // DISCONNECTING THE SINGLETON SOCKET
      disconnectSocket();
      // RETURNING EARLY — NO LISTENERS TO ATTACH WHEN LOGGED OUT
      return;
    }
    // OPENING THE CONNECTION — IDEMPOTENT, SAFE EVEN IF ALREADY CONNECTED
    connectSocket();
    // <== VERIFY STILL AUTHENTICATED ==>
    const verifyStillAuthenticated = async (): Promise<void> => {
      // GUARD: A VERIFICATION IS ALREADY IN FLIGHT
      if (isVerifyingRef.current) return;
      // MARKING VERIFICATION AS IN PROGRESS
      isVerifyingRef.current = true;
      // ATTEMPTING TO REFRESH THE SESSION
      try {
        // ATTEMPTING TO REFRESH THE SESSION — IF THIS FAILS, THE SERVER WILL REJECT WITH 401
        await apiClient.post("/user/refresh");
        // SUCCESS — THIS TAB'S SESSION IS UNAFFECTED, NOTHING FURTHER TO DO
      } catch (error) {
        // GUARD: SERVER REJECTED THE REFRESH
        const hasServerResponse =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: unknown }).response !== undefined;
        // GUARD: IGNORE PURE NETWORK FAILURES
        if (!hasServerResponse) return;
        // THE SERVER EXPLICITLY REJECTED THE REFRESH — DISCONNECT THE SOCKET
        disconnectSocket();
        // TRIGGERING A CUSTOM EVENT TO INFORM THE REST OF THE APP THAT THE SESSION HAS EXPIRED
        window.dispatchEvent(new CustomEvent("session-expired"));
      } finally {
        // CLEARING THE IN-FLIGHT GUARD REGARDLESS OF OUTCOME
        isVerifyingRef.current = false;
      }
    };
    // HANDLER FOR A SINGLE SESSION BEING KILLED
    const handleSessionKilled = (): void => {
      // TRIGGERING SILENT VERIFICATION
      void verifyStillAuthenticated();
    };
    // HANDLER FOR ALL SESSIONS BEING BULK-KILLED
    const handleAllSessionsKilled = (): void => {
      // TRIGGERING SILENT VERIFICATION
      void verifyStillAuthenticated();
    };
    // REGISTERING SESSION KILLED LISTENER FOR THE SINGLETON SOCKET
    socket.on("session:killed", handleSessionKilled);
    // REGISTERING ALL SESSIONS KILLED LISTENER FOR THE SINGLETON SOCKET
    socket.on("session:all_killed", handleAllSessionsKilled);
    // CLEANUP — REMOVING LISTENERS WHEN THE COMPONENT UNMOUNTS OR AUTHENTICATION STATE CHANGES
    return () => {
      // REMOVING THE SESSION-KILLED LISTENER
      socket.off("session:killed", handleSessionKilled);
      // REMOVING THE ALL-SESSIONS-KILLED LISTENER
      socket.off("session:all_killed", handleAllSessionsKilled);
    };
  }, [isAuthenticated]);
  // RENDERING CHILDREN UNCHANGED
  return <>{children}</>;
};
