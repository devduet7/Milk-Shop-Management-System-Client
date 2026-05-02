// <== IMPORTS ==>
import {
  List,
  Plus,
  Users,
  Search,
  Table2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStaff } from "@/hooks/useStaff";
import { useDeleteStaff } from "@/hooks/useStaff";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import StaffGridView from "@/components/staff/StaffGridView";
import StaffListView from "@/components/staff/StaffListView";
import StaffTableView from "@/components/staff/StaffTableView";
import StaffFormDialog from "@/components/staff/StaffFormDialog";
import StaffStatsCards from "@/components/staff/StaffStatsCards";
import { PageTransition } from "@/components/layout/PageTransition";
import ExtraHistoryModal from "@/components/staff/ExtraHistoryModal";
import type { StaffMember, StaffViewMode } from "@/types/staff-types";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import SalaryPaymentDialog from "@/components/staff/SalaryPaymentDialog";
import ExtraAllocationDialog from "@/components/staff/ExtraAllocationDialog";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is StaffViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL VIEW MODE FROM LOCAL STORAGE ==>
const getInitialView = (): StaffViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("staff_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("staff_rows_per_page");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "10", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
};

// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== VIEW MODE ==>
  mode: StaffViewMode;
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
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[120, 100, 90, 80, 80, 120].map((w, i) => (
              <th key={i} className="px-3 py-2.5">
                <Skeleton style={{ width: w, height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-24 mb-1.5" />
                <Skeleton className="h-3 w-16" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-8 w-32 rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 sm:p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="shrink-0 hidden sm:block space-y-1">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-14 ml-auto" />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
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
        <div key={i} className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-28" />
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
    <div className="glass-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
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
const StaffPageSkeleton = ({ view }: { view: StaffViewMode }) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24 sm:w-28" />
          <Skeleton className="h-3 w-40 sm:w-52 hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    {/* STATS CARDS SKELETON */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 md:p-5">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg" />
            <Skeleton className="h-5 w-7 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24 mb-1.5" />
          <Skeleton className="h-5 sm:h-6 md:h-7 w-20 sm:w-28" />
        </div>
      ))}
    </div>
    {/* CONTROLS ROW SKELETON */}
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-4">
      <Skeleton className="h-9 w-full sm:w-60 rounded-lg" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
    {/* VIEW-SPECIFIC SKELETON */}
    {view === "table" && <TableSkeleton />}
    {view === "list" && <ListSkeleton />}
    {view === "grid" && <GridSkeleton />}
  </div>
);

