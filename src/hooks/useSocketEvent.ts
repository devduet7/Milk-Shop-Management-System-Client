// <== IMPORTS ==>
import { useEffect } from "react";
import { socket } from "@/lib/socket";

/**
 * SUBSCRIBE TO A SOCKET EVENT FOR THE LIFETIME OF THE CALLING COMPONENT
 * @param {string} event - THE EVENT NAME TO LISTEN FOR
 * @param {(payload: T) => void} handler - STABLE CALLBACK INVOKED WITH THE EVENT PAYLOAD
 * @returns {void}
 */
// <== USE SOCKET EVENT HOOK ==>
export const useSocketEvent = <T = unknown>(
  event: string,
  handler: (payload: T) => void,
): void => {
  // SUBSCRIBING ON MOUNT, UNSUBSCRIBING ON UNMOUNT OR WHEN THE EVENT OR HANDLER CHANGES
  useEffect(() => {
    // REGISTERING THE LISTENER ON THE PERSISTENT SINGLETON SOCKET
    socket.on(event, handler);
    // CLEANUP: REMOVING ONLY THIS SPECIFIC LISTENER, NOT TOUCHING THE CONNECTION ITSELF
    return () => {
      // REMOVING THE LISTENER
      socket.off(event, handler);
    };
  }, [event, handler]);
};
