// <== IMPORTS ==>
import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

// <== USER ROLE TYPE ==>
export type UserRole = "superadmin" | "admin" | "user";

// <== PERMISSION LEVEL TYPE (ORDINAL — EACH LEVEL IMPLIES EVERYTHING BELOW IT) ==>
export type PermissionLevel = "none" | "read" | "write" | "update";

// <== MODULE PERMISSIONS TYPE ==>
export type ModulePermissions = {
  // <== SALES MODULE PERMISSION ==>
  sales: PermissionLevel;
  // <== PURCHASES MODULE PERMISSION ==>
  purchases: PermissionLevel;
  // <== CUSTOMERS MODULE PERMISSION ==>
  customers: PermissionLevel;
  // <== EXPENDITURES MODULE PERMISSION ==>
  expenditures: PermissionLevel;
  // <== RECOVERIES MODULE PERMISSION ==>
  recoveries: PermissionLevel;
  // <== QUICK SALES MODULE PERMISSION ==>
  quickSales: PermissionLevel;
  // <== DASHBOARD MODULE PERMISSION ==>
  dashboard: PermissionLevel;
  // <== ANALYTICS MODULE PERMISSION ==>
  analytics: PermissionLevel;
};

// <== USER TYPE ==>
export type User = {
  // <== USER ID ==>
  id: string;
  // <== ACCOUNT ID THIS USER BELONGS TO ==>
  accountId: string;
  // <== USER ROLE ==>
  role: UserRole;
  // <== PER-MODULE PERMISSIONS MATRIX ==>
  permissions: ModulePermissions | null;
  // <== FULL NAME ==>
  fullName: string;
  // <== EMAIL ==>
  email: string;
  // <== PHONE NUMBER (OPTIONAL) ==>
  phoneNumber?: string | null;
  // <== ADDRESS (OPTIONAL) ==>
  address?: string | null;
  // <== AVATAR (OPTIONAL) ==>
  avatar?: { url: string; publicId: string } | null;
  // <== MILK RATE IN RUPEES PER LITER ==>
  milkRate?: number;
  // <== YOGHURT RATE IN RUPEES PER KG ==>
  yoghurtRate?: number;
  // <== DAILY REPORTS ENABLED FLAG ==>
  dailyReportsEnabled?: boolean;
  // <== MONTHLY REPORTS ENABLED FLAG ==>
  monthlyReportsEnabled?: boolean;
};

// <== AUTH STATE INTERFACE ==>
interface AuthState {
  // <== USER STATE ==>
  user: User | null;
  // <== AUTHENTICATED FLAG ==>
  isAuthenticated: boolean;
  // <== SESSION EXPIRED FLAG ==>
  isSessionExpired: boolean;
  // <== LOGGING OUT FLAG ==>
  isLoggingOut: boolean;
  // <== CHECKING AUTH FLAG ==>
  isCheckingAuth: boolean;
  // <== LOGIN ACTION ==>
  login: (user: User) => void;
  // <== UPDATE USER ACTION ==>
  updateUser: (updates: Partial<User>) => void;
  // <== CLEAR USER ACTION ==>
  clearUser: () => void;
  // <== SET SESSION EXPIRED ACTION ==>
  setSessionExpired: (expired: boolean) => void;
  // <== SET LOGGING OUT FLAG ACTION ==>
  setLoggingOut: (loggingOut: boolean) => void;
  // <== SET CHECKING AUTH FLAG ACTION ==>
  setCheckingAuth: (checking: boolean) => void;
}

// <== PERSISTED STATE TYPE (ONLY WHAT GETS STORED) ==>
type PersistedAuthState = Pick<AuthState, "user" | "isAuthenticated">;

// <== PERSIST OPTIONS ==>
const persistOptions: PersistOptions<AuthState, PersistedAuthState> = {
  // <== PERSISTENCE KEY IN LOCAL STORAGE ==>
  name: "auth-storage",
  // <== ONLY PERSIST USER AND AUTH STATUS ==>
  partialize: (state): PersistedAuthState => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }),
};
// <== AUTH STORE ==>
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // <== INITIAL STATE ==>
      user: null,
      isAuthenticated: false,
      isSessionExpired: false,
      isLoggingOut: false,
      isCheckingAuth: false,
      // <== LOGIN ACTION — SETS FULL USER AND CLEARS TRANSIENT FLAGS ==>
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          isSessionExpired: false,
          isLoggingOut: false,
        }),
      // <== UPDATE USER ACTION — MERGES PARTIAL UPDATES INTO EXISTING USER ==>
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      // <== CLEAR USER ACTION (USED ON LOGOUT / SESSION EXPIRY) ==>
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isSessionExpired: false,
        }),
      // <== SET SESSION EXPIRED ACTION ==>
      setSessionExpired: (expired: boolean) =>
        set({ isSessionExpired: expired }),
      // <== SET LOGGING OUT FLAG ==>
      setLoggingOut: (loggingOut: boolean) => set({ isLoggingOut: loggingOut }),
      // <== SET CHECKING AUTH FLAG ==>
      setCheckingAuth: (checking: boolean) => set({ isCheckingAuth: checking }),
    }),
    persistOptions,
  ),
);
