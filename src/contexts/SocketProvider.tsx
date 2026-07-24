// <== IMPORTS ==>
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, type ReactNode } from "react";
import { connectSocket, disconnectSocket, socket } from "@/lib/socket";

// <== SOCKET PROVIDER PROPS ==>
interface SocketProviderProps {
  // <== CHILDREN ==>
  children: ReactNode;
}

// <== SESSION IDENTITY PAYLOAD TYPE ==>
interface SessionIdentityPayload {
  // <== SESSION ID FOR THIS SOCKET CONNECTION ==>
  sessionId: string;
}

// <== SESSION KILLED PAYLOAD TYPE ==>
interface SessionKilledPayload {
  // <== SESSION ID THAT WAS KILLED ==>
  sessionId: string;
}

/**
 * SOCKET PROVIDER COMPONENT FOR MANAGING THE LIFECYCLE OF THE SINGLETON SOCKET.IO CONNECTION
 * @param children THE CHILDREN TO RENDER INSIDE THE PROVIDER
 */
// <== SOCKET PROVIDER COMPONENT ==>
export const SocketProvider = ({ children }: SocketProviderProps) => {
  // READING ONLY THE PRIMITIVE BOOLEAN AUTHENTICATED FROM THE AUTH STORE
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // THIS TAB'S OWN SESSION ID, LEARNED FROM THE SERVER ON EACH SUCCESSFUL CONNECT
  const ownSessionIdRef = useRef<string | null>(null);
  // EFFECT FOR MANAGING THE SOCKET CONNECTION AND LISTENERS BASED ON AUTHENTICATION STATE
  useEffect(() => {
    // IF NOT AUTHENTICATED, ENSURE THE SOCKET IS DISCONNECTED AND DO NOTHING ELSE
    if (!isAuthenticated) {
      // CLEARING ANY PREVIOUSLY KNOWN SESSION IDENTITY
      ownSessionIdRef.current = null;
      // DISCONNECTING THE SINGLETON SOCKET
      disconnectSocket();
      // RETURNING EARLY — NO LISTENERS TO ATTACH WHEN LOGGED OUT
      return;
    }
    // OPENING THE CONNECTION — IDEMPOTENT, SAFE EVEN IF ALREADY CONNECTED
    connectSocket();
    // HANDLE FORCED LOGOUT
    const forceLogout = (): void => {
      // DISCONNECTING — ALSO STOPS ANY IN-PROGRESS RECONNECTION ATTEMPTS
      disconnectSocket();
      // DISPATCHING THE EXISTING SESSION-EXPIRED EVENT — SINGLE SOURCE OF TRUTH FOR THIS UI PATH
      window.dispatchEvent(new CustomEvent("session-expired"));
    };
    // HANDLER: SERVER TELLS US OUR OWN SESSION ID FOR THIS CONNECTION
    const handleIdentity = (payload: SessionIdentityPayload): void => {
      // STORING THIS TAB'S SESSION ID FOR COMPARISON AGAINST FUTURE "SESSION_KILLED" EVENTS
      ownSessionIdRef.current = payload.sessionId;
    };
    // HANDLER: A SPECIFIC SESSION WAS KILLED
    const handleSessionKilled = (payload: SessionKilledPayload): void => {
      // IF THIS SESSION WAS KILLED, FORCING LOGOUT
      if (payload.sessionId && payload.sessionId === ownSessionIdRef.current) {
        // FORCING LOGOUT — SERVER HAS ALREADY REVOKED THIS SESSION, NO NEED TO VERIFY FURTHER
        forceLogout();
      }
    };
    // HANDLER: ALL SESSIONS FOR THIS USER WERE KILLED
    const handleAllSessionsKilled = (): void => {
      // FORCING LOGOUT UNCONDITIONALLY
      forceLogout();
    };
    // HANDLER: CONNECTION OR RECONNECTION WAS REJECTED
    const handleConnectError = (err: Error): void => {
      // IF THE ERROR MESSAGE IS "SESSION_REVOKED", THE SERVER HAS ALREADY REVOKED THIS SESSION
      if (err.message === "SESSION_REVOKED") {
        // FORCING LOGOUT — THE HANDSHAKE'S DATABASE CHECK FOUND THIS SESSION INACTIVE
        forceLogout();
      }
    };
    // REGISTERING SESSION IDENTITY LISTENER
    socket.on("session:identity", handleIdentity);
    // REGISTERING SESSION KILLED LISTENER FOR THE SINGLETON SOCKET
    socket.on("session:killed", handleSessionKilled);
    // REGISTERING ALL SESSIONS KILLED LISTENER FOR THE SINGLETON SOCKET
    socket.on("session:all_killed", handleAllSessionsKilled);
    // REGISTERING CONNECT ERROR LISTENER — CATCHES REVOCATION DETECTED DURING (RE)CONNECT
    socket.on("connect_error", handleConnectError);
    // CLEANUP — REMOVING LISTENERS WHEN THE COMPONENT UNMOUNTS OR AUTHENTICATION STATE CHANGES
    return () => {
      // REMOVING THE SESSION IDENTITY LISTENER
      socket.off("session:identity", handleIdentity);
      // REMOVING THE SESSION-KILLED LISTENER
      socket.off("session:killed", handleSessionKilled);
      // REMOVING THE ALL-SESSIONS-KILLED LISTENER
      socket.off("session:all_killed", handleAllSessionsKilled);
      // REMOVING THE CONNECT ERROR LISTENER
      socket.off("connect_error", handleConnectError);
    };
  }, [isAuthenticated]);
  // RENDERING CHILDREN UNCHANGED
  return <>{children}</>;
};
