// <== IMPORTS ==>
import {
  Wifi,
  Tablet,
  LogOut,
  Monitor,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  sessionKeys,
  useMySessions,
  useKillMySession,
} from "@/hooks/useSessions";
import type {
  SessionRecord,
  SessionSocketPayload,
} from "@/types/session-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/hooks/useSocketEvent";

// <== DEVICE ICON MAP ==>
const DEVICE_ICONS: Record<SessionRecord["deviceType"], LucideIcon> = {
  // <== TABLET ==>
  tablet: Tablet,
  // <== DESKTOP ==>
  desktop: Monitor,
  // <== MOBILE ==>
  mobile: Smartphone,
  // <== UNKNOWN ==>
  unknown: HelpCircle,
};

// <== SESSIONS TAB COMPONENT ==>
const SessionsTab = memo(() => {
  // FETCHING MY ACTIVE SESSIONS
  const { data, isLoading } = useMySessions();
  // KILL MY SESSION MUTATION
  const killMutation = useKillMySession();
  // QUERY CLIENT FOR SOCKET-DRIVEN CACHE INVALIDATION
  const queryClient = useQueryClient();
  // STATE FOR ARMING A ROW FOR CONFIRMATION
  const [armedSessionId, setArmedSessionId] = useState<string | null>(null);
  // HANDLER FOR SOCKET EVENTS — INVALIDATES THE SESSIONS QUERY TO REFRESH THE LIST
  const handleSessionEvent = useCallback(
    (_payload: SessionSocketPayload): void => {
      // INVALIDATING MY SESSIONS QUERY TO REFETCH THE LATEST LIST
      queryClient.invalidateQueries({ queryKey: sessionKeys.mine() });
    },
    [queryClient],
  );
  // SUBSCRIBING TO LIVE NEW SESSION EVENT
  useSocketEvent<SessionSocketPayload>("session:new", handleSessionEvent);
  // SUBSCRIBING TO LIVE SESSION KILLED EVENT
  useSocketEvent<SessionSocketPayload>("session:killed", handleSessionEvent);
  // HANDLE END SESSION CLICK — FIRST CLICK ARMS, SECOND CLICK CONFIRMS AND FIRES THE MUTATION
  const handleEndClick = useCallback(
    (session: SessionRecord): void => {
      // GUARD: CANNOT END THE CURRENT SESSION THIS WAY
      if (session.isCurrent) return;
      // IF NOT YET ARMED, ARM THIS ROW AND RETURN
      if (armedSessionId !== session._id) {
        // ARMING THIS ROW FOR CONFIRMATION
        setArmedSessionId(session._id);
        // RETURNING FROM FUNCTION
        return;
      }
      // ALREADY ARMED — CONFIRMING AND FIRING THE MUTATION
      killMutation.mutate(session._id, {
        // ON SUCCESS
        onSuccess: (res) => {
          // SHOW SUCCESS TOAST
          toast.success(res.message || "Session ended.");
          // DISARMING THE ROW
          setArmedSessionId(null);
        },
      });
    },
    [armedSessionId, killMutation],
  );
  // RENDERING LOADING SKELETON
  if (isLoading) {
    // RETURNING LOADING SKELETON
    return (
      <div className="glass-card p-4 md:p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }
  // EXTRACTING SESSIONS WITH SAFE FALLBACK
  const sessions = data?.sessions ?? [];
  // RETURNING SESSIONS TAB
  return (
    <div className="glass-card p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold">Active Sessions</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Devices and browsers currently signed in to your account.
        </p>
      </div>
      {/* SESSIONS LIST */}
      <div className="divide-y divide-border/50">
        {sessions.map((session) => {
          // RESOLVING DEVICE ICON
          const DeviceIcon = DEVICE_ICONS[session.deviceType];
          // WHETHER THIS ROW IS ARMED FOR CONFIRMATION
          const isArmed = armedSessionId === session._id;
          // RETURNING SESSION ROW
          return (
            <div
              key={session._id}
              className="py-3.5 flex items-center gap-3 first:pt-0 last:pb-0"
            >
              {/* DEVICE ICON */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  session.isCurrent
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <DeviceIcon className="w-4 h-4" />
              </div>
              {/* SESSION DETAILS */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-sm">
                    {session.browser} on {session.os}
                  </span>
                  {/* THIS DEVICE BADGE */}
                  {session.isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      This Device
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>
                    Active{" "}
                    {formatDistanceToNow(new Date(session.lastActiveAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {session.ipAddress && (
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      {session.ipAddress}
                    </span>
                  )}
                </p>
              </div>
              {/* END SESSION BUTTON — HIDDEN FOR THE CURRENT SESSION */}
              {!session.isCurrent && (
                <Button
                  variant={isArmed ? "destructive" : "outline"}
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  disabled={killMutation.isPending}
                  onClick={() => handleEndClick(session)}
                >
                  <LogOut className="w-3 h-3 mr-1.5" />
                  {isArmed ? "Confirm?" : "End"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {/* EMPTY STATE — SHOULD BE RARE SINCE THE CURRENT SESSION ALWAYS APPEARS HERE TOO */}
      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No active sessions found.
        </p>
      )}
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
SessionsTab.displayName = "SessionsTab";

// <== EXPORT ==>
export default SessionsTab;
