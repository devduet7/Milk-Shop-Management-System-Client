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
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/types/team-types";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember, UserRole } from "@/types/team-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== TEAM GRID VIEW PROPS ==>
interface TeamGridViewProps {
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

// <== ROLE TOP BAR COLORS — VISUAL IDENTITY PER ROLE ==>
const ROLE_TOP_BAR: Record<UserRole, string> = {
  // SUPERADMIN TOP BAR CLASS
  superadmin: "bg-primary",
  // ADMIN TOP BAR CLASS
  admin: "bg-blue-500",
  // USER TOP BAR CLASS
  user: "bg-muted-foreground/30",
};

// <== ROLE AVATAR COLORS ==>
const ROLE_AVATAR_CLASS: Record<UserRole, string> = {
  // SUPERADMIN AVATAR CLASS
  superadmin: "bg-primary/15 text-primary",
  // ADMIN AVATAR CLASS
  admin: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  // USER AVATAR CLASS
  user: "bg-muted text-muted-foreground",
};

// <== HELPER: COMPUTE INITIALS FROM FULL NAME ==>
const getInitials = (fullName: string): string => {
  // SPLITTING NAME INTO PARTS
  const parts = fullName.trim().split(/\s+/);
  // SINGLE WORD — USE FIRST TWO CHARACTERS
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // MULTIPLE WORDS — USE FIRST AND LAST INITIAL
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// <== TEAM GRID VIEW COMPONENT ==>
const TeamGridView = memo(
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
  }: TeamGridViewProps) => {
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
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card overflow-hidden">
                <div className="h-[3px] bg-muted/50" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // MAPPING EACH MEMBER
            records.map((member, i) => {
              // COMPUTING WHETHER ACTOR CAN MANAGE THIS MEMBER
              const manageable = canManage(member);
              // COMPUTING WHETHER THIS IS THE ACTOR THEMSELVES
              const isSelf = member._id === actorId;
              // RETURNING EACH MEMBER CARD
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden hover:shadow-md transition-all group flex flex-col"
                >
                  {/* ROLE-COLORED TOP BAR */}
                  <div className={cn("h-[3px]", ROLE_TOP_BAR[member.role])} />
                  {/* CARD BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* CARD HEADER — AVATAR AND ROLE BADGE */}
                    <div className="flex items-start justify-between mb-3">
                      {/* INITIALS AVATAR */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold",
                          ROLE_AVATAR_CLASS[member.role],
                        )}
                      >
                        {getInitials(member.fullName)}
                      </div>
                      {/* ROLE BADGE */}
                      <Badge
                        variant={
                          member.role === "superadmin"
                            ? "default"
                            : member.role === "admin"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </div>
                    {/* MEMBER NAME */}
                    <div className="flex-1 mb-3">
                      <p className="font-display text-base font-bold leading-tight">
                        {member.fullName}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {member.email}
                      </p>
                    </div>
                    {/* STATUS AND SETUP BADGES */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Badge
                        variant={member.isActive ? "secondary" : "destructive"}
                        className={cn(
                          "text-[10px]",
                          member.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent"
                            : "",
                        )}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {!member.hasSetPassword && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-400 text-amber-600 dark:text-amber-400"
                        >
                          Pending Setup
                        </Badge>
                      )}
                    </div>
                    {/* CARD FOOTER — ADDED BY + ACTIONS */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      {/* ADDED BY */}
                      <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {member.createdBy?.fullName
                          ? `By ${member.createdBy.fullName}`
                          : "—"}
                      </p>
                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {/* RESEND INVITE */}
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
                        {/* EDIT PERMISSIONS */}
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
                        {/* VIEW PERMISSIONS READ-ONLY */}
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
                        {/* ACTIVATE / DEACTIVATE */}
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
                        {/* DELETE */}
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
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
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
        {/* PAGINATION */}
        {!isLoading && totalFiltered > 0 && (
          <div className="glass-card mt-0">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalFiltered={totalFiltered}
              startIndex={startIndex}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              bordered={false}
            />
          </div>
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
TeamGridView.displayName = "TeamGridView";

// <== EXPORT ==>
export default TeamGridView;
