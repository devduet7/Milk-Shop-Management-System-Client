// <== IMPORTS ==>
import {
  List,
  Users,
  Search,
  Table2,
  RefreshCw,
  LayoutGrid,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  useSaleRecoveries,
  useDeliveryRecoveries,
} from "@/hooks/useRecoveries";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import type {
  ViewMode,
  SaleRecovery,
  RecoveryFilter,
  RecoveryStatus,
  DeliveryRecovery,
} from "@/types/recovery-types";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import RecoveryStatsCards from "@/components/recoveries/RecoveryStatsCards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SaleRecoveryGridView from "@/components/recoveries/SaleRecoveryGridView";
import SaleRecoveryListView from "@/components/recoveries/SaleRecoveryListView";
import DeliveryPaymentDialog from "@/components/recoveries/DeliveryPaymentDialog";
import SaleRecoveryTableView from "@/components/recoveries/SaleRecoveryTableView";
import SalePaymentUpdateDialog from "@/components/recoveries/SalePaymentUpdateDialog";
import DeliveryRecoveryListView from "@/components/recoveries/DeliveryRecoveryListView";
import DeliveryRecoveryGridView from "@/components/recoveries/DeliveryRecoveryGridView";
import DeliveryRecoveryTableView from "@/components/recoveries/DeliveryRecoveryTableView";

// <== RECOVERY TAB TYPE ==>
type RecoveryTab = "deliveries" | "sales";

// <== RECOVERY TAB TYPE GUARD ==>
const isRecoveryTab = (value: string | null): value is RecoveryTab =>
  value === "deliveries" || value === "sales";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is ViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL ACTIVE TAB FROM LOCAL STORAGE ==>
const getInitialActiveTab = (): RecoveryTab => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("recoveries_active_tab");
  // RETURN SAVED TAB OR DEFAULT TO DELIVERIES
  return isRecoveryTab(saved) ? saved : "deliveries";
};

// <== GET INITIAL DELIVERY VIEW MODE FROM LOCAL STORAGE ==>
const getInitialDeliveryView = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("recoveries_delivery_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL SALE VIEW MODE FROM LOCAL STORAGE ==>
const getInitialSaleView = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("recoveries_sale_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL DELIVERY ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialDeliveryRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("recoveries_delivery_rows");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "10", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
};

// <== GET INITIAL SALE ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialSaleRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("recoveries_sale_rows");
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
  value: RecoveryFilter;
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

// <== STATUS OPTIONS ==>
const STATUS_OPTIONS: { value: RecoveryStatus; label: string }[] = [
  // ALL STATUSES
  { value: "all", label: "All" },
  // PENDING STATUS
  { value: "pending", label: "Pending" },
  // CLEARED STATUS
  { value: "cleared", label: "Cleared" },
];

// <== TABLE SKELETON ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {[120, 90, 80, 100, 100, 80, 80].map((w, i) => (
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
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-14" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-2 w-20 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-8 w-24 rounded-md" />
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
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="shrink-0 hidden sm:block space-y-1.5">
            <Skeleton className="h-2 w-20 rounded-full" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md shrink-0" />
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
        <div key={i} className="glass-card overflow-hidden">
          <div className="h-[3px] bg-muted/60" />
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
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

// <== FULL PAGE SKELETON ==>
const RecoveriesPageSkeleton = ({
  activeTab,
  deliveryView,
  saleView,
}: {
  activeTab: RecoveryTab;
  deliveryView: ViewMode;
  saleView: ViewMode;
}) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28 sm:w-36" />
          <Skeleton className="h-3 w-48 sm:w-60 hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md ml-2" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    {/* STATS CARDS SKELETON */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-3 sm:p-4 md:p-5 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted/60 rounded-t-xl" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-5 sm:h-6 md:h-7 w-20 sm:w-28 mt-0.5" />
        </div>
      ))}
    </div>
    {/* TABS SKELETON */}
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-9 w-36 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
    {/* DELIVERIES TAB CONTROLS SKELETON — ONLY SHOWN WHEN DELIVERIES TAB IS ACTIVE */}
    {activeTab === "deliveries" && (
      <>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-full sm:w-44 md:w-52 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        {/* DELIVERY VIEW-SPECIFIC SKELETON */}
        {deliveryView === "table" && <TableSkeleton />}
        {deliveryView === "list" && <ListSkeleton />}
        {deliveryView === "grid" && <GridSkeleton />}
      </>
    )}
    {/* SALES TAB CONTROLS SKELETON — ONLY SHOWN WHEN SALES TAB IS ACTIVE */}
    {activeTab === "sales" && (
      <>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-full sm:w-44 md:w-52 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        {/* SALE VIEW-SPECIFIC SKELETON */}
        {saleView === "table" && <TableSkeleton />}
        {saleView === "list" && <ListSkeleton />}
        {saleView === "grid" && <GridSkeleton />}
      </>
    )}
  </div>
);

