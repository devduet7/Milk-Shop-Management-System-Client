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
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import {
  useShopSales,
  useDeleteSale,
  useCustomerSales,
} from "@/hooks/useSales";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import SaleStatsCards from "@/components/sales/SaleStatsCards";
import ShopSaleListView from "@/components/sales/ShopSaleListView";
import ShopSaleGridView from "@/components/sales/ShopSaleGridView";
import { PageTransition } from "@/components/layout/PageTransition";
import ShopSaleTableView from "@/components/sales/ShopSaleTableView";
import type { Sale, ViewMode, SaleFilter } from "@/types/sale-types";
import ShopSaleFormDialog from "@/components/sales/ShopSaleFormDialog";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import CustomerSaleGridView from "@/components/sales/CustomerSaleGridView";
import CustomerSaleListView from "@/components/sales/CustomerSaleListView";
import CustomerSaleTableView from "@/components/sales/CustomerSaleTableView";
import CustomerSaleFormDialog from "@/components/sales/CustomerSaleFormDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// <== TAB VALUE TYPE ==>
type SaleTab = "customer" | "shop";

// <== TAB VALUE TYPE GUARD ==>
const isSaleTab = (value: string | null): value is SaleTab =>
  value === "customer" || value === "shop";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (value: string | null): value is ViewMode =>
  value === "table" || value === "list" || value === "grid";

// <== GET INITIAL ACTIVE TAB FROM LOCAL STORAGE ==>
const getInitialActiveTab = (): SaleTab => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("sales_active_tab");
  // RETURN SAVED TAB OR DEFAULT TO CUSTOMER
  return isSaleTab(saved) ? saved : "customer";
};

// <== GET INITIAL CUSTOMER VIEW MODE FROM LOCAL STORAGE ==>
const getInitialCustomerView = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("sales_customer_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL SHOP VIEW MODE FROM LOCAL STORAGE ==>
const getInitialShopView = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("sales_shop_view");
  // RETURN SAVED MODE OR DEFAULT TO TABLE
  return isViewMode(saved) ? saved : "table";
};

// <== GET INITIAL CUSTOMER ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialCustomerRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("sales_customer_rows");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "10", 10);
  // FALLBACK IF INVALID
  return Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
};

// <== GET INITIAL SHOP ROWS PER PAGE FROM LOCAL STORAGE ==>
const getInitialShopRows = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("sales_shop_rows");
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
  value: SaleFilter;
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