// <== STAFF PAGE COMPONENT ==>
const Staff = memo(() => {
  // SELECTED MONTH STATE — INITIALISED TO CURRENT MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // SEARCH STATE
  const [search, setSearch] = useState<string>("");
  // VIEW MODE STATE — INITIALISED FROM LOCAL STORAGE
  const [viewMode, setViewMode] = useState<StaffViewMode>(getInitialView);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALISED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRows);
  // STAFF FORM DIALOG STATE
  const [formOpen, setFormOpen] = useState<boolean>(false);
  // EDIT TARGET STATE
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  // SALARY PAYMENT DIALOG STATE
  const [salaryDialogOpen, setSalaryDialogOpen] = useState<boolean>(false);
  // SELECTED STAFF FOR SALARY PAYMENT
  const [selectedForSalary, setSelectedForSalary] =
    useState<StaffMember | null>(null);
  // EXTRA ALLOCATION DIALOG STATE
  const [extraDialogOpen, setExtraDialogOpen] = useState<boolean>(false);
  // SELECTED STAFF FOR EXTRA ALLOCATION
  const [selectedForExtra, setSelectedForExtra] = useState<StaffMember | null>(
    null,
  );
  // EXTRA HISTORY MODAL STATE
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  // SELECTED STAFF FOR EXTRA HISTORY
  const [selectedForHistory, setSelectedForHistory] =
    useState<StaffMember | null>(null);
  // DELETE STAFF MUTATION
  const deleteMutation = useDeleteStaff();
  // DEBOUNCE SEARCH INPUT AT 300MS
  const debouncedSearch = useDebounce(search, 300);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // IS NEXT MONTH DISABLED — BLOCK NAVIGATION INTO FUTURE MONTHS
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // FETCH STAFF DATA
  const { data, isLoading, isError } = useStaff(
    monthStr,
    debouncedSearch,
    currentPage,
    rowsPerPage,
  );
  // RESET PAGE TO 1 WHEN FILTERS CHANGE
  useEffect(() => {
    // RESET PAGE TO 1
    setCurrentPage(1);
  }, [monthStr, debouncedSearch]);
  // COMPUTED RECORDS WITH SAFE FALLBACK
  const records = useMemo(() => data?.records ?? [], [data?.records]);
  // COMPUTED TOTAL COUNT WITH SAFE FALLBACK
  const totalFiltered = data?.pagination?.total ?? 0;
  // COMPUTED TOTAL PAGES WITH SAFE FALLBACK
  const totalPages = data?.pagination?.totalPages ?? 1;
  // COMPUTE START INDEX FOR PAGINATION
  const startIndex = (currentPage - 1) * rowsPerPage;
  // HANDLE PREV MONTH
  const handlePrevMonth = useCallback((): void => {
    // DECREMENT MONTH BY 1
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
  }, []);
  // HANDLE NEXT MONTH
  const handleNextMonth = useCallback((): void => {
    // INCREMENT MONTH BY 1
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
  }, []);
  // SET AND PERSIST VIEW MODE
  const handleSetView = useCallback((mode: StaffViewMode): void => {
    // UPDATE VIEW MODE STATE
    setViewMode(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("staff_view", mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsChange = useCallback((value: string): void => {
    // PARSE VALUE TO INTEGER
    const parsed = Number.parseInt(value, 10);
    // FALLBACK TO 10 IF PARSE FAILS OR VALUE IS NON-POSITIVE
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE ROWS PER PAGE STATE
    setRowsPerPage(safe);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
    // PERSIST ROWS PER PAGE TO LOCAL STORAGE
    localStorage.setItem("staff_rows_per_page", String(safe));
  }, []);
  // HANDLE OPEN ADD FORM
  const handleOpenAdd = useCallback((): void => {
    // CLEAR EDIT TARGET
    setEditStaff(null);
    // OPEN FORM DIALOG
    setFormOpen(true);
  }, []);
  // HANDLE OPEN EDIT FORM
  const handleEdit = useCallback((record: StaffMember): void => {
    // SET EDIT TARGET
    setEditStaff(record);
    // OPEN FORM DIALOG
    setFormOpen(true);
  }, []);
  // HANDLE FORM DIALOG CLOSE
  const handleFormClose = useCallback((): void => {
    // CLOSE FORM DIALOG
    setFormOpen(false);
    // CLEAR EDIT TARGET
    setEditStaff(null);
  }, []);
  // HANDLE DELETE STAFF
  const handleDelete = useCallback(
    (record: StaffMember): void => {
      // CALL DELETE MUTATION
      deleteMutation.mutate(record._id);
    },
    [deleteMutation],
  );
  // HANDLE OPEN SALARY PAYMENT DIALOG
  const handlePaySalary = useCallback((record: StaffMember): void => {
    // SET SELECTED STAFF FOR SALARY PAYMENT
    setSelectedForSalary(record);
    // OPEN SALARY PAYMENT DIALOG
    setSalaryDialogOpen(true);
  }, []);
  // HANDLE CLOSE SALARY PAYMENT DIALOG
  const handleSalaryClose = useCallback((): void => {
    // CLOSE SALARY PAYMENT DIALOG
    setSalaryDialogOpen(false);
    // CLEAR SELECTED STAFF
    setSelectedForSalary(null);
  }, []);
  // HANDLE OPEN EXTRA ALLOCATION DIALOG
  const handleExtraAllocation = useCallback((record: StaffMember): void => {
    // SET SELECTED STAFF FOR EXTRA ALLOCATION
    setSelectedForExtra(record);
    // OPEN EXTRA ALLOCATION DIALOG
    setExtraDialogOpen(true);
  }, []);
  // HANDLE CLOSE EXTRA ALLOCATION DIALOG
  const handleExtraClose = useCallback((): void => {
    // CLOSE EXTRA ALLOCATION DIALOG
    setExtraDialogOpen(false);
    // CLEAR SELECTED STAFF
    setSelectedForExtra(null);
  }, []);
  // HANDLE OPEN EXTRA HISTORY MODAL
  const handleViewExtra = useCallback((record: StaffMember): void => {
    // SET SELECTED STAFF FOR HISTORY
    setSelectedForHistory(record);
    // OPEN HISTORY MODAL
    setHistoryOpen(true);
  }, []);
  // HANDLE CLOSE EXTRA HISTORY MODAL
  const handleHistoryClose = useCallback((): void => {
    // CLOSE HISTORY MODAL
    setHistoryOpen(false);
    // CLEAR SELECTED STAFF
    setSelectedForHistory(null);
  }, []);
  // SHARED VIEW PROPS OBJECT
  const viewProps = {
    records,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: handleRowsChange,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onPaySalary: handlePaySalary,
    onExtraAllocation: handleExtraAllocation,
    onViewExtra: handleViewExtra,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) {
    // RETURN FULL PAGE SKELETON WITH CURRENT VIEW MODE
    return <StaffPageSkeleton view={viewMode} />;
  }
  // RETURNING STAFF PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Staff
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Manage staff salaries and extra allocations
            </p>
          </div>
        </div>
        {/* RIGHT: MONTH NAVIGATION */}
        <div className="flex items-center gap-1">
          {/* PREV MONTH BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {/* CURRENT MONTH LABEL */}
          <span className="text-sm font-medium whitespace-nowrap min-w-[90px] text-center">
            {format(selectedMonth, "MMM yyyy")}
          </span>
          {/* NEXT MONTH BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isNextMonthDisabled}
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* STATS CARDS */}
      <StaffStatsCards stats={data?.stats} isLoading={isLoading} />
      {/* CONTROLS ROW */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mb-4">
        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-60 md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full h-9"
          />
        </div>
        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2">
          {/* VIEW TOGGLE */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
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
          {/* ADD STAFF BUTTON */}
          <Button onClick={handleOpenAdd} className="h-9 gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Staff</span>
          </Button>
        </div>
      </div>
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            Failed to load staff data. Please check your connection and try
            again.
          </p>
        </div>
      )}
      {/* TABLE VIEW */}
      {viewMode === "table" && <StaffTableView {...viewProps} />}
      {/* LIST VIEW */}
      {viewMode === "list" && <StaffListView {...viewProps} />}
      {/* GRID VIEW */}
      {viewMode === "grid" && <StaffGridView {...viewProps} />}
      {/* STAFF FORM DIALOG */}
      <StaffFormDialog
        open={formOpen}
        editStaff={editStaff}
        onClose={handleFormClose}
      />
      {/* SALARY PAYMENT DIALOG */}
      <SalaryPaymentDialog
        open={salaryDialogOpen}
        staff={selectedForSalary}
        month={monthStr}
        onClose={handleSalaryClose}
      />
      {/* EXTRA ALLOCATION DIALOG */}
      <ExtraAllocationDialog
        open={extraDialogOpen}
        staff={selectedForExtra}
        month={monthStr}
        onClose={handleExtraClose}
      />
      {/* EXTRA HISTORY MODAL */}
      <ExtraHistoryModal
        open={historyOpen}
        staff={selectedForHistory}
        month={monthStr}
        onClose={handleHistoryClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Staff.displayName = "Staff";

// <== EXPORT ==>
export default Staff;
