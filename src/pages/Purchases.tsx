// <== IMPORTS ==>
import {
  Plus,
  List,
  Search,
  Package,
  Table2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type {
  Purchase,
  ViewMode,
  PurchaseFilter,
} from "@/types/purchase-types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { PageTransition } from "@/components/layout/PageTransition";
import { usePurchases, useDeletePurchase } from "@/hooks/usePurchases";
import PurchaseGridView from "@/components/purchases/PurchaseGridView";
import PurchaseListView from "@/components/purchases/PurchaseListView";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PurchaseTableView from "@/components/purchases/PurchaseTableView";
import PurchaseStatsCards from "@/components/purchases/PurchaseStatsCards";
import PurchaseFormDialog from "@/components/purchases/PurchaseFormDialog";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is ViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL VIEW MODE FROM LOCAL STORAGE ==>
const getInitialViewMode = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("purchases_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialRowsPerPage = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("purchases_rows_per_page");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "10", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
};

// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== VIEW MODE ==>
  mode: ViewMode;
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
  value: PurchaseFilter;
  // <== DISPLAY LABEL ==>
  label: string;
};

// <== FILTER BUTTONS CONFIG ==>
const FILTER_BUTTONS: FilterButton[] = [
  // TODAY FILTER
  { value: "today", label: "Today" },
  // WEEK FILTER
  { value: "week", label: "This Week" },
  // MONTH FILTER
  { value: "month", label: "This Month" },
];

// <== TABLE SKELETON — MIRRORS TABLE VIEW LAYOUT ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[100, 70, 80, 90, 80, 140, 60].map((w, i) => (
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
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* SKELETON PAGINATION */}
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
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="shrink-0 hidden sm:block text-right space-y-1">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
    {/* SKELETON PAGINATION */}
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
        <div key={i} className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-0.5">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* SKELETON PAGINATION */}
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

// <== FULL PAGE SKELETON — MIRRORS ENTIRE PURCHASES PAGE LAYOUT ==>
const PurchasesPageSkeleton = ({ view }: { view: ViewMode }) => (
  // SAME WRAPPER CLASS AS THE REAL PAGE SO LAYOUT IS IDENTICAL
  <div className="page-container">
    {/* HEADER SKELETON — MIRRORS REAL HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* LEFT: ICON + TITLE */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 sm:w-32" />
          <Skeleton className="h-3 w-44 sm:w-56 hidden sm:block" />
        </div>
      </div>
      {/* RIGHT: CONTROLS — TWO ROWS MIRRORING REAL CONTROLS */}
      <div className="flex flex-col gap-2 sm:items-end">
        {/* ROW 1: FILTER PILLS SKELETON */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        {/* ROW 2: SEARCH + VIEW TOGGLES + ADD */}
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-full sm:w-52 md:w-56 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
    {/* STATS CARDS SKELETON — 1 COL MOBILE, 2 COLS SM, 4 COLS DESKTOP */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 md:p-5">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg" />
            <Skeleton className="h-5 w-7 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20 mb-1.5" />
          <Skeleton className="h-5 sm:h-6 md:h-7 w-20 sm:w-24" />
        </div>
      ))}
    </div>
    {/* VIEW-SPECIFIC SKELETON */}
    {view === "table" && <TableSkeleton />}
    {view === "list" && <ListSkeleton />}
    {view === "grid" && <GridSkeleton />}
  </div>
);

