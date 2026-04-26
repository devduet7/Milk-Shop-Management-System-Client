// <== IMPORTS ==>
import {
  Zap,
  Plus,
  List,
  Milk,
  Trash2,
  Table2,
  IceCream,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback, useMemo } from "react";
import { PageTransition } from "@/components/layout/PageTransition";

// <== QUICK SALE INTERFACE ==>
interface QuickSale {
  // <== ID ==>
  id: number;
  // <== TYPE ==>
  type: "milk" | "yoghurt";
  // <== QUANTITY ==>
  quantity: number;
  // <== RATE ==>
  rate: number;
  // <== TOTAL ==>
  total: number;
  // <== TIMESTAMP ==>
  timestamp: string;
}
// <== VIEW MODE TYPE ==>
type ViewMode = "table" | "list" | "grid";
// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== MODE ==>
  mode: ViewMode;
  // <== ICON ==>
  icon: typeof Table2;
  // <== LABEL ==>
  label: string;
};
// <== STAT TYPE ==>
type Stat = {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== COLOR ==>
  color: string;
};
// <== DEFAULT MILK RATE ==>
const DEFAULT_MILK_RATE = "120";
// <== DEFAULT YOGHURT RATE ==>
const DEFAULT_YOGHURT_RATE = "180";
// <== VIEW BUTTONS LIST ==>
const VIEW_BUTTONS: ViewButton[] = [
  { mode: "table", icon: Table2, label: "Table" },
  { mode: "list", icon: List, label: "List" },
  { mode: "grid", icon: LayoutGrid, label: "Grid" },
];
// <== INITIAL SALES ==>
const INITIAL_SALES: QuickSale[] = [
  {
    id: 1,
    type: "milk",
    quantity: 2,
    rate: 120,
    total: 240,
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    type: "yoghurt",
    quantity: 1,
    rate: 180,
    total: 180,
    timestamp: new Date().toISOString(),
  },
  {
    id: 3,
    type: "milk",
    quantity: 5,
    rate: 120,
    total: 600,
    timestamp: new Date().toISOString(),
  },
];
// <== FORMAT TIME FUNCTION ==>
const formatTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
// <== IS TODAY FUNCTION ==>
const isToday = (timestamp: string): boolean =>
  new Date(timestamp).toDateString() === new Date().toDateString();

