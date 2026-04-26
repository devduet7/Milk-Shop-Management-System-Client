// <== IMPORTS ==>
import {
  Plus,
  List,
  Check,
  Clock,
  Search,
  Table2,
  Trash2,
  Target,
  Calendar,
  RefreshCw,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/layout/PageTransition";

// <== RECOVERY INTERFACE ==>
interface Recovery {
  // <== ID ==>
  id: number;
  // <== CUSTOMER ==>
  customer: string;
  // <== AMOUNT ==>
  amount: number;
  // <== RECOVERED ==>
  recovered: number;
  // <== DATE ==>
  date: string;
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
  // <== ICON ==>
  icon: typeof DollarSign;
  // <== CHANGE ==>
  change: string;
  // <== TREND ==>
  trend: "up" | "down" | "neutral";
};
// <== VIEW BUTTONS LIST ==>
const VIEW_BUTTONS: ViewButton[] = [
  { mode: "table", icon: Table2, label: "Table" },
  { mode: "list", icon: List, label: "List" },
  { mode: "grid", icon: LayoutGrid, label: "Grid" },
];

// <== INITIAL RECORDS ==>
const INITIAL_RECORDS: Recovery[] = [
  {
    id: 1,
    customer: "Ali Khan",
    amount: 5000,
    recovered: 3000,
    date: "2026-03-01",
  },
  {
    id: 2,
    customer: "Ahmed",
    amount: 2000,
    recovered: 2000,
    date: "2026-03-02",
  },
  {
    id: 3,
    customer: "Bilal",
    amount: 8000,
    recovered: 1000,
    date: "2026-02-28",
  },
  {
    id: 4,
    customer: "Hassan",
    amount: 3500,
    recovered: 3500,
    date: "2026-02-25",
  },
  {
    id: 5,
    customer: "Fatima",
    amount: 4200,
    recovered: 2100,
    date: "2026-02-20",
  },
  { id: 6, customer: "Sara", amount: 1800, recovered: 900, date: "2026-02-15" },
];

// <== RECOVERIES PAGE COMPONENT ==>
const Recoveries = () => {
  // SEARCH STATE
  const [search, setSearch] = useState<string>("");
  // DIALOG STATE
  const [open, setOpen] = useState<boolean>(false);
  // VIEW MODE STATE
  const [view, setView] = useState<ViewMode>(() => {
    // VIEW MODE FROM LOCAL STORAGE
    return (localStorage.getItem("recoveries_view") as ViewMode) || "table";
  });
  // RECOVERIES RECORD STATE
  const [records, setRecords] = useState<Recovery[]>(INITIAL_RECORDS);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    // RETRIEVE ROWS PER PAGE FROM LOCAL STORAGE
    return parseInt(localStorage.getItem("recoveries_rows_per_page") || "5");
  });
  // SET VIEW MODE HANDLER
  const setViewMode = useCallback((mode: ViewMode): void => {
    // SET VIEW MODE
    setView(mode);
    // SET VIEW MODE IN LOCAL STORAGE
    localStorage.setItem("recoveries_view", mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = useCallback((value: string): void => {
    // SET ROWS PER PAGE
    setRowsPerPage(parseInt(value));
    // RESET CURRENT PAGE
    setCurrentPage(1);
    // SET ROWS PER PAGE IN LOCAL STORAGE
    localStorage.setItem("recoveries_rows_per_page", value);
  }, []);
  // FILTERED RECORDS
  const filtered = records.filter((r) =>
    r.customer.toLowerCase().includes(search.toLowerCase()),
  );
  // CALCULATE TOTAL PAGES
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  // CALCULATE START INDEX
  const startIndex = (currentPage - 1) * rowsPerPage;
  // CALCULATE PAGINATED RECORDS
  const paginatedRecords = filtered.slice(startIndex, startIndex + rowsPerPage);
  // CALCULATE TOTAL DUE
  const totalDue = records.reduce((a, r) => a + r.amount, 0);
  // CALCULATE TOTAL RECOVERED
  const totalRecovered = records.reduce((a, r) => a + r.recovered, 0);
  // CALCULATE OUTSTANDING
  const outstanding = totalDue - totalRecovered;
  // CALCULATE RECOVERY RATE
  const recoveryRate = totalDue > 0 ? (totalRecovered / totalDue) * 100 : 0;
  // CALCULATE CLEARED COUNT
  const clearedCount = records.filter((r) => r.recovered >= r.amount).length;
  // STATS
  const stats: Stat[] = [
    // TOTAL DUE
    {
      label: "Total Due",
      value: `₨${totalDue.toLocaleString()}`,
      icon: DollarSign,
      change: `${records.length} records`,
      trend: "neutral",
    },
    // TOTAL RECOVERED
    {
      label: "Recovered",
      value: `₨${totalRecovered.toLocaleString()}`,
      icon: TrendingUp,
      change: `+${recoveryRate.toFixed(0)}%`,
      trend: "up",
    },
    // OUTSTANDING
    {
      label: "Outstanding",
      value: `₨${outstanding.toLocaleString()}`,
      icon: ArrowDownRight,
      change: `${records.length - clearedCount} pending`,
      trend: "down",
    },
    // RECOVERY RATE
    {
      label: "Recovery Rate",
      value: `${recoveryRate.toFixed(1)}%`,
      icon: Target,
      change: `${clearedCount} cleared`,
      trend: recoveryRate >= 70 ? "up" : "down",
    },
  ];
  // SUBMIT HANDLER
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      // PREVENT DEFAULT
      e.preventDefault();
      // GET FORM DATA
      const fd = new FormData(e.currentTarget);
      // ADD RECORD
      setRecords((prev) => [
        {
          id: Date.now(),
          customer: fd.get("customer") as string,
          amount: parseFloat(fd.get("amount") as string),
          recovered: parseFloat(fd.get("recovered") as string) || 0,
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      // CLOSE DIALOG
      setOpen(false);
      // SUCCESS TOAST
      toast.success("Recovery recorded!");
    },
    [],
  );
  // DELETE HANDLER
  const handleDelete = useCallback((id: number): void => {
    // FILTER RECORDS
    setRecords((prev) => prev.filter((r) => r.id !== id));
    // SUCCESS TOAST
    toast.success("Deleted!");
  }, []);
  // STATUS BADGE
  const statusBadge = (pct: number) => {
    // CHECK IF CLEARED
    const done = pct >= 100;
    // RETURNING STATUS BADGE
    return (
      <Badge
        variant={done ? "default" : "secondary"}
        className={cn(
          "text-[10px] font-bold tracking-wider uppercase",
          done
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
        )}
      >
        {done ? (
          <>
            <Check className="w-3 h-3 mr-1" />
            CLEARED
          </>
        ) : (
          <>
            <Clock className="w-3 h-3 mr-1" />
            PENDING
          </>
        )}
      </Badge>
    );
  };
  // PAGINATION CONTROLS
  const PaginationControls = () => (
    // PAGINATION CONTROLS MAIN CONTAINER
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      {/* CONTENT CONTAINER */}
      <div className="flex items-center gap-2">
        {/* ROWS PER PAGE */}
        <span className="text-sm text-muted-foreground">Rows per page:</span>
        {/* ROWS PER PAGE SELECT */}
        <Select
          value={rowsPerPage.toString()}
          onValueChange={handleRowsPerPageChange}
        >
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* PAGINATION */}
      <div className="flex items-center gap-2">
        {/* PAGINATION TEXT */}
        <span className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filtered.length)}{" "}
          of {filtered.length}
        </span>
        {/* PAGINATION BUTTONS */}
        <div className="flex gap-1">
          {/* PREV BUTTON */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {/* NEXT BUTTON */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
  // RETURNING RECOVERIES PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Recoveries</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track outstanding payments and collections
            </p>
          </div>
        </div>
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
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
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search recoveries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* ADD BUTTON */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Record Recovery
                </DialogTitle>
              </DialogHeader>
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* CUSTOMER INPUT */}
                <div>
                  <Label>Customer</Label>
                  <Input name="customer" required className="mt-1" />
                </div>
                {/* AMOUNT & RECOVERED INPUT */}
                <div className="grid grid-cols-2 gap-3">
                  {/* TOTAL DUE INPUT */}
                  <div>
                    <Label>Total Due</Label>
                    <Input
                      name="amount"
                      type="number"
                      required
                      className="mt-1"
                    />
                  </div>
                  {/* RECOVERED INPUT */}
                  <div>
                    <Label>Recovered</Label>
                    <Input name="recovered" type="number" className="mt-1" />
                  </div>
                </div>
                {/* SUBMIT */}
                <Button type="submit" className="w-full">
                  Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* STATS CONTAINER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((stat, i) => {
          // ICON
          const Icon = stat.icon;
          // RETURNING STAT CARD
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-3">
                {/* ICON */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                {/* TREND */}
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                    stat.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : stat.trend === "down"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {stat.change}
                </div>
              </div>
              {/* LABEL */}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {/* VALUE */}
              <p className="text-2xl font-bold font-display mt-0.5">
                {stat.value}
              </p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          );
        })}
      </div>
      {/* RECOVERIES TABLE VIEW */}
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
                    Customer
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Total Due
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Recovered
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* TABLE BODY */}
              <tbody>
                {/* RECOVERIES */}
                {paginatedRecords.map((r, i) => {
                  // CALCULATE PERCENTAGE
                  const pct = r.amount > 0 ? (r.recovered / r.amount) * 100 : 0;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 font-medium">{r.customer}</td>
                      <td className="p-3">₨{r.amount.toLocaleString()}</td>
                      <td className="p-3 font-semibold">
                        ₨{r.recovered.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {/* PROGRESS BAR */}
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">{statusBadge(pct)}</td>
                      <td className="p-3 text-muted-foreground">{r.date}</td>
                      <td className="p-3">
                        {/* ACTIONS */}
                        <div className="flex gap-1">
                          {/* DELETE */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {/* NO RECOVERIES */}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No recoveries found.
              </div>
            )}
          </div>
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* RECOVERIES LIST VIEW */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* RECOVERIES */}
          <div className="divide-y divide-border/50">
            {paginatedRecords.map((r, i) => {
              // CALCULATE PERCENTAGE
              const pct = r.amount > 0 ? (r.recovered / r.amount) * 100 : 0;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* CUSTOMER AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {r.customer.charAt(0)}
                    </span>
                  </div>
                  {/* CUSTOMER INFO */}
                  <div className="flex-1 min-w-0">
                    {/* CUSTOMER NAME */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">
                        {r.customer}
                      </span>
                      {statusBadge(pct)}
                    </div>
                    {/* CUSTOMER DETAILS */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        ₨{r.recovered.toLocaleString()} / ₨
                        {r.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {r.date}
                      </span>
                    </div>
                  </div>
                  {/* PROGRESS BAR */}
                  <div className="w-24 shrink-0">
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {pct.toFixed(0)}%
                    </p>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* DELETE */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* NO RECOVERIES */}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No recoveries found.
            </div>
          )}
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* RECOVERIES GRID VIEW */}
      {view === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* RECOVERIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {paginatedRecords.map((r, i) => {
              // CALCULATE PERCENTAGE
              const pct = r.amount > 0 ? (r.recovered / r.amount) * 100 : 0;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-5 flex flex-col hover:shadow-md transition-all group relative"
                >
                  {/* CUSTOMER INFO */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* CUSTOMER AVATAR */}
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-base font-bold text-primary">
                          {r.customer.charAt(0)}
                        </span>
                      </div>
                      {/* CUSTOMER NAME & DATE */}
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {r.customer}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.date}
                        </p>
                      </div>
                    </div>
                    {statusBadge(pct)}
                  </div>
                  {/* AMOUNTS */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* TOTAL DUE */}
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Total Due
                      </p>
                      <p className="font-display text-lg font-bold">
                        ₨{r.amount.toLocaleString()}
                      </p>
                    </div>
                    {/* RECOVERED */}
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Recovered
                      </p>
                      <p className="font-display text-lg font-bold text-primary">
                        ₨{r.recovered.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* PROGRESS */}
                  <div className="mt-auto pt-3 border-t border-border/50">
                    {/* PROGRESS HEADER */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-xs font-semibold">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    {/* PROGRESS BAR */}
                    <Progress value={pct} className="h-2" />
                    {/* ACTIONS */}
                    <div className="flex justify-end mt-3">
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* DELETE */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* NO RECOVERIES */}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No recoveries found.
            </div>
          )}
          {/* PAGINATION */}
          {filtered.length > 0 && (
            <div className="glass-card">
              <PaginationControls />
            </div>
          )}
        </motion.div>
      )}
    </PageTransition>
  );
};

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(Recoveries);
