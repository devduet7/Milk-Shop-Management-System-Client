// <== IMPORTS ==>
import {
  List,
  Table2,
  UserPlus,
  UsersRound,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import {
  useListUsers,
  useResendInvite,
  useUpdateStatus,
} from "@/hooks/useTeam";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/useAuthStore";
import TeamListView from "@/components/team/TeamListView";
import TeamGridView from "@/components/team/TeamGridView";
import TeamTableView from "@/components/team/TeamTableView";
import TeamStatsCards from "@/components/team/TeamStatsCards";
import type { TeamMember, TeamViewMode } from "@/types/team-types";
import { PageTransition } from "@/components/layout/PageTransition";
import { InviteUserDialog } from "@/components/team/InviteUserDialog";
import { TeamDeleteDialog } from "@/components/team/TeamDeleteDialog";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { PermissionsDialog } from "@/components/team/PermissionsDialog";

// <== LOCAL STORAGE KEY FOR PERSISTED VIEW MODE ==>
const VIEW_KEY = "team_view";
// <== LOCAL STORAGE KEY FOR PERSISTED ROWS PER PAGE ==>
const ROWS_KEY = "team_rows_per_page";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (v: string | null): v is TeamViewMode =>
  v === "table" || v === "list" || v === "grid";

// <== GET INITIAL VIEW FROM LOCAL STORAGE ==>
const getInitialView = (): TeamViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem(VIEW_KEY);
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL ROWS FROM LOCAL STORAGE ==>
const getInitialRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem(ROWS_KEY);
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "20", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 20 : parsed;
};

// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== VIEW MODE ==>
  mode: TeamViewMode;
  // <== ICON COMPONENT ==>
  icon: LucideIcon;
  // <== TOOLTIP LABEL ==>
  label: string;
};

// <== VIEW BUTTONS CONFIG ==>
const VIEW_BUTTONS: ViewButton[] = [
  // TABLE VIEW
  { mode: "table", icon: Table2, label: "Table" },
  // LIST VIEW
  { mode: "list", icon: List, label: "List" },
  // GRID VIEW
  { mode: "grid", icon: LayoutGrid, label: "Grid" },
];

// <== TABLE SKELETON ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[120, 80, 70, 80, 100, 80].map((w, i) => (
              <th key={i} className="px-3 py-2.5">
                <Skeleton style={{ width: w, height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border/50">
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
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>
);

// <== LIST SKELETON ==>
const ListSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="divide-y divide-border/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-3 sm:px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full hidden sm:block" />
          <div className="flex items-center gap-1 shrink-0">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </div>
);

// <== GRID SKELETON ==>
const GridSkeleton = () => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
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
    </div>
    <div className="glass-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

// <== FULL PAGE SKELETON ==>
const TeamPageSkeleton = ({ view }: { view: TeamViewMode }) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      <Skeleton className="h-9 w-36 rounded-md" />
    </div>
    {/* STATS SKELETON — 4 CARDS */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 md:p-5">
          <div className="mb-2 sm:mb-3">
            <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          </div>
          <Skeleton className="h-3 w-20 mb-1.5" />
          <Skeleton className="h-5 sm:h-7 w-12 sm:w-16" />
        </div>
      ))}
    </div>
    {/* CONTROLS ROW SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <Skeleton className="h-5 w-36" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-48 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
    {/* VIEW-SPECIFIC SKELETON */}
    {view === "table" && <TableSkeleton />}
    {view === "list" && <ListSkeleton />}
    {view === "grid" && <GridSkeleton />}
  </div>
);

