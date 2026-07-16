// <== IMPORTS ==>
import {
  Wifi,
  Tablet,
  LogOut,
  Monitor,
  Loader2,
  MonitorX,
  HelpCircle,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  sessionKeys,
  useUserSessions,
  useKillUserSession,
  useKillAllUserSessions,
} from "@/hooks/useSessions";
import type {
  SessionRecord,
  SessionSocketPayload,
} from "@/types/session-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useCallback } from "react";
import type { TeamMember } from "@/types/team-types";
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

// <== SESSIONS DIALOG PROPS ==>
interface SessionsDialogProps {
  // <== OPEN STATE ==>
  open: boolean;
  // <== TARGET TEAM MEMBER WHOSE SESSIONS ARE BEING VIEWED ==>
  member: TeamMember | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== SESSIONS DIALOG COMPONENT ==>
const SessionsDialog = memo(
  ({ open, member, onClose }: SessionsDialogProps) => {
    // FETCHING TARGET USER'S SESSIONS — ONLY RUNS WHILE THE DIALOG IS OPEN
    const { data, isLoading } = useUserSessions(member?._id ?? "", open);
    // KILL SPECIFIC SESSION MUTATION
    const killMutation = useKillUserSession(member?._id ?? "");
    // KILL ALL SESSIONS MUTATION
    const killAllMutation = useKillAllUserSessions(member?._id ?? "");
    // QUERY CLIENT FOR SOCKET-DRIVEN CACHE INVALIDATION
    const queryClient = useQueryClient();
    // SESSION ID CURRENTLY ARMED FOR CONFIRMATION
    const [armedSessionId, setArmedSessionId] = useState<string | null>(null);
    // STATE FOR ARMING A ROW FOR CONFIRMATION
    const [bulkArmed, setBulkArmed] = useState<boolean>(false);
    // STABLE HANDLER FOR SOCKET EVENTS — INVALIDATES THE SESSIONS LIST SO IT STAYS LIVE
    const handleSessionEvent = useCallback(
      (payload: SessionSocketPayload): void => {
        // GUARD: EVENT IS FOR A DIFFERENT USER THAN THE ONE CURRENTLY BEING VIEWED
        if (!member || payload.userId !== member._id) return;
        // INVALIDATING THIS USER'S SESSIONS QUERY TO REFETCH THE LATEST LIST
        queryClient.invalidateQueries({
          queryKey: sessionKeys.user(member._id),
        });
      },
      [member, queryClient],
    );
    // SUBSCRIBING TO LIVE NEW SESSION EVENT
    useSocketEvent<SessionSocketPayload>("session:new", handleSessionEvent);
    // SUBSCRIBING TO LIVE KILLED SESSION EVENT
    useSocketEvent<SessionSocketPayload>("session:killed", handleSessionEvent);
    // SUBSCRIBING TO LIVE KILLED ALL SESSIONS EVENT
    useSocketEvent<SessionSocketPayload>(
      "session:all_killed",
      handleSessionEvent,
    );
    // HANDLE END SESSION CLICK — FIRST CLICK ARMS, SECOND CLICK CONFIRMS
    const handleEndClick = useCallback(
      (session: SessionRecord): void => {
        // IF NOT YET ARMED, ARM THIS ROW AND RETURN
        if (armedSessionId !== session._id) {
          // ARMING THIS ROW
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
    // HANDLE LOG OUT EVERYWHERE CLICK — SAME ARM/CONFIRM PATTERN
    const handleBulkClick = useCallback((): void => {
      // IF NOT YET ARMED, ARM AND RETURN
      if (!bulkArmed) {
        // ARMING THE BULK ACTION
        setBulkArmed(true);
        // RETURNING FROM FUNCTION
        return;
      }
      // ALREADY ARMED — CONFIRMING AND FIRING THE MUTATION
      killAllMutation.mutate(undefined, {
        // ON SUCCESS
        onSuccess: (res) => {
          // SHOW SUCCESS TOAST
          toast.success(res.message || "All sessions ended.");
          // DISARMING THE BULK ACTION
          setBulkArmed(false);
        },
      });
    }, [bulkArmed, killAllMutation]);
    // HANDLE DIALOG CLOSE HANDLER
    const handleClose = useCallback((): void => {
      // RESETTING ARMED SESSION
      setArmedSessionId(null);
      // RESETTING BULK ARMED STATE
      setBulkArmed(false);
      // CALLING PARENT CLOSE HANDLER
      onClose();
    }, [onClose]);
    // EXTRACTING SESSIONS WITH SAFE FALLBACK
    const sessions = data?.sessions ?? [];
    // RETURNING SESSIONS DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NO MUTATION IS PENDING
          if (!v && !killMutation.isPending && !killAllMutation.isPending) {
            // CALLING CLOSE HANDLER
            handleClose();
          }
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <Monitor className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  Active Sessions
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {member
                    ? `Devices currently signed in as ${member.fullName}`
                    : "Devices currently signed in"}
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* SCROLLABLE SESSIONS LIST */}
          <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
            {/* LOADING SKELETONS */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            {/* SESSIONS LIST */}
            {!isLoading && (
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
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                        <DeviceIcon className="w-4 h-4" />
                      </div>
                      {/* SESSION DETAILS */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {session.browser} on {session.os}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>
                            Active{" "}
                            {formatDistanceToNow(
                              new Date(session.lastActiveAt),
                              {
                                addSuffix: true,
                              },
                            )}
                          </span>
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Wifi className="w-3 h-3" />
                              {session.ipAddress}
                            </span>
                          )}
                        </p>
                      </div>
                      {/* END SESSION BUTTON */}
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
                    </div>
                  );
                })}
              </div>
            )}
            {/* EMPTY STATE */}
            {!isLoading && sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <MonitorX className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No active sessions for this user.
                </p>
              </div>
            )}
          </div>
          {/* FIXED FOOTER — LOG OUT EVERYWHERE BULK ACTION, ONLY MEANINGFUL WHEN SESSIONS EXIST */}
          {sessions.length > 0 && (
            <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {sessions.length} active session
                {sessions.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant={bulkArmed ? "destructive" : "outline"}
                size="sm"
                className="h-9 px-4 gap-1.5"
                disabled={killAllMutation.isPending}
                onClick={handleBulkClick}
              >
                {killAllMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Ending All...
                  </>
                ) : (
                  <>
                    <MonitorX className="w-3.5 h-3.5" />
                    {bulkArmed
                      ? "Confirm Log Out Everywhere?"
                      : "Log Out Everywhere"}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SessionsDialog.displayName = "SessionsDialog";

// <== EXPORT ==>
export default SessionsDialog;
