// <== IMPORTS ==>
import {
  Zap,
  List,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  QuickSale,
  QuickSaleViewMode,
  QuickSaleFilterType,
  QuickSaleProductFilter,
} from "@/types/quick-sale-types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useQuickSales, useDeleteQuickSale } from "@/hooks/useQuickSales";
import QuickSaleListView from "@/components/quickSales/QuickSaleListView";
import QuickSaleGridView from "@/components/quickSales/QuickSaleGridView";
import QuickSaleTableView from "@/components/quickSales/QuickSaleTableView";
import QuickSaleStatsCards from "@/components/quickSales/QuickSaleStatsCards";
import QuickSaleEntryPanel from "@/components/quickSales/QuickSaleEntryPanel";
import QuickSaleDatePicker from "@/components/quickSales/QuickSaleDatePicker";
import QuickSaleEditDialog from "@/components/quickSales/QuickSaleEditDialog";
import QuickSaleDeleteDialog from "@/components/quickSales/QuickSaleDeleteDialog";

// <== LOCAL STORAGE KEY FOR PERSISTED VIEW MODE ==>
const VIEW_KEY = "qs_view";
// <== LOCAL STORAGE KEY FOR PERSISTED ROWS PER PAGE ==>
const ROWS_KEY = "qs_rows_per_page";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (v: string | null): v is QuickSaleViewMode =>
  v === "table" || v === "list" || v === "grid";