// <== CUSTOMER TABLE SKELETON — MIRRORS CUSTOMER TABLE VIEW LAYOUT ==>
const CustomerTableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[120, 70, 60, 80, 80, 70, 90, 80, 60].map((w, i) => (
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
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-12" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
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

// <== SHOP TABLE SKELETON — MIRRORS SHOP TABLE VIEW LAYOUT ==>
const ShopTableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[80, 70, 90, 90, 90, 140, 60].map((w, i) => (
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
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-16" />
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
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="shrink-0 hidden sm:block text-right space-y-1">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-5 w-16 ml-auto rounded-full" />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
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

// <== VIEW-SPECIFIC SKELETON SELECTOR ==>
const ViewSkeleton = ({ view }: { view: ViewMode }) => {
  // IF VIEW IS LIST RETURN LIST SKELETON
  if (view === "list") return <ListSkeleton />;
  // IF VIEW IS GRID RETURN GRID SKELETON
  if (view === "grid") return <GridSkeleton />;
  // ELSE RETURN NULL
  return null;
};

// <== FULL PAGE SKELETON — MIRRORS ENTIRE SALES PAGE LAYOUT ==>
const SalesPageSkeleton = ({
  activeTab,
  customerView,
  shopView,
}: {
  activeTab: SaleTab;
  customerView: ViewMode;
  shopView: ViewMode;
}) => (
  // SAME WRAPPER CLASS AS THE REAL PAGE SO LAYOUT IS IDENTICAL
  <div className="page-container">
    {/* HEADER SKELETON — MIRRORS REAL HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* LEFT: ICON + TITLE */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-16 sm:w-20" />
          <Skeleton className="h-3 w-48 sm:w-60 hidden sm:block" />
        </div>
      </div>
      {/* RIGHT: FILTER PILLS SKELETON */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md ml-2" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
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
    {/* TABS SKELETON */}
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-9 w-36 rounded-lg" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    {/* CUSTOMER TAB CONTROLS SKELETON — ONLY SHOWN WHEN CUSTOMER TAB IS ACTIVE */}
    {activeTab === "customer" && (
      <>
        <div className="flex flex-col gap-2 sm:items-end mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-full sm:w-44 md:w-52 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
        {/* CUSTOMER VIEW-SPECIFIC SKELETON — TABLE USES DEDICATED CUSTOMER SKELETON */}
        {customerView === "table" && <CustomerTableSkeleton />}
        <ViewSkeleton view={customerView} />
      </>
    )}
    {/* SHOP TAB CONTROLS SKELETON — ONLY SHOWN WHEN SHOP TAB IS ACTIVE */}
    {activeTab === "shop" && (
      <>
        <div className="flex flex-col gap-2 sm:items-end mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-9 w-36 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
        </div>
        {/* SHOP VIEW-SPECIFIC SKELETON — TABLE USES DEDICATED SHOP SKELETON */}
        {shopView === "table" && <ShopTableSkeleton />}
        <ViewSkeleton view={shopView} />
      </>
    )}
  </div>
);

// <== SALES PAGE COMPONENT ==>
const Sales = memo(() => {
  // ACTIVE TAB STATE — INITIALIZED FROM LOCAL STORAGE
  const [activeTab, setActiveTab] = useState<SaleTab>(getInitialActiveTab);
  // SHARED FILTER STATE — APPLIED TO BOTH TABS AND STATS
  const [filter, setFilter] = useState<SaleFilter>("month");
  // SELECTED MONTH STATE — USED WHEN FILTER IS MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // CUSTOMER VIEW MODE — INITIALIZED FROM LOCAL STORAGE
  const [customerView, setCustomerView] = useState<ViewMode>(
    getInitialCustomerView,
  );
  // CUSTOMER CURRENT PAGE STATE
  const [customerPage, setCustomerPage] = useState<number>(1);
  // CUSTOMER ROWS PER PAGE — INITIALIZED FROM LOCAL STORAGE
  const [customerRows, setCustomerRows] = useState<number>(
    getInitialCustomerRows,
  );
  // CUSTOMER SEARCH INPUT STATE (RAW — UPDATES ON EVERY KEYSTROKE)
  const [customerSearch, setCustomerSearch] = useState<string>("");
  // PENDING ONLY FILTER STATE (CUSTOMER SALES ONLY)
  const [pendingOnly, setPendingOnly] = useState<boolean>(false);
  // CUSTOMER SALE DIALOG STATE
  const [customerFormOpen, setCustomerFormOpen] = useState<boolean>(false);
  // CUSTOMER SALE BEING EDITED (NULL = ADD MODE)
  const [editCustomerSale, setEditCustomerSale] = useState<Sale | null>(null);
  // SHOP VIEW MODE — INITIALIZED FROM LOCAL STORAGE
  const [shopView, setShopView] = useState<ViewMode>(getInitialShopView);
  // SHOP CURRENT PAGE STATE
  const [shopPage, setShopPage] = useState<number>(1);
  // SHOP ROWS PER PAGE — INITIALIZED FROM LOCAL STORAGE
  const [shopRows, setShopRows] = useState<number>(getInitialShopRows);
  // SHOP PRODUCT TYPE FILTER STATE
  const [shopProductFilter, setShopProductFilter] = useState<string>("");
  // SHOP SALE DIALOG STATE
  const [shopFormOpen, setShopFormOpen] = useState<boolean>(false);
  // SHOP SALE BEING EDITED (NULL = ADD MODE)
  const [editShopSale, setEditShopSale] = useState<Sale | null>(null);
  // DEBOUNCE CUSTOMER SEARCH INPUT (300MS) TO AVOID EXCESSIVE API CALLS
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  // FORMAT SELECTED MONTH AS YYYY-MM FOR API
  const monthStr = format(selectedMonth, "yyyy-MM");
  // MONTH PARAM — ONLY PASS WHEN FILTER IS MONTH
  const activeMonth = filter === "month" ? monthStr : "";
  // FETCH CUSTOMER SALES FROM SERVER WITH ALL ACTIVE FILTERS
  const {
    data: customerData,
    isLoading: customerLoading,
    isError: customerError,
  } = useCustomerSales(
    filter,
    activeMonth,
    debouncedCustomerSearch,
    pendingOnly,
    customerPage,
    customerRows,
  );
  // FETCH SHOP SALES FROM SERVER WITH ALL ACTIVE FILTERS
  const {
    data: shopData,
    isLoading: shopLoading,
    isError: shopError,
  } = useShopSales(filter, activeMonth, shopProductFilter, shopPage, shopRows);
  // DELETE SALE MUTATION (SHARED FOR BOTH SALE TYPES)
  const deleteMutation = useDeleteSale();
  // RESET CUSTOMER PAGE TO 1 WHEN CUSTOMER-SPECIFIC FILTERS CHANGE
  useEffect(() => {
    // RESET CUSTOMER PAGE TO 1
    setCustomerPage(1);
  }, [filter, activeMonth, debouncedCustomerSearch, pendingOnly]);
  // RESET SHOP PAGE TO 1 WHEN SHOP-SPECIFIC FILTERS CHANGE
  useEffect(() => {
    // RESET SHOP PAGE TO 1
    setShopPage(1);
  }, [filter, activeMonth, shopProductFilter]);
  // COMBINED STATS FROM API RESPONSE
  const stats = customerData?.stats ?? shopData?.stats;
  // COMBINED LOADING STATE FOR STATS CARDS SKELETON
  const statsLoading = customerLoading && shopLoading;
  // CUSTOMER SALES RECORDS FROM API RESPONSE — ALREADY PAGINATED BY SERVER
  const customerSales = useMemo(
    () => customerData?.records ?? [],
    [customerData?.records],
  );
  // CALCULATE CUSTOMER TOTAL FILTERED
  const customerTotalFiltered = customerData?.pagination?.total ?? 0;
  // CALCULATE CUSTOMER TOTAL PAGES
  const customerTotalPages = customerData?.pagination?.totalPages ?? 1;
  // CALCULATE CUSTOMER START INDEX
  const customerStartIndex = (customerPage - 1) * customerRows;
  // SHOP SALES RECORDS FROM API RESPONSE — ALREADY PAGINATED BY SERVER
  const shopSales = useMemo(() => shopData?.records ?? [], [shopData?.records]);
  // CALCULATE SHOP TOTAL FILTERED
  const shopTotalFiltered = shopData?.pagination?.total ?? 0;
  // CALCULATE SHOP TOTAL PAGES
  const shopTotalPages = shopData?.pagination?.totalPages ?? 1;
  // CALCULATE SHOP START INDEX
  const shopStartIndex = (shopPage - 1) * shopRows;
  // IS NEXT MONTH DISABLED (CANNOT NAVIGATE PAST CURRENT MONTH)
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // HANDLE ACTIVE TAB CHANGE — PERSISTS SELECTION TO LOCAL STORAGE
  const handleTabChange = useCallback((value: string): void => {
    // GUARD: ENSURE VALUE IS A VALID TAB
    if (!isSaleTab(value)) return;
    // UPDATE ACTIVE TAB STATE
    setActiveTab(value);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("sales_active_tab", value);
  }, []);
  // HANDLE FILTER CHANGE — RESETS BOTH PAGES
  const handleFilterChange = useCallback((newFilter: SaleFilter): void => {
    // UPDATE FILTER
    setFilter(newFilter);
    // RESET CUSTOMER PAGE TO 1
    setCustomerPage(1);
    // RESET SHOP PAGE TO 1
    setShopPage(1);
  }, []);
  // HANDLE MONTH NAVIGATION — DECREMENT MONTH
  const handlePrevMonth = useCallback((): void => {
    // DECREMENT MONTH
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
  }, []);
  // HANDLE MONTH NAVIGATION — INCREMENT MONTH (BLOCKED FOR FUTURE MONTHS)
  const handleNextMonth = useCallback((): void => {
    // INCREMENT MONTH
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
  }, []);
  // SET AND PERSIST CUSTOMER VIEW MODE TO LOCAL STORAGE
  const handleCustomerSetView = useCallback((mode: ViewMode): void => {
    // UPDATE VIEW STATE
    setCustomerView(mode);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("sales_customer_view", mode);
  }, []);
  // SET AND PERSIST SHOP VIEW MODE TO LOCAL STORAGE
  const handleShopSetView = useCallback((mode: ViewMode): void => {
    // UPDATE VIEW STATE
    setShopView(mode);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("sales_shop_view", mode);
  }, []);
  // HANDLE CUSTOMER ROWS PER PAGE CHANGE
  const handleCustomerRowsChange = useCallback((value: string): void => {
    // PARSE NEW VALUE
    const parsed = Number.parseInt(value, 10);
    // SANITIZE: FALLBACK TO 10 IF INVALID
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE STATE
    setCustomerRows(safe);
    // RESET TO FIRST PAGE
    setCustomerPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("sales_customer_rows", String(safe));
  }, []);
  // HANDLE SHOP ROWS PER PAGE CHANGE
  const handleShopRowsChange = useCallback((value: string): void => {
    // PARSE NEW VALUE
    const parsed = Number.parseInt(value, 10);
    // SANITIZE: FALLBACK TO 10 IF INVALID
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed;
    // UPDATE STATE
    setShopRows(safe);
    // RESET TO FIRST PAGE
    setShopPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem("sales_shop_rows", String(safe));
  }, []);
  // OPEN ADD CUSTOMER SALE DIALOG
  const handleCustomerAddOpen = useCallback((): void => {
    // CLEAR ANY EDIT STATE
    setEditCustomerSale(null);
    // OPEN DIALOG
    setCustomerFormOpen(true);
  }, []);
  // OPEN EDIT CUSTOMER SALE DIALOG
  const handleCustomerEdit = useCallback((sale: Sale): void => {
    // SET SALE TO EDIT
    setEditCustomerSale(sale);
    // OPEN DIALOG
    setCustomerFormOpen(true);
  }, []);
  // CLOSE CUSTOMER SALE FORM DIALOG
  const handleCustomerFormClose = useCallback((): void => {
    // CLOSE DIALOG
    setCustomerFormOpen(false);
    // CLEAR EDIT STATE
    setEditCustomerSale(null);
  }, []);
  // OPEN ADD SHOP SALE DIALOG
  const handleShopAddOpen = useCallback((): void => {
    // CLEAR ANY EDIT STATE
    setEditShopSale(null);
    // OPEN DIALOG
    setShopFormOpen(true);
  }, []);
  // OPEN EDIT SHOP SALE DIALOG
  const handleShopEdit = useCallback((sale: Sale): void => {
    // SET SALE TO EDIT
    setEditShopSale(sale);
    // OPEN DIALOG
    setShopFormOpen(true);
  }, []);
  // CLOSE SHOP SALE FORM DIALOG
  const handleShopFormClose = useCallback((): void => {
    // CLOSE DIALOG
    setShopFormOpen(false);
    // CLEAR EDIT STATE
    setEditShopSale(null);
  }, []);
  // DELETE SALE BY ID (SHARED FOR BOTH SALE TYPES)
  const handleDelete = useCallback(
    (id: string): void => {
      // CALL DELETE MUTATION
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );
  // SHARED CUSTOMER VIEW PROPS
  const customerViewProps = {
    sales: customerSales,
    totalFiltered: customerTotalFiltered,
    isLoading: customerLoading,
    currentPage: customerPage,
    rowsPerPage: customerRows,
    startIndex: customerStartIndex,
    totalPages: customerTotalPages,
    onPageChange: setCustomerPage,
    onRowsPerPageChange: handleCustomerRowsChange,
    onEdit: handleCustomerEdit,
    onDelete: handleDelete,
  };
  // SHARED SHOP VIEW PROPS
  const shopViewProps = {
    sales: shopSales,
    totalFiltered: shopTotalFiltered,
    isLoading: shopLoading,
    currentPage: shopPage,
    rowsPerPage: shopRows,
    startIndex: shopStartIndex,
    totalPages: shopTotalPages,
    onPageChange: setShopPage,
    onRowsPerPageChange: handleShopRowsChange,
    onEdit: handleShopEdit,
    onDelete: handleDelete,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD (NO CACHED DATA)
  if (customerLoading && shopLoading) {
    // RETURNING FULL PAGE SKELETON
    return (
      <SalesPageSkeleton
        activeTab={activeTab}
        customerView={customerView}
        shopView={shopView}
      />
    );
  }
  // RETURNING SALES PAGE
  return (
    // PAGE WRAPPER WITH TRANSITION
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE AND DESCRIPTION */}
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Sales
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Manage and track all sales transactions
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
      </div>
      {/* STATS CARDS — ALWAYS COMBINED (ALL SALE TYPES FOR THE PERIOD) */}
      <SaleStatsCards stats={stats} isLoading={statsLoading} />
      {/* TABBED VIEWS — CUSTOMER SALES AND SHOP SALES */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* TAB LIST */}
        <TabsList className="mb-4 h-10">
          {/* CUSTOMER SALES TAB */}
          <TabsTrigger value="customer" className="gap-2">
            <Users className="w-4 h-4" />
            <span>Customer Sales</span>
          </TabsTrigger>
          {/* SHOP SALES TAB */}
          <TabsTrigger value="shop" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Shop Sales</span>
          </TabsTrigger>
        </TabsList>
        {/* CUSTOMER SALES TAB CONTENT */}
        <TabsContent value="customer" className="mt-0">
          {/* CUSTOMER SALES CONTROLS ROW */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-4">
            {/* PENDING ONLY TOGGLE + SEARCH + VIEW TOGGLES + ADD */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* PENDING ONLY FILTER PILL */}
              <button
                onClick={() => {
                  setPendingOnly((prev) => !prev);
                  setCustomerPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border shrink-0",
                  pendingOnly
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
                )}
              >
                Pending Only
              </button>
              {/* CUSTOMER SEARCH INPUT */}
              <div className="relative flex-1 sm:flex-none sm:w-44 md:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9 w-full h-9"
                />
              </div>
              {/* CUSTOMER VIEW TOGGLE + ADD BUTTON */}
              <div className="flex items-center gap-2">
                {/* CUSTOMER VIEW TOGGLE BUTTONS */}
                <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
                  {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
                    <Tooltip key={mode} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleCustomerSetView(mode)}
                          className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            customerView === mode
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {label} view
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {/* ADD CUSTOMER SALE BUTTON */}
                <Button
                  onClick={handleCustomerAddOpen}
                  className="shrink-0 h-9 ml-auto sm:ml-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>
          {/* CUSTOMER SALES ERROR STATE */}
          {customerError && (
            <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to load customer sales. Please check your connection and
                try again.
              </p>
            </div>
          )}
          {/* CUSTOMER TABLE VIEW */}
          {customerView === "table" && (
            <CustomerSaleTableView {...customerViewProps} />
          )}
          {/* CUSTOMER LIST VIEW */}
          {customerView === "list" && (
            <CustomerSaleListView {...customerViewProps} />
          )}
          {/* CUSTOMER GRID VIEW */}
          {customerView === "grid" && (
            <CustomerSaleGridView {...customerViewProps} />
          )}
        </TabsContent>
        {/* SHOP SALES TAB CONTENT */}
        <TabsContent value="shop" className="mt-0">
          {/* SHOP SALES CONTROLS ROW */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-4">
            {/* PRODUCT FILTER + VIEW TOGGLES + ADD */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* PRODUCT TYPE FILTER SELECT */}
              <Select
                value={shopProductFilter || "__all__"}
                onValueChange={(val) => {
                  setShopProductFilter(val === "__all__" ? "" : val);
                  setShopPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-36 shrink-0">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Products</SelectItem>
                  <SelectItem value="milk">Milk</SelectItem>
                  <SelectItem value="yoghurt">Yoghurt</SelectItem>
                </SelectContent>
              </Select>
              {/* SHOP VIEW TOGGLE + ADD BUTTON */}
              <div className="flex items-center gap-2">
                {/* SHOP VIEW TOGGLE BUTTONS */}
                <div className="flex items-center bg-muted rounded-lg p-0.5 shrink-0">
                  {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
                    <Tooltip key={mode} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleShopSetView(mode)}
                          className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            shopView === mode
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {label} view
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {/* ADD SHOP SALE BUTTON */}
                <Button
                  onClick={handleShopAddOpen}
                  className="shrink-0 h-9 ml-auto sm:ml-0"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>
          {/* SHOP SALES ERROR STATE */}
          {shopError && (
            <div className="glass-card p-5 sm:p-6 text-center mb-5 sm:mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to load shop sales. Please check your connection and try
                again.
              </p>
            </div>
          )}
          {/* SHOP TABLE VIEW */}
          {shopView === "table" && <ShopSaleTableView {...shopViewProps} />}
          {/* SHOP LIST VIEW */}
          {shopView === "list" && <ShopSaleListView {...shopViewProps} />}
          {/* SHOP GRID VIEW */}
          {shopView === "grid" && <ShopSaleGridView {...shopViewProps} />}
        </TabsContent>
      </Tabs>
      {/* CUSTOMER SALE ADD / EDIT FORM DIALOG */}
      <CustomerSaleFormDialog
        open={customerFormOpen}
        editSale={editCustomerSale}
        onClose={handleCustomerFormClose}
      />
      {/* SHOP SALE ADD / EDIT FORM DIALOG */}
      <ShopSaleFormDialog
        open={shopFormOpen}
        editSale={editShopSale}
        onClose={handleShopFormClose}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Sales.displayName = "Sales";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Sales;
