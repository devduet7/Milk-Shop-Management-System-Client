// <== IMPORTS ==>
import {
  Milk,
  List,
  Plus,
  Table2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import type {
  MilkLog,
  MilkLogViewMode,
  MilkLogTypeFilter,
  MilkLogFilterType,
} from "@/types/milk-log-types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletionMode } from "@/hooks/useSettings";
import DatePicker from "@/components/common/DatePicker";
import DateRangePicker from "@/components/common/DateRangePicker";
import { PageTransition } from "@/components/layout/PageTransition";
import { useMilkLogs, useDeleteMilkLog } from "@/hooks/useMilkLogs";
import MilkLogGridView from "@/components/milkLogs/MilkLogGridView";
import MilkLogListView from "@/components/milkLogs/MilkLogListView";
import MilkLogTableView from "@/components/milkLogs/MilkLogTableView";
import MilkLogStatsCards from "@/components/milkLogs/MilkLogStatsCards";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import MilkLogFormDialog from "@/components/milkLogs/MilkLogFormDialog";
import MilkLogDeleteDialog from "@/components/milkLogs/MilkLogDeleteDialog";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is MilkLogViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL VIEW MODE FROM LOCAL STORAGE ==>
const getInitialViewMode = (): MilkLogViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("milklogs_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialRowsPerPage = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("milklogs_rows_per_page");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "10", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
};

// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== VIEW MODE ==>
  mode: MilkLogViewMode;
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

// <== FILTER BUTTON TYPE ==>
type FilterButton = {
  // <== FILTER VALUE ==>
  value: MilkLogFilterType;
  // <== DISPLAY LABEL ==>
  label: string;
};

// <== FILTER BUTTONS CONFIG — PILLS FOR TODAY / WEEK / MONTH; DATE AND RANGE ARE SEPARATE PICKERS ==>
const FILTER_BUTTONS: FilterButton[] = [
  // TODAY FILTER
  { value: "today", label: "Today" },
  // WEEK FILTER
  { value: "week", label: "This Week" },
  // MONTH FILTER
  { value: "month", label: "This Month" },
];

// <== TYPE FILTER OPTIONS ==>
const TYPE_OPTIONS: { value: MilkLogTypeFilter; label: string }[] = [
  // ALL ENTRIES
  { value: "all", label: "All Entries" },
  // LEFTOVER ONLY
  { value: "leftover", label: "Leftover Only" },
  // YOGHURT ONLY
  { value: "yoghurt", label: "Yoghurt Only" },
];

// <== TABLE SKELETON — MIRRORS TABLE VIEW LAYOUT ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {[80, 80, 90, 140, 60].map((w, i) => (
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
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
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

// <== LIST SKELETON — MIRRORS LIST VIEW LAYOUT ==>
const ListSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="divide-y divide-border/50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 sm:p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
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

// <== GRID SKELETON — MIRRORS GRID VIEW LAYOUT ==>
const GridSkeleton = () => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="h-[3px] bg-muted/60" />
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-16 rounded-lg" />
            <div className="flex items-center justify-end pt-1 border-t border-border/50">
              <div className="flex gap-0.5">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="glass-card">
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
  </div>
);

// <== FULL PAGE SKELETON — MIRRORS ENTIRE MILK LOGS PAGE LAYOUT ==>
const MilkLogsPageSkeleton = ({ view }: { view: MilkLogViewMode }) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 sm:w-32" />
          <Skeleton className="h-3 w-44 sm:w-56 hidden sm:block" />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
    {/* STATS CARDS SKELETON — 4 CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-3 sm:p-4 md:p-5 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted/60 rounded-t-xl" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-5 sm:h-6 md:h-7 w-20 sm:w-24 mt-0.5" />
        </div>
      ))}
    </div>
    {/* VIEW-SPECIFIC SKELETON */}
    {view === "table" && <TableSkeleton />}
    {view === "list" && <ListSkeleton />}
    {view === "grid" && <GridSkeleton />}
  </div>
);