// <== TEAM PAGE COMPONENT ==>
const Team = memo(() => {
  // GETTING CURRENT USER FROM AUTH STORE FOR ACTOR ROLE AND ID
  const user = useAuthStore((state) => state.user);
  // ROLE FILTER STATE
  const [roleFilter, setRoleFilter] = useState<string>("");
  // SEARCH QUERY STATE
  const [search, setSearch] = useState<string>("");
  // VIEW MODE STATE — INITIALISED FROM LOCAL STORAGE
  const [viewMode, setViewMode] = useState<TeamViewMode>(getInitialView);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALISED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRows);
  // INVITE DIALOG OPEN STATE
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  // PERMISSIONS DIALOG OPEN STATE
  const [permissionsOpen, setPermissionsOpen] = useState<boolean>(false);
  // DELETE DIALOG OPEN STATE
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  // SELECTED MEMBER FOR DIALOGS
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  // DEBOUNCED SEARCH — 300MS DELAY BEFORE HITTING THE API
  const debouncedSearch = useDebounce(search, 300);
  // RESEND INVITE MUTATION — LIFTED TO PAGE LEVEL FOR CONSISTENT PENDING STATE
  const resendMutation = useResendInvite();
  // UPDATE STATUS MUTATION — LIFTED TO PAGE LEVEL FOR CONSISTENT PENDING STATE
  const statusMutation = useUpdateStatus();
  // RESET PAGE TO 1 WHENEVER FILTERS CHANGE
  useEffect(() => {
    // RESETTING CURRENT PAGE
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);
  // FETCHING TEAM MEMBERS WITH ACTIVE FILTERS
  const { data, isLoading, isError } = useListUsers({
    search: debouncedSearch,
    role: roleFilter,
    page: currentPage,
    limit: rowsPerPage,
  });
  // COMPUTED RECORDS WITH SAFE FALLBACK
  const records = useMemo(() => data?.records ?? [], [data?.records]);
  // COMPUTED TOTAL COUNT WITH SAFE FALLBACK
  const totalFiltered = data?.pagination?.total ?? 0;
  // COMPUTED TOTAL PAGES WITH SAFE FALLBACK
  const totalPages = data?.pagination?.totalPages ?? 1;
  // COMPUTED START INDEX FOR PAGINATION DISPLAY
  const startIndex = (currentPage - 1) * rowsPerPage;
  // HANDLE VIEW MODE CHANGE
  const handleSetView = useCallback((mode: TeamViewMode): void => {
    // UPDATE VIEW MODE STATE
    setViewMode(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem(VIEW_KEY, mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsChange = useCallback((value: string): void => {
    // PARSE VALUE TO INTEGER
    const parsed = Number.parseInt(value, 10);
    // FALLBACK TO 20 IF PARSE FAILS
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 20 : parsed;
    // UPDATE ROWS PER PAGE STATE
    setRowsPerPage(safe);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem(ROWS_KEY, String(safe));
  }, []);
  // HANDLE RESEND INVITE — FIRES MUTATION AND SHOWS TOAST
  const handleResendInvite = useCallback(
    (member: TeamMember): void => {
      // FIRE RESEND MUTATION
      resendMutation.mutate(member._id, {
        onSuccess: (res) => {
          // SHOW SUCCESS TOAST WITH SERVER MESSAGE
          toast.success(res.message || `Invite resent to ${member.email}.`);
        },
      });
    },
    [resendMutation],
  );
  // HANDLE STATUS TOGGLE — FIRES MUTATION AND SHOWS TOAST
  const handleStatusToggle = useCallback(
    (member: TeamMember): void => {
      // FIRE STATUS MUTATION — INVERT CURRENT STATUS
      statusMutation.mutate(
        { id: member._id, isActive: !member.isActive },
        {
          onSuccess: (res) => {
            // SHOW SUCCESS TOAST WITH SERVER MESSAGE
            toast.success(res.message || "Status updated.");
          },
        },
      );
    },
    [statusMutation],
  );
  // HANDLE OPEN PERMISSIONS DIALOG
  const handleEditPermissions = useCallback((member: TeamMember): void => {
    // SET SELECTED MEMBER
    setSelectedMember(member);
    // OPEN DIALOG
    setPermissionsOpen(true);
  }, []);
  // HANDLE OPEN DELETE DIALOG
  const handleDeleteOpen = useCallback((member: TeamMember): void => {
    // SET SELECTED MEMBER
    setSelectedMember(member);
    // OPEN DIALOG
    setDeleteOpen(true);
  }, []);
  // HANDLE CLOSE PERMISSIONS DIALOG
  const handlePermissionsClose = useCallback((): void => {
    // CLOSE DIALOG
    setPermissionsOpen(false);
    // CLEAR SELECTED MEMBER
    setSelectedMember(null);
  }, []);
  // HANDLE CLOSE DELETE DIALOG
  const handleDeleteClose = useCallback((): void => {
    // CLOSE DIALOG
    setDeleteOpen(false);
    // CLEAR SELECTED MEMBER
    setSelectedMember(null);
  }, []);
  // DERIVE SECTION HEADING BASED ON ACTIVE ROLE FILTER
  const sectionHeading = useMemo((): string => {
    // IF ROLE FILTER IS SUPERADMIN
    if (roleFilter === "superadmin") return "Superadmins";
    // IF ROLE FILTER IS ADMIN
    if (roleFilter === "admin") return "Admins";
    // IF ROLE FILTER IS USER
    if (roleFilter === "user") return "Team Members";
    // DEFAULT — ALL MEMBERS
    return "All Members";
  }, [roleFilter]);
  // SHARED VIEW PROPS OBJECT — SPREAD INTO ALL THREE VIEW COMPONENTS
  const viewProps = {
    records,
    totalFiltered,
    isLoading: isLoading && !!data,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: handleRowsChange,
    actorRole: user?.role ?? "user",
    actorId: user?.id ?? "",
    onResendInvite: handleResendInvite,
    onStatusToggle: handleStatusToggle,
    onEditPermissions: handleEditPermissions,
    onDelete: handleDeleteOpen,
    resendPending: resendMutation.isPending,
    statusPending: statusMutation.isPending,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) {
    // RETURN FULL PAGE SKELETON WITH CURRENT VIEW MODE
    return <TeamPageSkeleton view={viewMode} />;
  }
  // RETURNING TEAM PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <UsersRound className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              Team
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Manage members, roles, and access permissions
            </p>
          </div>
        </div>
        {/* RIGHT: INVITE BUTTON */}
        <Button onClick={() => setInviteOpen(true)} className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>
      {/* STATS CARDS — ACCOUNT-WIDE METRICS, NOT AFFECTED BY SEARCH/ROLE FILTER */}
      <TeamStatsCards stats={data?.stats} isLoading={isLoading} />
      {/* RECORDS SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        {/* SECTION HEADING WITH COUNT */}
        <h2 className="font-display text-base sm:text-lg font-semibold">
          {sectionHeading}
          {totalFiltered > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalFiltered} member{totalFiltered !== 1 ? "s" : ""})
            </span>
          )}
        </h2>
        {/* RIGHT CONTROLS — SEARCH + ROLE FILTER + VIEW TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-44 sm:w-52 text-sm"
            />
          </div>
          {/* ROLE FILTER SELECT */}
          <Select
            value={roleFilter || "all"}
            onValueChange={(v) => {
              setRoleFilter(v === "all" ? "" : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 shrink-0">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Team Member</SelectItem>
            </SelectContent>
          </Select>
          {/* VIEW TOGGLE */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
            {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
              <Tooltip key={mode} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSetView(mode)}
                    className={cn(
                      "p-1.5 rounded-md transition-all duration-200",
                      viewMode === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label} view</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5">
          <p className="text-sm text-muted-foreground">
            Failed to load team data. Please check your connection and try
            again.
          </p>
        </div>
      )}
      {/* TABLE VIEW */}
      {viewMode === "table" && <TeamTableView {...viewProps} />}
      {/* LIST VIEW */}
      {viewMode === "list" && <TeamListView {...viewProps} />}
      {/* GRID VIEW */}
      {viewMode === "grid" && <TeamGridView {...viewProps} />}
      {/* INVITE USER DIALOG */}
      <InviteUserDialog
        open={inviteOpen}
        actorRole={user?.role ?? "admin"}
        onClose={() => setInviteOpen(false)}
      />
      {/* PERMISSIONS DIALOG */}
      <PermissionsDialog
        open={permissionsOpen}
        member={selectedMember}
        onClose={handlePermissionsClose}
      />
      {/* DELETE CONFIRMATION DIALOG */}
      <TeamDeleteDialog
        open={deleteOpen}
        member={selectedMember}
        onClose={handleDeleteClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Team.displayName = "Team";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Team;
