// <== IMPORTS ==>
import {
  Send,
  UserX,
  Users,
  Trash2,
  Monitor,
  KeyRound,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types/team-types";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember, UserRole } from "@/types/team-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== TEAM TABLE VIEW PROPS ==>
interface TeamTableViewProps {
  // <== PAGINATED RECORDS ==>
  records: TeamMember[];
  // <== TOTAL FILTERED COUNT ==>
  totalFiltered: number;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== CURRENT PAGE ==>
  currentPage: number;
  // <== ROWS PER PAGE ==>
  rowsPerPage: number;
  // <== START INDEX ==>
  startIndex: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== PAGE CHANGE HANDLER ==>
  onPageChange: (page: number) => void;
  // <== ROWS PER PAGE CHANGE HANDLER ==>
  onRowsPerPageChange: (value: string) => void;
  // <== ACTOR'S ROLE ==>
  actorRole: UserRole;
  // <== ACTOR'S ID ==>
  actorId: string;
  // <== RESEND INVITE HANDLER ==>
  onResendInvite: (member: TeamMember) => void;
  // <== STATUS TOGGLE HANDLER ==>
  onStatusToggle: (member: TeamMember) => void;
  // <== EDIT PERMISSIONS HANDLER ==>
  onEditPermissions: (member: TeamMember) => void;
  // <== DELETE HANDLER ==>
  onDelete: (member: TeamMember) => void;
  // <== VIEW SESSIONS HANDLER ==>
  onViewSessions: (member: TeamMember) => void;
  // <== RESEND MUTATION PENDING ==>
  resendPending: boolean;
  // <== STATUS MUTATION PENDING ==>
  statusPending: boolean;
}

// <== ROLE BADGE VARIANT CONFIG ==>
const ROLE_BADGE_VARIANT: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  superadmin: "default",
  admin: "secondary",
  user: "outline",
};

// <== TEAM TABLE VIEW COMPONENT ==>
const TeamTableView = memo(
  ({
    records,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    actorRole,
    actorId,
    onResendInvite,
    onStatusToggle,
    onEditPermissions,
    onDelete,
    onViewSessions,
    resendPending,
    statusPending,
  }: TeamTableViewProps) => {
    // DETERMINE IF ACTOR CAN MANAGE THIS MEMBER
    const canManage = useCallback(
      (member: TeamMember): boolean => {
        // CANNOT MANAGE SELF
        if (member._id === actorId) return false;
        // CANNOT MANAGE SUPERADMIN
        if (member.role === "superadmin") return false;
        // ADMIN CAN ONLY MANAGE USER-TIER
        if (actorRole === "admin" && member.role === "admin") return false;
        // ALL OTHERS CAN MANAGE
        return true;
      },
      [actorId, actorRole],
    );
    // DETERMINE IF ACTOR CAN VIEW THIS MEMBER'S SESSIONS
    const canViewSessions = useCallback(
      (member: TeamMember): boolean => {
        // CANNOT VIEW OWN SESSIONS HERE — USE THE SETTINGS PAGE
        if (member._id === actorId) return false;
        // SUPERADMIN'S SESSIONS ARE NEVER VISIBLE TO ADMIN-TIER ACTORS
        if (member.role === "superadmin" && actorRole !== "superadmin")
          return false;
        // ALL OTHER COMBINATIONS ARE VIEWABLE BY ADMIN-AND-ABOVE ACTORS
        return true;
      },
      [actorId, actorRole],
    );
    // RETURNING TABLE VIEW
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left">
                  Member
                </th>
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left">
                  Role
                </th>
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left hidden sm:table-cell">
                  Status
                </th>
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left hidden md:table-cell">
                  Setup
                </th>
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left hidden lg:table-cell">
                  Added By
                </th>
                <th className="px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-widest text-left">
                  Actions
                </th>
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {/* LOADING SKELETON ROWS */}
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-7 w-7 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              {/* DATA ROWS */}
              {!isLoading &&
                records.map((member, i) => {
                  // COMPUTING WHETHER ACTOR CAN MANAGE THIS MEMBER
                  const manageable = canManage(member);
                  // COMPUTING WHETHER THIS IS THE ACTOR THEMSELVES
                  const isSelf = member._id === actorId;
                  // RETURNING EACH MEMBER ROW
                  return (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* MEMBER — NAME AND EMAIL */}
                      <td className="px-3 py-3">
                        <div>
                          <p className="font-medium text-sm leading-tight">
                            {member.fullName}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {member.email}
                          </p>
                        </div>
                      </td>
                      {/* ROLE BADGE */}
                      <td className="px-3 py-3">
                        <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </td>
                      {/* STATUS BADGE — HIDDEN ON MOBILE */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <Badge
                          variant={
                            member.isActive ? "secondary" : "destructive"
                          }
                          className={
                            member.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent"
                              : ""
                          }
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      {/* SETUP STATUS — HIDDEN ON TABLET AND BELOW */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={
                            member.hasSetPassword
                              ? "text-muted-foreground"
                              : "border-amber-400 text-amber-600 dark:text-amber-400"
                          }
                        >
                          {member.hasSetPassword ? "Completed" : "Pending"}
                        </Badge>
                      </td>
                      {/* ADDED BY — HIDDEN ON LARGE AND BELOW */}
                      <td className="px-3 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                        {member.createdBy?.fullName ?? "—"}
                      </td>
                      {/* ACTION BUTTONS */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {/* RESEND INVITE — PENDING SETUP + MANAGEABLE */}
                          {!member.hasSetPassword && manageable && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                  onClick={() => onResendInvite(member)}
                                  disabled={resendPending}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Resend Invite
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* EDIT PERMISSIONS — USER-TIER + MANAGEABLE */}
                          {member.role === "user" && manageable && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                  onClick={() => onEditPermissions(member)}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Edit Permissions
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* VIEW PERMISSIONS READ-ONLY — USER-TIER THAT ACTOR CANNOT MANAGE */}
                          {member.role === "user" && !manageable && !isSelf && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                  onClick={() => onEditPermissions(member)}
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                View Permissions
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* ACTIVATE / DEACTIVATE — MANAGEABLE ONLY */}
                          {manageable && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-7 w-7 rounded-lg ${
                                    member.isActive
                                      ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                  }`}
                                  onClick={() => onStatusToggle(member)}
                                  disabled={statusPending}
                                >
                                  {member.isActive ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {member.isActive ? "Deactivate" : "Activate"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* VIEW SESSIONS — VISIBLE PER THE SESSION RULES ABOVE */}
                          {canViewSessions(member) && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                  onClick={() => onViewSessions(member)}
                                >
                                  <Monitor className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                View Sessions
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* DELETE — MANAGEABLE ONLY */}
                          {manageable && (
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => onDelete(member)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Delete</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
          {/* EMPTY STATE */}
          {!isLoading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  No members found
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try adjusting your search or invite a new member
                </p>
              </div>
            </div>
          )}
        </div>
        {/* PAGINATION */}
        {!isLoading && totalFiltered > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
TeamTableView.displayName = "TeamTableView";

// <== EXPORT ==>
export default TeamTableView;