// <== MILK LOGS PAGE COMPONENT ==>
const MilkLogs = memo(() => {
  // ACTIVE FILTER TYPE STATE — DEFAULTS TO TODAY
  const [filterType, setFilterType] = useState<MilkLogFilterType>("today");
  // SELECTED MONTH STATE — USED WHEN FILTER IS MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // SELECTED SPECIFIC DATE FOR THE DATE PICKER FILTER (YYYY-MM-DD | NULL)
  const [specificDate, setSpecificDate] = useState<string | null>(null);
  // SELECTED RANGE START FOR THE DATE RANGE PICKER FILTER (YYYY-MM-DD | NULL)
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  // SELECTED RANGE END FOR THE DATE RANGE PICKER FILTER (YYYY-MM-DD | NULL)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  // ENTRY TYPE FILTER STATE
  const [entryType, setEntryType] = useState<MilkLogTypeFilter>("all");
  // VIEW MODE STATE — INITIALIZED FROM LOCAL STORAGE
  const [view, setView] = useState<MilkLogViewMode>(getInitialViewMode);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALIZED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRowsPerPage);
  // ADD / EDIT DIALOG OPEN STATE
  const [formOpen, setFormOpen] = useState<boolean>(false);
  // MILK LOG BEING EDITED (NULL = ADD MODE)
  const [editMilkLog, setEditMilkLog] = useState<MilkLog | null>(null);
  // DELETE DIALOG OPEN STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // MILK LOG RECORD STAGED FOR DELETION
  const [deleteTarget, setDeleteTarget] = useState<MilkLog | null>(null);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // DERIVING DELETION MODE FOR THIS ACCOUNT — DETERMINES WHETHER DELETE ASKS FOR CONFIRMATION
  const { isTrashMode } = useDeletionMode();
  // MILK LOG PAGE IS ADMIN-TIER ONLY — NO PERMISSION MATRIX CHECK NEEDED
  const canEdit = true;
  // DELETE PERMISSION — ALWAYS TRUE, SAME REASONING AS ABOVE
  const canDelete = true;
  // FETCH MILK LOGS FROM SERVER WITH ALL ACTIVE FILTERS
  const { data, isLoading, isError } = useMilkLogs(
    filterType,
    specificDate ?? "",
    monthStr,
    rangeStart ?? "",
    rangeEnd ?? "",
    entryType,
    currentPage,
    rowsPerPage,
  );
  // DELETE MILK LOG MUTATION
  const deleteMutation = useDeleteMilkLog();
  // RESET TO PAGE 1 WHEN ANY FILTER CHANGES
  useEffect(() => {
    // RESET TO PAGE 1
    setCurrentPage(1);
  }, [filterType, specificDate, monthStr, rangeStart, rangeEnd, entryType]);
  // MILK LOG RECORDS FROM API RESPONSE — ALREADY PAGINATED BY SERVER
  const milkLogs = useMemo(() => data?.records ?? [], [data?.records]);
  // STATS FROM API RESPONSE
  const stats = data?.stats;
  // TOTAL MATCHING RECORDS ACROSS ALL PAGES
  const totalFiltered = data?.pagination?.total ?? 0;
  // TOTAL PAGES FROM SERVER PAGINATION META
  const totalPages = data?.pagination?.totalPages ?? 1;
  // START INDEX FOR DISPLAY LABEL
  const startIndex = (currentPage - 1) * rowsPerPage;
  // SET AND PERSIST VIEW MODE TO LOCAL STORAGE
  const handleSetView = useCallback((mode: MilkLogViewMode): void => {
    // UPDATE VIEW STATE
    setView(mode);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("milklogs_view", mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = useCallback((value: string): void => {
    // PARSE NEW VALUE
    const parsed = Number.parseInt(value, 10);
    // SANITIZE: FALLBACK TO 10 IF INVALID
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE STATE
    setRowsPerPage(safe);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("milklogs_rows_per_page", String(safe));
  }, []);
  // HANDLE FILTER PILL CHANGE — CLEARS THE OTHER TWO FILTER MECHANISMS
  const handleFilterChange = useCallback(
    (newFilter: MilkLogFilterType): void => {
      // UPDATE FILTER
      setFilterType(newFilter);
      // CLEARING THE DATE PICKER SELECTION
      setSpecificDate(null);
      // CLEARING THE DATE RANGE PICKER SELECTION
      setRangeStart(null);
      // CLEARING THE DATE RANGE PICKER END
      setRangeEnd(null);
    },
    [],
  );
  // HANDLE DATE PICKER SELECT — ACTIVATES THE DATE FILTER, CLEARS THE RANGE FILTER
  const handleDateSelect = useCallback((date: string): void => {
    // UPDATE SPECIFIC DATE
    setSpecificDate(date);
    // CLEARING THE DATE RANGE PICKER SELECTION
    setRangeStart(null);
    // CLEARING THE DATE RANGE PICKER END
    setRangeEnd(null);
    // SWITCH TO DATE FILTER
    setFilterType("date");
  }, []);
  // HANDLE DATE PICKER CLEAR — REVERT TO TODAY FILTER
  const handleDateClear = useCallback((): void => {
    // CLEAR SPECIFIC DATE
    setSpecificDate(null);
    // SWITCH BACK TO TODAY FILTER
    setFilterType("today");
  }, []);
  // HANDLE DATE RANGE PICKER SELECT — ACTIVATES THE RANGE FILTER, CLEARS THE DATE FILTER
  const handleRangeSelect = useCallback((start: string, end: string): void => {
    // UPDATE RANGE START
    setRangeStart(start);
    // UPDATE RANGE END
    setRangeEnd(end);
    // CLEARING THE DATE PICKER SELECTION
    setSpecificDate(null);
    // SWITCH TO RANGE FILTER
    setFilterType("range");
  }, []);
  // HANDLE DATE RANGE PICKER CLEAR — REVERT TO TODAY FILTER
  const handleRangeClear = useCallback((): void => {
    // CLEAR RANGE START
    setRangeStart(null);
    // CLEAR RANGE END
    setRangeEnd(null);
    // SWITCH BACK TO TODAY FILTER
    setFilterType("today");
  }, []);
  // HANDLE MONTH NAVIGATION — DECREMENT MONTH
  const handlePrevMonth = useCallback((): void => {
    // SETTING SELECTED MONTH TO PREVIOUS MONTH
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
  }, []);
  // HANDLE MONTH NAVIGATION — INCREMENT MONTH (BLOCKED FOR FUTURE MONTHS)
  const handleNextMonth = useCallback((): void => {
    // SET SELECTED MONTH TO NEXT MONTH
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
  }, []);
  // OPEN ADD MILK LOG DIALOG
  const handleAddOpen = useCallback((): void => {
    // CLEAR ANY EDIT STATE
    setEditMilkLog(null);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // OPEN EDIT MILK LOG DIALOG
  const handleEdit = useCallback((record: MilkLog): void => {
    // SET RECORD TO EDIT
    setEditMilkLog(record);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // CLOSE FORM DIALOG
  const handleFormClose = useCallback((): void => {
    // CLOSE DIALOG
    setFormOpen(false);
    // CLEAR EDIT STATE
    setEditMilkLog(null);
  }, []);
  // STAGE MILK LOG FOR DELETE
  const handleDelete = useCallback(
    (record: MilkLog): void => {
      // IF THE DELETION MODE IS TRASH
      if (isTrashMode) {
        // CALL DELETE MUTATION DIRECTLY
        deleteMutation.mutate(record._id);
        // RETURN EARLY TO STOP FURTHER EXECUTION
        return;
      }
      // STAGE RECORD FOR DELETION
      setDeleteTarget(record);
      // OPEN CONFIRMATION DIALOG
      setDeleteDialogOpen(true);
    },
    [isTrashMode, deleteMutation],
  );
  // CONFIRM DELETE — CALLED FROM DELETE DIALOG ON CONFIRM
  const handleDeleteConfirm = useCallback((): void => {
    // GUARD: ENSURE A TARGET IS STAGED
    if (!deleteTarget) return;
    // CALL DELETE MUTATION
    deleteMutation.mutate(deleteTarget._id, {
      // ON SUCCESS CALLBACK
      onSuccess: () => {
        // CLOSE DIALOG AND CLEAR TARGET
        setDeleteDialogOpen(false);
        // CLEAR STAGED TARGET
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation]);
  // CLOSE DELETE DIALOG — BLOCKED WHILE MUTATION IS PENDING
  const handleDeleteClose = useCallback((): void => {
    // BLOCK CLOSE WHILE PENDING
    if (deleteMutation.isPending) return;
    // CLOSE DIALOG AND CLEAR STAGED TARGET
    setDeleteDialogOpen(false);
    // CLEAR STAGED TARGET
    setDeleteTarget(null);
  }, [deleteMutation.isPending]);
  // IS NEXT MONTH DISABLED (CANNOT NAVIGATE PAST CURRENT MONTH)
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // DERIVE RECORDS SECTION HEADING BASED ON ACTIVE FILTER
  const sectionHeading = useMemo((): string => {
    // IF FILTER TYPE IS TODAY
    if (filterType === "today") return "Today's Entries";
    // IF FILTER TYPE IS WEEK
    if (filterType === "week") return "This Week's Entries";
    // IF FILTER TYPE IS MONTH
    if (filterType === "month")
      // SHOW SELECTED MONTH AND YEAR
      return `${format(selectedMonth, "MMMM yyyy")} Entries`;
    // IF FILTER TYPE IS DATE
    if (filterType === "date" && specificDate)
      // SHOW SPECIFIC DATE
      return `Entries — ${specificDate}`;
    // IF FILTER TYPE IS RANGE
    if (filterType === "range" && rangeStart && rangeEnd)
      // SHOW START AND END RANGE
      return `Entries — ${rangeStart} to ${rangeEnd}`;
    // DEFAULT HEADING
    return "Entries";
  }, [filterType, selectedMonth, specificDate, rangeStart, rangeEnd]);
  // SHARED PROPS OBJECT PASSED TO ALL THREE VIEW COMPONENTS
  const viewProps = {
    milkLogs,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: handleRowsPerPageChange,
    onEdit: handleEdit,
    onDelete: handleDelete,
    canEdit,
    canDelete,
  };
  // SHOW FULL PAGE SKELETON ONLY ON INITIAL LOAD
  if (isLoading && !data) {
    // RETURNING FULL PAGE SKELETON
    return <MilkLogsPageSkeleton view={view} />;
  }
  // RETURNING MILK LOGS PAGE
  return (
    // PAGE WRAPPER WITH TRANSITION
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Milk className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          {/* TITLE AND DESCRIPTION */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Milk Log
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Track leftover milk carried over and milk used for yoghurt
            </p>
          </div>
        </div>
        {/* RIGHT: CONTROLS — TWO ROWS ON MOBILE, STACKED ON LARGER SCREENS */}
        <div className="flex flex-col gap-2 sm:items-end">
          {/* ROW 1: FILTER PILLS + PICKERS + MONTH NAVIGATION */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* FILTER TYPE PILLS */}
            {FILTER_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                  filterType === value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
                )}
              >
                {label}
              </button>
            ))}
            {/* CUSTOM DATE PICKER */}
            <DatePicker
              selectedDate={specificDate}
              onDateSelect={handleDateSelect}
              onClear={handleDateClear}
            />
            {/* CUSTOM DATE RANGE PICKER */}
            <DateRangePicker
              startDate={rangeStart}
              endDate={rangeEnd}
              onRangeSelect={handleRangeSelect}
              onClear={handleRangeClear}
            />
            {/* MONTH NAVIGATION — ONLY SHOWN WHEN MONTH FILTER IS ACTIVE */}
            {filterType === "month" && (
              <div className="flex items-center gap-1 ml-1">
                {/* PREVIOUS MONTH */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {/* CURRENT MONTH LABEL */}
                <span className="text-xs font-medium whitespace-nowrap min-w-[80px] text-center">
                  {format(selectedMonth, "MMM yyyy")}
                </span>
                {/* NEXT MONTH (DISABLED FOR FUTURE MONTHS) */}
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
            )}
          </div>
          {/* ROW 2: TYPE FILTER + VIEW TOGGLES + ADD BUTTON */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* ENTRY TYPE FILTER SELECT */}
            <Select
              value={entryType}
              onValueChange={(val) => setEntryType(val as MilkLogTypeFilter)}
            >
              <SelectTrigger className="h-9 w-36 shrink-0">
                <SelectValue placeholder="All Entries" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* VIEW TOGGLE BUTTONS */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
              {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
                <Tooltip key={mode} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSetView(mode)}
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        view === mode
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
            {/* ADD MILK LOG BUTTON */}
            <Button onClick={handleAddOpen} className="shrink-0 h-9">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            Failed to load milk log entries. Please check your connection and
            try again.
          </p>
        </div>
      )}
      {/* STATS CARDS */}
      <MilkLogStatsCards stats={stats} isLoading={isLoading} />
      {/* RECORDS SECTION HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base sm:text-lg font-semibold">
          {sectionHeading}
          {totalFiltered > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalFiltered} record{totalFiltered !== 1 ? "s" : ""})
            </span>
          )}
        </h2>
      </div>
      {/* TABLE VIEW */}
      {view === "table" && <MilkLogTableView {...viewProps} />}
      {/* LIST VIEW */}
      {view === "list" && <MilkLogListView {...viewProps} />}
      {/* GRID VIEW */}
      {view === "grid" && <MilkLogGridView {...viewProps} />}
      {/* ADD / EDIT FORM DIALOG */}
      <MilkLogFormDialog
        open={formOpen}
        editMilkLog={editMilkLog}
        onClose={handleFormClose}
      />
      {/* DELETE CONFIRMATION DIALOG */}
      <MilkLogDeleteDialog
        open={deleteDialogOpen}
        record={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
MilkLogs.displayName = "MilkLogs";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default MilkLogs;
