// <== IMPORTS ==>
import {
  Plus,
  List,
  Users,
  Search,
  Table2,
  LayoutGrid,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import type { Customer, ViewMode } from "@/types/customer-types";
import { PageTransition } from "@/components/layout/PageTransition";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import CustomerGridView from "@/components/customers/CustomerGridView";
import CustomerListView from "@/components/customers/CustomerListView";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import CustomerTableView from "@/components/customers/CustomerTableView";
import CustomerStatsCards from "@/components/customers/CustomerStatsCards";
import CustomerFormDialog from "@/components/customers/CustomerFormDialog";
import CustomerDetailDialog from "@/components/customers/CustomerDetailDialog";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is ViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL VIEW MODE FROM LOCAL STORAGE ==>
const getInitialViewMode = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("customers_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialRowsPerPage = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("customers_rows_per_page");
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

// <== TABLE SKELETON — MIRRORS TABLE VIEW LAYOUT ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    {/* FAKE TABLE HEADER */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {/* HEADER CELLS */}
            {[140, 100, 70, 80, 90, 80, 70, 80].map((w, i) => (
              <th key={i} className="px-3 py-2.5">
                <Skeleton
                  className={`h-3 w-${w > 100 ? "[" + w + "px]" : w}`}
                  style={{ width: w }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-28 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-10" />
              </td>
              <td className="px-3 py-3 hidden lg:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
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
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="shrink-0 hidden sm:block text-right space-y-1">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          <div className="flex gap-0.5 shrink-0">
            <Skeleton className="h-8 w-8 rounded-md" />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-0.5">
              <Skeleton className="h-8 w-8 rounded-md" />
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

// <== FULL PAGE SKELETON — MIRRORS ENTIRE CUSTOMERS PAGE LAYOUT ==>
const CustomersPageSkeleton = ({ view }: { view: ViewMode }) => (
  // SAME WRAPPER CLASS AS THE REAL PAGE SO LAYOUT IS IDENTICAL
  <div className="page-container">
    {/* HEADER SKELETON — MIRRORS REAL HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* LEFT: ICON + TITLE + DESCRIPTION */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 sm:w-32" />
          <Skeleton className="h-3 w-52 sm:w-64 hidden sm:block" />
        </div>
      </div>
      {/* RIGHT: CONTROLS — SEARCH FULL WIDTH ON MOBILE, TOGGLES + ADD BELOW IT */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full sm:w-52 md:w-64 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg ml-auto sm:ml-0" />
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

// <== CUSTOMERS PAGE COMPONENT ==>
const Customers = memo(() => {
  // MONTH FILTER STATE — ALWAYS CURRENT MONTH FOR MAIN PAGE STATS
  const [selectedMonth] = useState<Date>(new Date());
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
  // CUSTOMER BEING EDITED (NULL = ADD MODE)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  // CUSTOMER SELECTED FOR DETAIL VIEW (NULL = DIALOG CLOSED)
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  // DEBOUNCE SEARCH INPUT (300MS) TO AVOID EXCESSIVE API CALLS
  const debouncedSearch = useDebounce(search, 300);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // FETCH CURRENT PAGE FROM SERVER — PAGE AND LIMIT ARE SENT AS QUERY PARAMS
  const { data, isLoading, isError } = useCustomers(
    monthStr,
    debouncedSearch,
    currentPage,
    rowsPerPage,
  );
  // DELETE CUSTOMER MUTATION
  const deleteMutation = useDeleteCustomer();
  // RESET TO PAGE 1 ON SEARCH OR MONTH CHANGE
  useEffect(() => {
    // RESET TO PAGE 1
    setCurrentPage(1);
  }, [debouncedSearch, monthStr]);
  // CUSTOMERS ARRAY FROM API RESPONSE — ALREADY PAGINATED BY SERVER
  const customers = useMemo(() => data?.customers ?? [], [data?.customers]);
  // SUMMARY STATS FROM API RESPONSE
  const summary = data?.summary;
  // TOTAL MATCHING CUSTOMERS ACROSS ALL PAGES (FROM SERVER PAGINATION META)
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
    localStorage.setItem("customers_view", mode);
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
    localStorage.setItem("customers_rows_per_page", String(safe));
  }, []);
  // OPEN ADD CUSTOMER DIALOG
  const handleAddOpen = useCallback((): void => {
    // CLEAR ANY EDIT STATE
    setEditCustomer(null);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // OPEN EDIT CUSTOMER DIALOG
  const handleEdit = useCallback((customer: Customer): void => {
    // SET CUSTOMER TO EDIT
    setEditCustomer(customer);
    // OPEN DIALOG
    setFormOpen(true);
  }, []);
  // CLOSE FORM DIALOG
  const handleFormClose = useCallback((): void => {
    // CLOSE DIALOG
    setFormOpen(false);
    // CLEAR EDIT STATE
    setEditCustomer(null);
  }, []);
  // OPEN CUSTOMER DETAIL DIALOG
  const handleView = useCallback((customer: Customer): void => {
    // SETTING CUSTOMER
    setDetailCustomer(customer);
  }, []);
  // CLOSE CUSTOMER DETAIL DIALOG
  const handleDetailClose = useCallback((): void => {
    // SET DETAIL CUSTOMER TO NULL
    setDetailCustomer(null);
  }, []);
  // DELETE CUSTOMER BY ID
  const handleDelete = useCallback(
    (id: string): void => {
      // CALL DELETE MUTATION
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );
  // SHARED PROPS OBJECT PASSED TO ALL THREE VIEW COMPONENTS
  const viewProps = {
    // SERVER ALREADY PAGINATED — PASS DIRECTLY WITHOUT CLIENT-SIDE SLICE
    customers: customers,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: handleRowsPerPageChange,
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading) {
    // RETURNING FULL PAGE SKELETON
    return <CustomersPageSkeleton view={view} />;
  }
  // RETURNING CUSTOMERS PAGE
  return (
    // PAGE WRAPPER WITH TRANSITION
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE AND DESCRIPTION */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Customers
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Manage customers and track daily milk deliveries
            </p>
          </div>
        </div>
        {/* RIGHT: CONTROLS — STACKED ON MOBILE, INLINE ON DESKTOP */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* SEARCH INPUT — FULL WIDTH ON MOBILE, FIXED WIDTH ON DESKTOP */}
          <div className="relative w-full sm:w-52 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full h-9"
            />
          </div>
          {/* VIEW TOGGLES + ADD BUTTON — SHARE A ROW ON MOBILE */}
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
            {/* ADD CUSTOMER BUTTON — PUSHED TO RIGHT ON MOBILE VIA ml-auto */}
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
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            Failed to load customers. Please check your connection and try
            again.
          </p>
        </div>
      )}
      {/* STATS CARDS */}
      <CustomerStatsCards summary={summary} isLoading={false} />
      {/* TABLE VIEW */}
      {view === "table" && <CustomerTableView {...viewProps} />}
      {/* LIST VIEW */}
      {view === "list" && <CustomerListView {...viewProps} />}
      {/* GRID VIEW */}
      {view === "grid" && <CustomerGridView {...viewProps} />}
      {/* ADD / EDIT FORM DIALOG */}
      <CustomerFormDialog
        open={formOpen}
        editCustomer={editCustomer}
        onClose={handleFormClose}
      />
      {/* CUSTOMER DETAIL DIALOG */}
      <CustomerDetailDialog
        customer={detailCustomer}
        onClose={handleDetailClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Customers.displayName = "Customers";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Customers;