// <== PURCHASES PAGE COMPONENT ==>
const Purchases = memo(() => {
  // ACTIVE FILTER TYPE STATE — DEFAULTS TO MONTH
  const [filter, setFilter] = useState<PurchaseFilter>("month");
  // SELECTED MONTH STATE — USED WHEN FILTER IS MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // SEARCH INPUT STATE (RAW — UPDATES ON EVERY KEYSTROKE)
  const [search, setSearch] = useState<string>("");
  // VIEW MODE STATE — INITIALIZED FROM LOCAL STORAGE
  const [view, setView] = useState<ViewMode>(getInitialViewMode);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALIZED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRowsPerPage);
  // ADD / EDIT DIALOG OPEN STATE
  const [formOpen, setFormOpen] = useState<boolean>(false);
  // PURCHASE BEING EDITED (NULL = ADD MODE)
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  // DEBOUNCE SEARCH INPUT (300MS) TO AVOID EXCESSIVE API CALLS
  const debouncedSearch = useDebounce(search, 300);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // FETCH PURCHASES FROM SERVER WITH ALL ACTIVE FILTERS
  const { data, isLoading, isError } = usePurchases(
    filter,
    filter === "month" ? monthStr : "",
    debouncedSearch,
    currentPage,
    rowsPerPage,
  );
  // DELETE PURCHASE MUTATION
  const deleteMutation = useDeletePurchase();
  // RESET TO PAGE 1 WHEN ANY FILTER OR SEARCH CHANGES
  useEffect(() => {
    // RESET TO PAGE 1
    setCurrentPage(1);
  }, [filter, monthStr, debouncedSearch]);
  // PURCHASE RECORDS FROM API RESPONSE — ALREADY PAGINATED BY SERVER
  const purchases = useMemo(() => data?.records ?? [], [data?.records]);
  // STATS FROM API RESPONSE
  const stats = data?.stats;
  // TOTAL MATCHING RECORDS ACROSS ALL PAGES (FROM SERVER PAGINATION META)
  const totalFiltered = data?.pagination?.total ?? 0;
  // TOTAL PAGES FROM SERVER PAGINATION META
  const totalPages = data?.pagination?.totalPages ?? 1;
  // START INDEX FOR DISPLAY LABEL (PAGE-RELATIVE)
  const startIndex = (currentPage - 1) * rowsPerPage;
  // SET AND PERSIST VIEW MODE TO LOCAL STORAGE
  const handleSetView = useCallback((mode: ViewMode): void => {
    // UPDATE VIEW STATE
    setView(mode);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("purchases_view", mode);
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
    localStorage.setItem("purchases_rows_per_page", String(safe));
  }, []);
  // HANDLE FILTER CHANGE — RESETS PAGE
  const handleFilterChange = useCallback((newFilter: PurchaseFilter): void => {
    // UPDATE FILTER
    setFilter(newFilter);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
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
  // OPEN ADD PURCHASE DIALOG
  const handleAddOpen = useCallback((): void => {
    // CLEAR ANY EDIT STATE
    setEditPurchase(null);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // OPEN EDIT PURCHASE DIALOG
  const handleEdit = useCallback((purchase: Purchase): void => {
    // SET PURCHASE TO EDIT
    setEditPurchase(purchase);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // CLOSE FORM DIALOG
  const handleFormClose = useCallback((): void => {
    // CLOSE DIALOG
    setFormOpen(false);
    // CLEAR EDIT STATE
    setEditPurchase(null);
  }, []);
  // DELETE PURCHASE BY ID
  const handleDelete = useCallback(
    (id: string): void => {
      // CALL DELETE MUTATION
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );
  // IS NEXT MONTH DISABLED (CANNOT NAVIGATE PAST CURRENT MONTH)
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // SHARED PROPS OBJECT PASSED TO ALL THREE VIEW COMPONENTS
  const viewProps = {
    // SERVER ALREADY PAGINATED — PASS DIRECTLY WITHOUT CLIENT-SIDE SLICE
    purchases,
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
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD (NO CACHED DATA)
  if (isLoading) {
    // RETURNING FULL PAGE SKELETON
    return <PurchasesPageSkeleton view={view} />;
  }
  // RETURNING PURCHASES PAGE
  return (
    // PAGE WRAPPER WITH TRANSITION
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE AND DESCRIPTION */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Purchases
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Track supplier orders and inventory intake
            </p>
          </div>
        </div>
        {/* RIGHT: CONTROLS — TWO ROWS ON MOBILE, STACKED ON LARGER SCREENS */}
        <div className="flex flex-col gap-2 sm:items-end">
          {/* ROW 1: FILTER PILLS + MONTH NAVIGATION (WHEN MONTH FILTER ACTIVE) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* FILTER TYPE PILLS */}
            {FILTER_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  filter === value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
                )}
              >
                {label}
              </button>
            ))}
            {/* MONTH NAVIGATION — ONLY SHOWN WHEN MONTH FILTER IS ACTIVE */}
            {filter === "month" && (
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
          {/* ROW 2: SEARCH + VIEW TOGGLES + ADD BUTTON */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* SEARCH INPUT — FULL WIDTH ON MOBILE, FIXED WIDTH ON DESKTOP */}
            <div className="relative flex-1 sm:flex-none sm:w-44 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full h-9"
              />
            </div>
            {/* VIEW TOGGLE + ADD BUTTON — SHARE A ROW */}
            <div className="flex items-center gap-2">
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
              {/* ADD PURCHASE BUTTON */}
              <Button
                onClick={handleAddOpen}
                className="shrink-0 h-9 ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            Failed to load purchases. Please check your connection and try
            again.
          </p>
        </div>
      )}
      {/* STATS CARDS */}
      <PurchaseStatsCards stats={stats} isLoading={false} />
      {/* TABLE VIEW */}
      {view === "table" && <PurchaseTableView {...viewProps} />}
      {/* LIST VIEW */}
      {view === "list" && <PurchaseListView {...viewProps} />}
      {/* GRID VIEW */}
      {view === "grid" && <PurchaseGridView {...viewProps} />}
      {/* ADD / EDIT FORM DIALOG */}
      <PurchaseFormDialog
        open={formOpen}
        editPurchase={editPurchase}
        onClose={handleFormClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Purchases.displayName = "Purchases";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Purchases;
