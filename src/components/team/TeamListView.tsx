// <== IMPORTS ==>
import {
  Send,
  UserX,
  Users,
  Trash2,
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

// <== TEAM LIST VIEW PROPS ==>
interface TeamListViewProps {
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
  // <== RESEND MUTATION PENDING ==>
  resendPending: boolean;
  // <== STATUS MUTATION PENDING ==>
  statusPending: boolean;
}

// <== ROLE AVATAR CONFIG — BACKGROUND AND TEXT COLORS ==>
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

// <== TEAM LIST VIEW COMPONENT ==>
const TeamListView = memo(
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
    resendPending,
    statusPending,
  }: TeamListViewProps) => {
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
    // RETURNING LIST VIEW
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* LIST ITEMS */}
        <div className="divide-y divide-border/50">
          {/* LOADING SKELETONS */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="px-3 sm:px-4 py-3 flex items-center gap-3"
              >
                {/* AVATAR SKELETON */}
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
                {/* STATUS SKELETON */}
                <Skeleton className="h-5 w-14 rounded-full hidden sm:block" />
                {/* ACTIONS SKELETON */}
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // RENDERING EACH MEMBER ROW
            records.map((member, i) => {
              // COMPUTING WHETHER ACTOR CAN MANAGE THIS MEMBER
              const manageable = canManage(member);
              // COMPUTING WHETHER THIS IS THE ACTOR THEMSELVES
              const isSelf = member._id === actorId;
              // RETURNING EACH MEMBER ROW
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-3 sm:px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group"
                >
                  {/* AVATAR — INITIALS WITH ROLE-COLORED BACKGROUND */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                      ROLE_AVATAR_CLASS[member.role],
                    )}
                  >
                    {getInitials(member.fullName)}
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* NAME + ROLE BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm leading-tight">
                        {member.fullName}
                        {isSelf && (
                          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      <Badge
                        variant={
                          member.role === "superadmin"
                            ? "default"
                            : member.role === "admin"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </div>
                    {/* EMAIL + SETUP STATUS */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member.email}
                      {!member.hasSetPassword && (
                        <span className="ml-2 text-amber-500 dark:text-amber-400 font-medium">
                          · Pending Setup
                        </span>
                      )}
                    </p>
                  </div>
                  {/* STATUS BADGE — HIDDEN ON MOBILE */}
                  <div className="shrink-0 hidden sm:block">
                    <Badge
                      variant={member.isActive ? "secondary" : "destructive"}
                      className={
                        member.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent"
                          : ""
                      }
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                </motion.div>
              );
            })}
        </div>
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
TeamListView.displayName = "TeamListView";

// <== EXPORT ==>
export default TeamListView;