// <== GET INITIAL VIEW FROM LOCAL STORAGE ==>
const getInitialView = (): QuickSaleViewMode => {
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
  mode: QuickSaleViewMode;
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
  value: QuickSaleFilterType;
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

// <== PRODUCT FILTER OPTIONS ==>
const PRODUCT_OPTIONS: { value: QuickSaleProductFilter; label: string }[] = [
  // ALL PRODUCTS
  { value: "all", label: "All Products" },
  // MILK ONLY
  { value: "milk", label: "Milk Only" },
  // YOGHURT ONLY
  { value: "yoghurt", label: "Yoghurt Only" },
];

// <== TABLE SKELETON ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[80, 80, 80, 80, 80, 80].map((w, i) => (
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
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-1">
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 sm:p-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="hidden sm:block text-right space-y-1">
            <Skeleton className="h-5 w-16 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
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
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex items-center gap-1">
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
const QuickSalesPageSkeleton = ({ view }: { view: QuickSaleViewMode }) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-48 hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
    {/* STATS SKELETON */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 md:p-5">
          <div className="mb-2 sm:mb-3">
            <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
          </div>
          <Skeleton className="h-3 w-20 mb-1.5" />
          <Skeleton className="h-5 sm:h-7 w-20 sm:w-28" />
        </div>
      ))}
    </div>
    {/* ENTRY PANEL SKELETON */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {[0, 1].map((i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-border/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            <Skeleton className="h-3 w-24 mb-1.5" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
    {/* CONTROLS ROW SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <Skeleton className="h-5 w-36" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-36 rounded-md" />
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

// <== QUICK SALES PAGE COMPONENT ==>
const QuickSales = memo(() => {
  // ACTIVE FILTER TYPE STATE — DEFAULTS TO TODAY
  const [filterType, setFilterType] = useState<QuickSaleFilterType>("today");
  // SELECTED MONTH FOR MONTH FILTER
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // SELECTED SPECIFIC DATE FOR DATE PICKER FILTER (YYYY-MM-DD | NULL)
  const [specificDate, setSpecificDate] = useState<string | null>(null);
  // PRODUCT TYPE FILTER STATE
  const [productType, setProductType] = useState<QuickSaleProductFilter>("all");
  // VIEW MODE STATE — INITIALISED FROM LOCAL STORAGE
  const [viewMode, setViewMode] = useState<QuickSaleViewMode>(getInitialView);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALISED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRows);
  // EDIT DIALOG OPEN STATE
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  // SELECTED RECORD FOR EDITING
  const [selectedForEdit, setSelectedForEdit] = useState<QuickSale | null>(
    null,
  );
  // DELETE DIALOG OPEN STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // STAGED RECORD PENDING DELETION CONFIRMATION
  const [deleteTarget, setDeleteTarget] = useState<QuickSale | null>(null);
  // DELETE MUTATION
  const deleteMutation = useDeleteQuickSale();
  // DERIVED MONTH STRING FOR MONTH FILTER
  const monthStr = format(selectedMonth, "yyyy-MM");
  // DERIVED DATE STRING FOR DATE FILTER
  const dateStr = specificDate ?? "";
  // IS NEXT MONTH DISABLED — BLOCK NAVIGATION INTO FUTURE MONTHS
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // FETCH QUICK SALES DATA
  const { data, isLoading, isError } = useQuickSales(
    filterType,
    dateStr,
    monthStr,
    productType,
    currentPage,
    rowsPerPage,
  );
  // RESET PAGE TO 1 WHEN ANY FILTER CHANGES
  useEffect(() => {
    // RESET CURRENT PAGE
    setCurrentPage(1);
  }, [filterType, specificDate, monthStr, productType]);
  // COMPUTED RECORDS WITH SAFE FALLBACK
  const records = useMemo(() => data?.records ?? [], [data?.records]);
  // COMPUTED TOTAL COUNT WITH SAFE FALLBACK
  const totalFiltered = data?.pagination?.total ?? 0;
  // COMPUTED TOTAL PAGES WITH SAFE FALLBACK
  const totalPages = data?.pagination?.totalPages ?? 1;
  // COMPUTE START INDEX FOR PAGINATION
  const startIndex = (currentPage - 1) * rowsPerPage;
  // HANDLE FILTER TYPE CHANGE
  const handleFilterChange = useCallback((type: QuickSaleFilterType): void => {
    // UPDATE FILTER TYPE
    setFilterType(type);
    // CLEAR SPECIFIC DATE WHEN SWITCHING TO NON-DATE FILTERS
    if (type !== "date") setSpecificDate(null);
  }, []);
  // HANDLE DATE PICKER SELECT — AUTOMATICALLY ACTIVATES DATE FILTER
  const handleDateSelect = useCallback((date: string): void => {
    // UPDATE SPECIFIC DATE
    setSpecificDate(date);
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
  // HANDLE PREV MONTH
  const handlePrevMonth = useCallback((): void => {
    // DECREMENT MONTH BY ONE — USE FUNCTIONAL UPDATE TO ENSURE LATEST STATE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
  }, []);
  // HANDLE NEXT MONTH
  const handleNextMonth = useCallback((): void => {
    // INCREMENT MONTH BY ONE — USE FUNCTIONAL UPDATE TO ENSURE LATEST STATE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
  }, []);
  // HANDLE VIEW MODE CHANGE
  const handleSetView = useCallback((mode: QuickSaleViewMode): void => {
    // UPDATE VIEW MODE STATE
    setViewMode(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem(VIEW_KEY, mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsChange = useCallback((value: string): void => {
    // PARSE VALUE TO INTEGER
    const parsed = Number.parseInt(value, 10);
    // FALLBACK TO 20 IF PARSE FAILS OR VALUE IS NON-POSITIVE
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 20 : parsed;
    // UPDATE ROWS PER PAGE STATE
    setRowsPerPage(safe);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem(ROWS_KEY, String(safe));
  }, []);
  // HANDLE DELETE — STAGES RECORD FOR CONFIRMATION INSTEAD OF DELETING DIRECTLY
  const handleDelete = useCallback((record: QuickSale): void => {
    // STAGE RECORD AS DELETE TARGET
    setDeleteTarget(record);
    // OPEN DELETE CONFIRMATION DIALOG
    setDeleteDialogOpen(true);
  }, []);
  // HANDLE DELETE CONFIRM — PERFORMS ACTUAL DELETION AFTER USER CONFIRMS
  const handleDeleteConfirm = useCallback((): void => {
    // GUARD: NO TARGET STAGED
    if (!deleteTarget) return;
    // FIRE DELETE MUTATION
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        // CLOSE DIALOG ON SUCCESS
        setDeleteDialogOpen(false);
        // CLEAR STAGED TARGET
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation]);
  // HANDLE DELETE DIALOG CLOSE
  const handleDeleteClose = useCallback((): void => {
    // BLOCK CLOSE WHILE MUTATION IS IN FLIGHT
    if (deleteMutation.isPending) return;
    // CLOSE DIALOG
    setDeleteDialogOpen(false);
    // CLEAR STAGED TARGET
    setDeleteTarget(null);
  }, [deleteMutation.isPending]);
  // HANDLE OPEN EDIT DIALOG
  const handleEdit = useCallback((record: QuickSale): void => {
    // SET SELECTED RECORD FOR EDITING
    setSelectedForEdit(record);
    // OPEN EDIT DIALOG
    setEditDialogOpen(true);
  }, []);
  // HANDLE CLOSE EDIT DIALOG
  const handleEditClose = useCallback((): void => {
    // CLOSE EDIT DIALOG
    setEditDialogOpen(false);
    // CLEAR SELECTED RECORD
    setSelectedForEdit(null);
  }, []);
  // DERIVE RECORDS SECTION HEADING BASED ON ACTIVE FILTER
  const sectionHeading = useMemo((): string => {
    // IF FILTER TYPE IS TODAY, SHOW TODAY'S SALES
    if (filterType === "today") return "Today's Sales";
    // IF FILTER TYPE IS WEEK, SHOW THIS WEEK'S SALES
    if (filterType === "week") return "This Week's Sales";
    // IF FILTER TYPE IS MONTH, SHOW SELECTED MONTH AND YEAR
    if (filterType === "month")
      return `${format(selectedMonth, "MMMM yyyy")} Sales`;
    // IF FILTER TYPE IS DATE, SHOW SPECIFIC DATE
    if (filterType === "date" && specificDate) return `Sales — ${specificDate}`;
    // DEFAULT HEADING
    return "Sales";
  }, [filterType, selectedMonth, specificDate]);
  // SHARED VIEW PROPS OBJECT — SPREAD INTO ALL THREE VIEW COMPONENTS
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
    onDelete: handleDelete,
    onEdit: handleEdit,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) {
    // RETURN FULL PAGE SKELETON WITH CURRENT VIEW MODE
    return <QuickSalesPageSkeleton view={viewMode} />;
  }
  // RETURNING QUICK SALES PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Zap className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              Quick Sales
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Record instant milk and yoghurt sales
            </p>
          </div>
        </div>
        {/* RIGHT: FILTER CONTROLS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* FILTER TYPE PILLS */}
          {FILTER_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                filterType === value && filterType !== "date"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
              )}
            >
              {label}
            </button>
          ))}
          {/* CUSTOM DATE PICKER */}
          <QuickSaleDatePicker
            selectedDate={specificDate}
            onDateSelect={handleDateSelect}
            onClear={handleDateClear}
          />
          {/* MONTH NAVIGATION — ONLY RENDERED WHEN MONTH FILTER IS ACTIVE */}
          {filterType === "month" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium whitespace-nowrap min-w-[80px] text-center">
                {format(selectedMonth, "MMM yyyy")}
              </span>
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
      </div>
      {/* STATS CARDS — ALWAYS REFLECT THE FULL FILTERED DATASET */}
      <QuickSaleStatsCards stats={data?.stats} isLoading={isLoading} />
      {/* SALE ENTRY PANEL — MILK AND YOGHURT FORMS WITH LOCKED RATES */}
      <QuickSaleEntryPanel />
      {/* RECORDS SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        {/* SECTION HEADING */}
        <h2 className="font-display text-base sm:text-lg font-semibold">
          {sectionHeading}
          {totalFiltered > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({totalFiltered} record{totalFiltered !== 1 ? "s" : ""})
            </span>
          )}
        </h2>
        {/* RIGHT CONTROLS — PRODUCT FILTER + VIEW TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PRODUCT TYPE FILTER SELECT */}
          <Select
            value={productType}
            onValueChange={(val) => {
              setProductType(val as QuickSaleProductFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36 shrink-0">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
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
            Failed to load sales data. Please check your connection and try
            again.
          </p>
        </div>
      )}
      {/* TABLE VIEW */}
      {viewMode === "table" && <QuickSaleTableView {...viewProps} />}
      {/* LIST VIEW */}
      {viewMode === "list" && <QuickSaleListView {...viewProps} />}
      {/* GRID VIEW */}
      {viewMode === "grid" && <QuickSaleGridView {...viewProps} />}
      {/* EDIT DIALOG */}
      <QuickSaleEditDialog
        open={editDialogOpen}
        record={selectedForEdit}
        onClose={handleEditClose}
      />
      {/* DELETE CONFIRMATION DIALOG */}
      <QuickSaleDeleteDialog
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
QuickSales.displayName = "QuickSales";

// <== EXPORT ==>
export default QuickSales;