// <== QUICK SALES PAGE COMPONENT ==>
const QuickSales = memo(() => {
  // SALES STATE
  const [sales, setSales] = useState<QuickSale[]>(INITIAL_SALES);
  // VIEW MODE STATE
  const [view, setView] = useState<ViewMode>(() => {
    // VIEW MODE FROM LOCAL STORAGE
    return (localStorage.getItem("quick_sales_view") as ViewMode) || "table";
  });
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  // MILK QUANTITY STATE
  const [milkQty, setMilkQty] = useState<string>("");
  // MILK RATE STATE
  const [milkRate, setMilkRate] = useState<string>(DEFAULT_MILK_RATE);
  // YOGHURT QUANTITY STATE
  const [yoghurtQty, setYoghurtQty] = useState<string>("");
  // YOGHURT RATE STATE
  const [yoghurtRate, setYoghurtRate] = useState<string>(DEFAULT_YOGHURT_RATE);
  // SET VIEW MODE HANDLER
  const setViewMode = useCallback((mode: ViewMode): void => {
    // SET VIEW MODE
    setView(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("quick_sales_view", mode);
    // RESET CURRENT PAGE
    setCurrentPage(1);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = useCallback((value: string): void => {
    // SET ROWS PER PAGE
    setRowsPerPage(Number(value));
    // RESET CURRENT PAGE
    setCurrentPage(1);
  }, []);
  // HANDLE MILK SALE SUBMIT
  const handleMilkSale = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      // PREVENT DEFAULT
      e.preventDefault();
      // PARSE QUANTITY
      const qty = parseFloat(milkQty) || 0;
      // PARSE RATE
      const rate = parseFloat(milkRate) || 120;
      // VALIDATE QUANTITY
      if (qty <= 0) {
        // ERROR TOAST
        toast.error("Please enter a valid quantity");
        // RETURN
        return;
      }
      // ADD SALE RECORD
      setSales((prev) => [
        {
          id: Date.now(),
          type: "milk",
          quantity: qty,
          rate,
          total: qty * rate,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      // RESET QUANTITY INPUT
      setMilkQty("");
      // SUCCESS TOAST
      toast.success(`Milk sale recorded: ${qty}L × ₨${rate} = ₨${qty * rate}`);
    },
    [milkQty, milkRate],
  );
  // HANDLE YOGHURT SALE SUBMIT
  const handleYoghurtSale = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      // PREVENT DEFAULT
      e.preventDefault();
      // PARSE QUANTITY
      const qty = parseFloat(yoghurtQty) || 0;
      // PARSE RATE
      const rate = parseFloat(yoghurtRate) || 180;
      // VALIDATE QUANTITY
      if (qty <= 0) {
        // ERROR TOAST
        toast.error("Please enter a valid quantity");
        // RETURN
        return;
      }
      // ADD SALE RECORD
      setSales((prev) => [
        {
          id: Date.now(),
          type: "yoghurt",
          quantity: qty,
          rate,
          total: qty * rate,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
      // RESET QUANTITY INPUT
      setYoghurtQty("");
      // SUCCESS TOAST
      toast.success(
        `Yoghurt sale recorded: ${qty}kg × ₨${rate} = ₨${qty * rate}`,
      );
    },
    [yoghurtQty, yoghurtRate],
  );
  // DELETE HANDLER
  const handleDelete = useCallback((id: number): void => {
    // FILTER RECORDS
    setSales((prev) => prev.filter((s) => s.id !== id));
    // SUCCESS TOAST
    toast.success("Sale deleted!");
  }, []);
  // STATS DERIVED FROM TODAY'S SALES
  const todaySales = sales.filter((s) => isToday(s.timestamp));
  // TOTAL REVENUE
  const totalRevenue = todaySales.reduce((a, s) => a + s.total, 0);
  // TOTAL MILK
  const totalMilk = todaySales
    .filter((s) => s.type === "milk")
    .reduce((a, s) => a + s.quantity, 0);
  // TOTAL YOGHURT
  const totalYoghurt = todaySales
    .filter((s) => s.type === "yoghurt")
    .reduce((a, s) => a + s.quantity, 0);
  // STATS
  const stats: Stat[] = [
    // REVENUE
    {
      label: "Today's Revenue",
      value: `₨${totalRevenue.toLocaleString()}`,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    // MILK SOLD
    {
      label: "Milk Sold",
      value: `${totalMilk}L`,
      color: "text-blue-600 dark:text-blue-400",
    },
    // YOGHURT SOLD
    {
      label: "Yoghurt Sold",
      value: `${totalYoghurt}kg`,
      color: "text-purple-600 dark:text-purple-400",
    },
    // TRANSACTIONS
    {
      label: "Transactions",
      value: todaySales.length.toString(),
      color: "text-amber-600 dark:text-amber-400",
    },
  ];
  // PAGINATION
  const totalPages = Math.ceil(sales.length / rowsPerPage);
  // PAGINATED SALES
  const paginatedSales = useMemo((): QuickSale[] => {
    // CALCULATE START INDEX
    const start = (currentPage - 1) * rowsPerPage;
    // RETURN PAGINATED RECORDS
    return sales.slice(start, start + rowsPerPage);
  }, [sales, currentPage, rowsPerPage]);
  // GO TO PAGE HANDLER
  const goToPage = useCallback(
    (page: number): void => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );
  // TYPE BADGE
  const typeBadge = (type: "milk" | "yoghurt") => (
    <Badge
      variant="secondary"
      className={cn(
        "text-[10px] font-bold tracking-wider uppercase",
        type === "milk"
          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
          : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
      )}
    >
      {type.toUpperCase()}
    </Badge>
  );
  // PAGINATION CONTROLS
  const PaginationControls = () => (
    // PAGINATION CONTROLS MAIN CONTAINER
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      {/* ROWS PER PAGE */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        {/* ROWS PER PAGE SELECT */}
        <Select
          value={rowsPerPage.toString()}
          onValueChange={handleRowsPerPageChange}
        >
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* PAGINATION BUTTONS */}
      <div className="flex items-center gap-1">
        {/* PAGE INFO */}
        <span className="text-sm text-muted-foreground mr-2">
          Page {currentPage} of {totalPages || 1}
        </span>
        {/* PREV BUTTON */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {/* NEXT BUTTON */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  // RETURNING QUICK SALES PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Quick Sales</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Record instant milk and yoghurt sales
            </p>
          </div>
        </div>
        {/* VIEW BUTTONS */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          {VIEW_BUTTONS.map(({ mode, icon: Icon, label }) => (
            <Tooltip key={mode} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode(mode)}
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
      </div>
      {/* STATS CONTAINER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            {/* STAT LABEL */}
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            {/* STAT VALUE */}
            <p
              className={cn("text-2xl font-bold font-display mt-1", stat.color)}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
      {/* QUICK SALE FORMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* MILK SALE FORM */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5"
        >
          {/* FORM HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Milk Sale</h3>
              <p className="text-xs text-muted-foreground">₨{milkRate}/liter</p>
            </div>
          </div>
          {/* FORM */}
          <form onSubmit={handleMilkSale} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* QUANTITY INPUT */}
              <div>
                <Label className="text-xs">Quantity (L)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={milkQty}
                  onChange={(e) => setMilkQty(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* RATE INPUT */}
              <div>
                <Label className="text-xs">Rate (₨/L)</Label>
                <Input
                  type="number"
                  value={milkRate}
                  onChange={(e) => setMilkRate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Milk Sale
            </Button>
          </form>
        </motion.div>
        {/* YOGHURT SALE FORM */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-5"
        >
          {/* FORM HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Yoghurt Sale</h3>
              <p className="text-xs text-muted-foreground">₨{yoghurtRate}/kg</p>
            </div>
          </div>
          {/* FORM */}
          <form onSubmit={handleYoghurtSale} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* QUANTITY INPUT */}
              <div>
                <Label className="text-xs">Quantity (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={yoghurtQty}
                  onChange={(e) => setYoghurtQty(e.target.value)}
                  className="mt-1"
                />
              </div>
              {/* RATE INPUT */}
              <div>
                <Label className="text-xs">Rate (₨/kg)</Label>
                <Input
                  type="number"
                  value={yoghurtRate}
                  onChange={(e) => setYoghurtRate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Yoghurt Sale
            </Button>
          </form>
        </motion.div>
      </div>
      {/* DAILY SALES HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Today's Sales</h2>
        <span className="text-sm text-muted-foreground">
          {sales.length} total records
        </span>
      </div>
      {/* SALES TABLE VIEW */}
      {view === "table" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            {/* TABLE */}
            <table className="w-full text-sm">
              {/* TABLE HEADER */}
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* TABLE BODY */}
              <tbody>
                {/* SALES */}
                {paginatedSales.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">{typeBadge(s.type)}</td>
                    <td className="p-3">
                      {s.quantity}
                      {s.type === "milk" ? "L" : "kg"}
                    </td>
                    <td className="p-3">₨{s.rate}</td>
                    <td className="p-3 font-semibold">₨{s.total}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatTime(s.timestamp)}
                    </td>
                    <td className="p-3">
                      {/* ACTIONS */}
                      <div className="flex gap-1">
                        {/* DELETE */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {/* NO SALES */}
            {paginatedSales.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No sales recorded yet.
              </div>
            )}
          </div>
          {/* PAGINATION */}
          <PaginationControls />
        </motion.div>
      )}
      {/* SALES LIST VIEW */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* SALES */}
          <div className="divide-y divide-border/50">
            {paginatedSales.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
              >
                {/* TYPE ICON */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    s.type === "milk" ? "bg-blue-500/10" : "bg-purple-500/10",
                  )}
                >
                  {s.type === "milk" ? (
                    <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                {/* SALE INFO */}
                <div className="flex-1 min-w-0">
                  {/* TYPE & BADGE */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{s.type}</span>
                    {typeBadge(s.type)}
                  </div>
                  {/* DETAILS */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      {s.quantity}
                      {s.type === "milk" ? "L" : "kg"} × ₨{s.rate}
                    </span>
                    <span>{formatTime(s.timestamp)}</span>
                  </div>
                </div>
                {/* TOTAL */}
                <div className="text-right shrink-0">
                  <span className="font-display text-lg font-bold">
                    ₨{s.total}
                  </span>
                </div>
                {/* ACTIONS */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
            {/* NO SALES */}
            {paginatedSales.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No sales recorded yet.
              </div>
            )}
          </div>
          {/* PAGINATION */}
          <PaginationControls />
        </motion.div>
      )}
      {/* SALES GRID VIEW */}
      {view === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* SALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {paginatedSales.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 flex flex-col hover:shadow-md transition-all group relative"
              >
                {/* TYPE ICON & BADGE */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      s.type === "milk" ? "bg-blue-500/10" : "bg-purple-500/10",
                    )}
                  >
                    {s.type === "milk" ? (
                      <Milk className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <IceCream className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  {typeBadge(s.type)}
                </div>
                {/* QUANTITY */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-display text-xl font-bold">
                    {s.quantity}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      {s.type === "milk" ? "L" : "kg"}
                    </span>
                  </p>
                </div>
                {/* TOTAL & ACTIONS */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div>
                    {/* TIME */}
                    <p className="text-xs text-muted-foreground">
                      {formatTime(s.timestamp)}
                    </p>
                    {/* TOTAL */}
                    <p className="font-display text-lg font-bold">₨{s.total}</p>
                  </div>
                  {/* DELETE */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          {/* NO SALES */}
          {paginatedSales.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No sales recorded yet.
            </div>
          )}
          {/* PAGINATION */}
          <div className="glass-card overflow-hidden">
            <PaginationControls />
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
QuickSales.displayName = "QuickSales";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default QuickSales;
