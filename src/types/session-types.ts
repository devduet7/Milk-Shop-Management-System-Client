// <== DEVICE TYPE ==>
export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

// <== SESSION RECORD ==>
export interface SessionRecord {
  // <== MONGODB ID ==>
  _id: string;
  // <== DEVICE TYPE ==>
  deviceType: DeviceType;
  // <== BROWSER LABEL ==>
  browser: string;
  // <== OS LABEL ==>
  os: string;
  // <== IP ADDRESS AT LOGIN TIME ==>
  ipAddress: string | null;
  // <== ACTIVE FLAG ==>
  isActive: boolean;
  // <== LOGIN TIMESTAMP ==>
  loginAt: string;
  // <== LAST ACTIVE TIMESTAMP ==>
  lastActiveAt: string;
  // <== LOGOUT TIMESTAMP, IF VOLUNTARILY ENDED ==>
  logoutAt: string | null;
  // <== REVOCATION TIMESTAMP, IF ADMIN-KILLED ==>
  revokedAt: string | null;
  // <== IS CURRENT SESSION ==>
  isCurrent: boolean;
}

// <== TARGET USER SUMMARY ==>
export interface SessionTargetUser {
  // <== MONGODB ID ==>
  _id: string;
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== ROLE ==>
  role: "superadmin" | "admin" | "user";
}

// <== MY SESSIONS RESPONSE SHAPE ==>
export interface MySessionsResponse {
  // <== SESSIONS LIST ==>
  sessions: SessionRecord[];
}

// <== ADMIN-VIEWED USER SESSIONS RESPONSE SHAPE ==>
export interface UserSessionsResponse {
  // <== TARGET USER SUMMARY ==>
  user: SessionTargetUser;
  // <== SESSIONS LIST ==>
  sessions: SessionRecord[];
}

// <== SOCKET PAYLOAD ==>
export interface SessionSocketPayload {
  // <== TARGET USER ID ==>
  userId?: string;
  // <== SESSION ID, IF THE EVENT CONCERNS A SINGLE SESSION ==>
  sessionId?: string;
  // <== REASON FOR THE EVENT ==>
  reason?: "logout" | "self_revoked" | "admin_revoked" | "admin_bulk_revoked";
}
