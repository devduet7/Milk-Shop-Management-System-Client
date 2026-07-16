// <== IMPORTS ==>
import { io, type Socket } from "socket.io-client";

// <== SOCKET SERVER URL ==>
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

// <== MODULE-LEVEL SOCKET SINGLETON ==>
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  withCredentials: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
});

/**
 * CONNECT THE SINGLETON SOCKET — IDEMPOTENT, SAFE TO CALL MULTIPLE TIMES
 * @returns {void}
 */
// <== CONNECT SOCKET ==>
export const connectSocket = (): void => {
  // GUARD: ALREADY CONNECTED — AVOID A REDUNDANT HANDSHAKE
  if (!socket.connected) {
    // OPENING THE CONNECTION
    socket.connect();
  }
};

/**
 * DISCONNECT THE SINGLETON SOCKET — IDEMPOTENT, SAFE TO CALL MULTIPLE TIMES
 * @returns {void}
 */
// <== DISCONNECT SOCKET ==>
export const disconnectSocket = (): void => {
  // GUARD: ALREADY DISCONNECTED
  if (socket.connected) {
    // CLOSING THE CONNECTION
    socket.disconnect();
  }
};