// <== RECOVERIES PAGE COMPONENT ==>
const Recoveries = memo(() => {
  // ACTIVE TAB STATE — INITIALIZED FROM LOCAL STORAGE
  const [activeTab, setActiveTab] = useState<RecoveryTab>(getInitialActiveTab);
  // SHARED FILTER STATE — APPLIED TO BOTH TABS AND STATS
  const [filter, setFilter] = useState<RecoveryFilter>("month");
  // SELECTED MONTH STATE
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // DELIVERY VIEW MODE
  const [deliveryView, setDeliveryView] = useState<ViewMode>(
    getInitialDeliveryView,
  );
  // DELIVERY CURRENT PAGE
  const [deliveryPage, setDeliveryPage] = useState<number>(1);
  // DELIVERY ROWS PER PAGE
  const [deliveryRows, setDeliveryRows] = useState<number>(
    getInitialDeliveryRows,
  );
  // DELIVERY SEARCH
  const [deliverySearch, setDeliverySearch] = useState<string>("");
  // DELIVERY STATUS FILTER
  const [deliveryStatus, setDeliveryStatus] = useState<RecoveryStatus>("all");
  // DELIVERY PAYMENT DIALOG STATE
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState<boolean>(false);
  // SELECTED DELIVERY RECOVERY RECORD
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryRecovery | null>(null);
  // SALE VIEW MODE
  const [saleView, setSaleView] = useState<ViewMode>(getInitialSaleView);
  // SALE CURRENT PAGE
  const [salePage, setSalePage] = useState<number>(1);
  // SALE ROWS PER PAGE
  const [saleRows, setSaleRows] = useState<number>(getInitialSaleRows);
  // SALE SEARCH
  const [saleSearch, setSaleSearch] = useState<string>("");
  // SALE STATUS FILTER
  const [saleStatus, setSaleStatus] = useState<RecoveryStatus>("all");
  // SALE PAYMENT UPDATE DIALOG STATE
  const [saleDialogOpen, setSaleDialogOpen] = useState<boolean>(false);
  // SELECTED SALE RECOVERY RECORD
  const [selectedSale, setSelectedSale] = useState<SaleRecovery | null>(null);
  // DEBOUNCE DELIVERY SEARCH INPUT
  const debouncedDeliverySearch = useDebounce(deliverySearch, 300);
  // DEBOUNCE SALE SEARCH INPUT
  const debouncedSaleSearch = useDebounce(saleSearch, 300);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // MONTH PARAM — ONLY PASS WHEN FILTER IS MONTH
  const activeMonth = filter === "month" ? monthStr : "";
  // FETCH DELIVERY RECOVERIES
  const {
    data: deliveryData,
    isLoading: deliveryLoading,
    isError: deliveryError,
  } = useDeliveryRecoveries(
    filter,
    activeMonth,
    deliveryStatus,
    debouncedDeliverySearch,
    deliveryPage,
    deliveryRows,
  );
  // FETCH SALE RECOVERIES
  const {
    data: saleData,
    isLoading: saleLoading,
    isError: saleError,
  } = useSaleRecoveries(
    filter,
    activeMonth,
    saleStatus,
    debouncedSaleSearch,
    salePage,
    saleRows,
  );
  // RESET DELIVERY PAGE WHEN DELIVERY FILTERS CHANGE
  useEffect(() => {
    // SET DELIVERY PAGE TO 1 WHEN ANY DELIVERY FILTER CHANGES
    setDeliveryPage(1);
  }, [filter, activeMonth, deliveryStatus, debouncedDeliverySearch]);
  // RESET SALE PAGE WHEN SALE FILTERS CHANGE
  useEffect(() => {
    // SET SALE PAGE TO 1 WHEN ANY SALE FILTER CHANGES
    setSalePage(1);
  }, [filter, activeMonth, saleStatus, debouncedSaleSearch]);
  // COMBINED STATS — DELIVERY QUERY IS THE PRIMARY SOURCE (FIRST TAB)
  const stats = deliveryData?.stats ?? saleData?.stats;
  // COMBINED LOADING STATE FOR STATS CARDS
  const statsLoading = deliveryLoading && saleLoading;
  // COMPUTED DELIVERY RECORDS
  const deliveryRecords = useMemo(
    () => (deliveryData?.records ?? []) as DeliveryRecovery[],
    [deliveryData?.records],
  );
  // COMPUTED TOTAL FILTERED RECORDS WITH SAFE FALLBACK
  const deliveryTotalFiltered = deliveryData?.pagination?.total ?? 0;
  // SAFELY COMPUTE TOTAL PAGES WITH FALLBACK
  const deliveryTotalPages = deliveryData?.pagination?.totalPages ?? 1;
  // COMPUTE START INDEX FOR PAGINATION
  const deliveryStartIndex = (deliveryPage - 1) * deliveryRows;
  // COMPUTED SALE RECORDS
  const saleRecords = useMemo(
    () => (saleData?.records ?? []) as SaleRecovery[],
    [saleData?.records],
  );
  // COMPUTED TOTAL FILTERED RECORDS WITH SAFE FALLBACK
  const saleTotalFiltered = saleData?.pagination?.total ?? 0;
  // SAFELY COMPUTE TOTAL PAGES WITH FALLBACK
  const saleTotalPages = saleData?.pagination?.totalPages ?? 1;
  // COMPUTE START INDEX FOR PAGINATION
  const saleStartIndex = (salePage - 1) * saleRows;
  // IS NEXT MONTH DISABLED
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // HANDLE ACTIVE TAB CHANGE — PERSISTS SELECTION TO LOCAL STORAGE
  const handleTabChange = useCallback((value: string): void => {
    // GUARD: ENSURE VALUE IS A VALID TAB
    if (!isRecoveryTab(value)) return;
    // UPDATE ACTIVE TAB STATE
    setActiveTab(value);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("recoveries_active_tab", value);
  }, []);
  // HANDLE FILTER CHANGE
  const handleFilterChange = useCallback((newFilter: RecoveryFilter): void => {
    // UPDATE FILTER STATE
    setFilter(newFilter);
    // RESETS TO FIRST PAGE WHEN FILTER CHANGES
    setDeliveryPage(1);
    // RESETS TO FIRST PAGE WHEN FILTER CHANGES
    setSalePage(1);
  }, []);
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
  // SET AND PERSIST DELIVERY VIEW MODE
  const handleDeliverySetView = useCallback((mode: ViewMode): void => {
    // UPDATE VIEW MODE STATE
    setDeliveryView(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("recoveries_delivery_view", mode);
  }, []);
  // SET AND PERSIST SALE VIEW MODE
  const handleSaleSetView = useCallback((mode: ViewMode): void => {
    // UPDATE VIEW MODE STATE
    setSaleView(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("recoveries_sale_view", mode);
  }, []);
  // HANDLE DELIVERY ROWS PER PAGE CHANGE
  const handleDeliveryRowsChange = useCallback((value: string): void => {
    // PARSE VALUE TO INTEGER
    const parsed = Number.parseInt(value, 10);
    // FALLBACK TO 10 IF PARSE FAILS OR VALUE IS NON-POSITIVE
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE ROWS PER PAGE STATE
    setDeliveryRows(safe);
    // RESET TO FIRST PAGE WHEN ROWS PER PAGE CHANGES
    setDeliveryPage(1);
    // PERSIST ROWS PER PAGE TO LOCAL STORAGE
    localStorage.setItem("recoveries_delivery_rows", String(safe));
  }, []);
  // HANDLE SALE ROWS PER PAGE CHANGE
  const handleSaleRowsChange = useCallback((value: string): void => {
    // PARSE VALUE TO INTEGER
    const parsed = Number.parseInt(value, 10);
    // FALLBACK TO 10 IF PARSE FAILS OR VALUE IS NON-POSITIVE
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE ROWS PER PAGE STATE
    setSaleRows(safe);
    // RESET TO FIRST PAGE WHEN ROWS PER PAGE CHANGES
    setSalePage(1);
    // PERSIST ROWS PER PAGE TO LOCAL STORAGE
    localStorage.setItem("recoveries_sale_rows", String(safe));
  }, []);
  // OPEN DELIVERY PAYMENT DIALOG
  const handleRecordPayment = useCallback((record: DeliveryRecovery): void => {
    // SET SELECTED DELIVERY RECORD TO SHOW IN DIALOG
    setSelectedDelivery(record);
    // OPEN DELIVERY PAYMENT DIALOG
    setDeliveryDialogOpen(true);
  }, []);
  // CLOSE DELIVERY PAYMENT DIALOG
  const handleDeliveryDialogClose = useCallback((): void => {
    // CLOSE DELIVERY PAYMENT DIALOG
    setDeliveryDialogOpen(false);
    // CLEAR SELECTED DELIVERY RECORD
    setSelectedDelivery(null);
  }, []);
  // OPEN SALE PAYMENT UPDATE DIALOG
  const handleUpdatePayment = useCallback((record: SaleRecovery): void => {
    // SET SELECTED SALE RECORD TO SHOW IN DIALOG
    setSelectedSale(record);
    // OPEN SALE PAYMENT UPDATE DIALOG
    setSaleDialogOpen(true);
  }, []);
  // CLOSE SALE PAYMENT UPDATE DIALOG
  const handleSaleDialogClose = useCallback((): void => {
    // CLOSE SALE PAYMENT UPDATE DIALOG
    setSaleDialogOpen(false);
    // CLEAR SELECTED SALE RECORD
    setSelectedSale(null);
  }, []);
  // SHARED DELIVERY VIEW PROPS
  const deliveryViewProps = {
    records: deliveryRecords,
    totalFiltered: deliveryTotalFiltered,
    isLoading: deliveryLoading,
    currentPage: deliveryPage,
    rowsPerPage: deliveryRows,
    startIndex: deliveryStartIndex,
    totalPages: deliveryTotalPages,
    onPageChange: setDeliveryPage,
    onRowsPerPageChange: handleDeliveryRowsChange,
    onRecordPayment: handleRecordPayment,
  };
  // SHARED SALE VIEW PROPS
  const saleViewProps = {
    records: saleRecords,
    totalFiltered: saleTotalFiltered,
    isLoading: saleLoading,
    currentPage: salePage,
    rowsPerPage: saleRows,
    startIndex: saleStartIndex,
    totalPages: saleTotalPages,
    onPageChange: setSalePage,
    onRowsPerPageChange: handleSaleRowsChange,
    onUpdatePayment: handleUpdatePayment,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (deliveryLoading && saleLoading) {
    // RETURN FULL PAGE SKELETON WITH CURRENT ACTIVE TAB AND VIEW MODES
    return (
      <RecoveriesPageSkeleton
        activeTab={activeTab}
        deliveryView={deliveryView}
        saleView={saleView}
      />
    );
  }
  // RETURNING RECOVERIES PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <RefreshCw className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Recoveries
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Track outstanding payments and collections
            </p>
          </div>
        </div>
        {/* RIGHT: FILTER PILLS + MONTH NAVIGATION */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* FILTER TYPE PILLS */}
          {FILTER_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                filter === value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
              )}
            >
              {label}
            </button>
          ))}
          {/* MONTH NAVIGATION — ONLY WHEN MONTH FILTER IS ACTIVE */}
          {filter === "month" && (
            <div className="flex items-center gap-1 ml-1">
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
      {/* STATS CARDS — ALWAYS COMBINED ALL-TIME */}
      <RecoveryStatsCards stats={stats} isLoading={statsLoading} />
      {/* TABBED VIEWS */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* TAB LIST */}
        <TabsList className="mb-4 h-10">
          <TabsTrigger value="deliveries" className="gap-2">
            <Users className="w-4 h-4" />
            <span>Deliveries</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span>Customer Sales</span>
          </TabsTrigger>
        </TabsList>
        {/* DELIVERIES TAB */}
        <TabsContent value="deliveries" className="mt-0">
          {/* DELIVERY CONTROLS ROW */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* STATUS FILTER SELECT */}
              <Select
                value={deliveryStatus}
                onValueChange={(val) => {
                  setDeliveryStatus(val as RecoveryStatus);
                  setDeliveryPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-28 shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* DELIVERY SEARCH INPUT */}
              <div className="relative flex-1 sm:flex-none sm:w-44 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search customer..."
                  value={deliverySearch}
                  onChange={(e) => setDeliverySearch(e.target.value)}
                  className="pl-9 w-full h-9"
                />
              </div>
              {/* DELIVERY VIEW TOGGLE */}
              <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
                {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
                  <Tooltip key={mode} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleDeliverySetView(mode)}
                        className={cn(
                          "p-1.5 rounded-md transition-all duration-200",
                          deliveryView === mode
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
          {/* DELIVERY ERROR STATE */}
          {deliveryError && (
            <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to load delivery recoveries. Please check your connection
                and try again.
              </p>
            </div>
          )}
          {/* DELIVERY TABLE VIEW */}
          {deliveryView === "table" && (
            <DeliveryRecoveryTableView {...deliveryViewProps} />
          )}
          {/* DELIVERY LIST VIEW */}
          {deliveryView === "list" && (
            <DeliveryRecoveryListView {...deliveryViewProps} />
          )}
          {/* DELIVERY GRID VIEW */}
          {deliveryView === "grid" && (
            <DeliveryRecoveryGridView {...deliveryViewProps} />
          )}
        </TabsContent>
        {/* CUSTOMER SALES TAB */}
        <TabsContent value="sales" className="mt-0">
          {/* SALE CONTROLS ROW */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* STATUS FILTER SELECT */}
              <Select
                value={saleStatus}
                onValueChange={(val) => {
                  setSaleStatus(val as RecoveryStatus);
                  setSalePage(1);
                }}
              >
                <SelectTrigger className="h-9 w-28 shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* SALE SEARCH INPUT */}
              <div className="relative flex-1 sm:flex-none sm:w-44 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search customer..."
                  value={saleSearch}
                  onChange={(e) => setSaleSearch(e.target.value)}
                  className="pl-9 w-full h-9"
                />
              </div>
              {/* SALE VIEW TOGGLE */}
              <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
                {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
                  <Tooltip key={mode} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSaleSetView(mode)}
                        className={cn(
                          "p-1.5 rounded-md transition-all duration-200",
                          saleView === mode
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
          {/* SALE ERROR STATE */}
          {saleError && (
            <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to load sale recoveries. Please check your connection and
                try again.
              </p>
            </div>
          )}
          {/* SALE TABLE VIEW */}
          {saleView === "table" && <SaleRecoveryTableView {...saleViewProps} />}
          {/* SALE LIST VIEW */}
          {saleView === "list" && <SaleRecoveryListView {...saleViewProps} />}
          {/* SALE GRID VIEW */}
          {saleView === "grid" && <SaleRecoveryGridView {...saleViewProps} />}
        </TabsContent>
      </Tabs>
      {/* DELIVERY PAYMENT DIALOG */}
      <DeliveryPaymentDialog
        open={deliveryDialogOpen}
        customer={selectedDelivery}
        onClose={handleDeliveryDialogClose}
      />
      {/* SALE PAYMENT UPDATE DIALOG */}
      <SalePaymentUpdateDialog
        open={saleDialogOpen}
        sale={selectedSale}
        onClose={handleSaleDialogClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Recoveries.displayName = "Recoveries";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Recoveries;
