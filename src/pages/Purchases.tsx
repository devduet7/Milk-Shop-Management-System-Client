// <== IMPORTS ==>
import {
  Plus,
  Edit,
  List,
  Milk,
  Truck,
  Trash2,
  Table2,
  Search,
  Package,
  Calendar,
  TrendingUp,
  LayoutGrid,
  DollarSign,
  ChevronLeft,
  TrendingDown,
  ChevronRight,
  type LucideIcon,
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
import { memo, useState, useCallback } from "react";
import { PageTransition } from "@/components/layout/PageTransition";

// <== PURCHASE INTERFACE ==>
interface Purchase {
  // <== ID ==>
  id: number;
  // <== SUPPLIER ==>
  supplier: string;
  // <== MILK ==>
  milk: number;
  // <== COST ==>
  cost: number;
  // <== DATE ==>
  date: string;
  // <== STATUS ==>
  status: string;
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
  icon: LucideIcon;
  // <== CHANGE ==>
  change: string;
  // <== TREND ==>
  trend: "up" | "down";
};
// <== VIEW BUTTONS LIST ==>
const VIEW_BUTTONS: ViewButton[] = [
  { mode: "table", icon: Table2, label: "Table" },
  { mode: "list", icon: List, label: "List" },
  { mode: "grid", icon: LayoutGrid, label: "Grid" },
];
// <== INITIAL RECORDS ==>
const INITIAL_RECORDS: Purchase[] = [
  {
    id: 1,
    supplier: "Farm A",
    milk: 50,
    cost: 5000,
    date: "2026-03-05",
    status: "received",
  },
  {
    id: 2,
    supplier: "Farm B",
    milk: 30,
    cost: 3200,
    date: "2026-03-04",
    status: "pending",
  },
  {
    id: 3,
    supplier: "Farm A",
    milk: 45,
    cost: 4500,
    date: "2026-03-03",
    status: "received",
  },
  {
    id: 4,
    supplier: "Farm C",
    milk: 60,
    cost: 6000,
    date: "2026-03-02",
    status: "received",
  },
  {
    id: 5,
    supplier: "Farm B",
    milk: 35,
    cost: 3500,
    date: "2026-03-01",
    status: "received",
  },
  {
    id: 6,
    supplier: "Farm A",
    milk: 40,
    cost: 4000,
    date: "2026-02-28",
    status: "received",
  },
];

// <== PURCHASES PAGE COMPONENT ==>
const Purchases = memo(() => {
  // RECORDS STATE
  const [records, setRecords] = useState<Purchase[]>(INITIAL_RECORDS);
  // SEARCH STATE
  const [search, setSearch] = useState<string>("");
  // DIALOG STATE
  const [open, setOpen] = useState<boolean>(false);
  // EDIT ITEM STATE
  const [editItem, setEditItem] = useState<Purchase | null>(null);
  // VIEW MODE STATE
  const [view, setView] = useState<ViewMode>(() => {
    // VIEW MODE FROM LOCAL STORAGE
    return (localStorage.getItem("purchases_view") as ViewMode) || "table";
  });
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    // RETRIEVE ROWS PER PAGE FROM LOCAL STORAGE
    return parseInt(localStorage.getItem("purchases_rows_per_page") || "5");
  });
  // SET VIEW MODE HANDLER
  const setViewMode = useCallback((mode: ViewMode): void => {
    // SET VIEW MODE
    setView(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("purchases_view", mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = useCallback((value: string): void => {
    // SET ROWS PER PAGE
    setRowsPerPage(parseInt(value));
    // RESET CURRENT PAGE
    setCurrentPage(1);
    // PERSIST ROWS PER PAGE TO LOCAL STORAGE
    localStorage.setItem("purchases_rows_per_page", value);
  }, []);
  // HANDLE DIALOG OPEN CHANGE
  const handleDialogOpenChange = useCallback((v: boolean): void => {
    // SET DIALOG STATE
    setOpen(v);
    // RESET EDIT ITEM ON CLOSE
    if (!v) setEditItem(null);
  }, []);
  // HANDLE EDIT ITEM
  const handleEdit = useCallback((record: Purchase): void => {
    // SET EDIT ITEM
    setEditItem(record);
    // OPEN DIALOG
    setOpen(true);
  }, []);
  // FILTERED RECORDS
  const filtered = records.filter((r) =>
    r.supplier.toLowerCase().includes(search.toLowerCase()),
  );
  // CALCULATE TOTAL PAGES
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  // CALCULATE START INDEX
  const startIndex = (currentPage - 1) * rowsPerPage;
  // CALCULATE PAGINATED RECORDS
  const paginatedRecords = filtered.slice(startIndex, startIndex + rowsPerPage);
  // TOTAL COST
  const totalCost = records.reduce((a, r) => a + r.cost, 0);
  // TOTAL MILK
  const totalMilk = records.reduce((a, r) => a + r.milk, 0);
  // RECEIVED COUNT
  const receivedCount = records.filter((r) => r.status === "received").length;
  // CALCULATE WEEKLY PURCHASES (LAST 7 DAYS)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyPurchases = records.filter(
    (r) => new Date(r.date) >= oneWeekAgo,
  ).length;
  // STATS
  const stats: Stat[] = [
    // TOTAL SPENT
    {
      label: "Total Spent",
      value: `₨${totalCost.toLocaleString()}`,
      icon: DollarSign,
      change: "-5%",
      trend: "down",
    },
    // MILK PURCHASED
    {
      label: "Milk Purchased",
      value: `${totalMilk}L`,
      icon: Milk,
      change: "+10%",
      trend: "up",
    },
    // WEEKLY PURCHASES
    {
      label: "Weekly Purchases",
      value: `${weeklyPurchases}`,
      icon: Calendar,
      change: "+3",
      trend: "up",
    },
    // RECEIVED
    {
      label: "Received",
      value: `${receivedCount}/${records.length}`,
      icon: Truck,
      change: `${records.length > 0 ? ((receivedCount / records.length) * 100).toFixed(0) : 0}%`,
      trend: "up",
    },
  ];
  // SUBMIT HANDLER
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      // PREVENT DEFAULT
      e.preventDefault();
      // GET FORM DATA
      const fd = new FormData(e.currentTarget);
      // PARSE MILK FROM FORM DATA
      const milk = parseFloat(fd.get("milk") as string) || 0;
      // PARSE COST FROM FORM DATA
      const cost = parseFloat(fd.get("cost") as string) || 0;
      // IF EDIT ITEM
      if (editItem) {
        // UPDATE RECORD
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editItem.id
              ? { ...r, supplier: fd.get("supplier") as string, milk, cost }
              : r,
          ),
        );
        // SUCCESS TOAST
        toast.success("Purchase updated!");
      } else {
        // ADD RECORD
        setRecords((prev) => [
          {
            id: Date.now(),
            supplier: fd.get("supplier") as string,
            milk,
            cost,
            date: new Date().toISOString().split("T")[0],
            status: "pending",
          },
          ...prev,
        ]);
        // SUCCESS TOAST
        toast.success("Purchase added!");
      }
      // CLOSE MODAL
      setOpen(false);
      // RESET EDIT ITEM
      setEditItem(null);
    },
    [editItem],
  );
  // DELETE HANDLER
  const handleDelete = useCallback((id: number): void => {
    // FILTER RECORDS
    setRecords((prev) => prev.filter((r) => r.id !== id));
    // SUCCESS TOAST
    toast.success("Deleted!");
  }, []);
  // STATUS BADGE
  const statusBadge = (status: string) => (
    // RETURNING STATUS BADGE
    <Badge
      variant={status === "received" ? "default" : "secondary"}
      className={cn(
        "text-[10px] font-bold tracking-wider uppercase",
        status === "received"
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
      )}
    >
      {status.toUpperCase()}
    </Badge>
  );
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
  // RETURNING PURCHASES PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Purchases</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track supplier orders and inventory intake
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
              placeholder="Search purchases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* ADD BUTTON */}
          <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editItem ? "Edit" : "Add"} Purchase
                </DialogTitle>
              </DialogHeader>
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* SUPPLIER INPUT */}
                <div>
                  <Label>Supplier</Label>
                  <Input
                    name="supplier"
                    defaultValue={editItem?.supplier}
                    required
                    className="mt-1"
                  />
                </div>
                {/* MILK INPUT */}
                <div>
                  <Label>Milk (L)</Label>
                  <Input
                    name="milk"
                    type="number"
                    step="0.5"
                    defaultValue={editItem?.milk || ""}
                    className="mt-1"
                  />
                </div>
                {/* COST INPUT */}
                <div>
                  <Label>Total Cost</Label>
                  <Input
                    name="cost"
                    type="number"
                    defaultValue={editItem?.cost || ""}
                    className="mt-1"
                  />
                </div>
                {/* SUBMIT */}
                <Button type="submit" className="w-full">
                  {editItem ? "Update" : "Add"} Purchase
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
                      : "bg-red-500/10 text-red-600 dark:text-red-400",
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
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
      {/* PURCHASES TABLE VIEW */}
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
                    Supplier
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Milk (L)
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Cost
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
                {/* PURCHASES */}
                {paginatedRecords.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{r.supplier}</td>
                    <td className="p-3">{r.milk}L</td>
                    <td className="p-3 font-semibold">
                      ₨{r.cost.toLocaleString()}
                    </td>
                    <td className="p-3">{statusBadge(r.status)}</td>
                    <td className="p-3 text-muted-foreground">{r.date}</td>
                    <td className="p-3">
                      {/* ACTIONS */}
                      <div className="flex gap-1">
                        {/* EDIT */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(r)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
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
                ))}
              </tbody>
            </table>
            {/* NO PURCHASES */}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No purchases found.
              </div>
            )}
          </div>
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* PURCHASES LIST VIEW */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* PURCHASES */}
          <div className="divide-y divide-border/50">
            {paginatedRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
              >
                {/* SUPPLIER AVATAR */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {r.supplier.charAt(0)}
                  </span>
                </div>
                {/* SUPPLIER INFO */}
                <div className="flex-1 min-w-0">
                  {/* SUPPLIER NAME & STATUS */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{r.supplier}</span>
                    {statusBadge(r.status)}
                  </div>
                  {/* SUPPLIER DETAILS */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {/* MILK */}
                    <span className="flex items-center gap-1">
                      <Milk className="w-3 h-3" />
                      {r.milk}L milk
                    </span>
                    {/* DATE */}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {r.date}
                    </span>
                  </div>
                </div>
                {/* COST */}
                <div className="text-right shrink-0">
                  <span className="font-display text-lg font-bold">
                    ₨{r.cost.toLocaleString()}
                  </span>
                </div>
                {/* ACTIONS */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* EDIT */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(r)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
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
            ))}
          </div>
          {/* NO PURCHASES */}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No purchases found.
            </div>
          )}
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* PURCHASES GRID VIEW */}
      {view === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* PURCHASES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {paginatedRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 flex flex-col hover:shadow-md transition-all group relative"
              >
                {/* SUPPLIER INFO */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* SUPPLIER ICON */}
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <Milk className="w-5 h-5 text-primary" />
                    </div>
                    {/* SUPPLIER NAME & DATE */}
                    <div>
                      <h3 className="font-semibold leading-tight">
                        {r.supplier}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.date}
                      </p>
                    </div>
                  </div>
                  {statusBadge(r.status)}
                </div>
                {/* MILK PURCHASED */}
                <div className="bg-muted/50 rounded-lg p-3 text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Milk Purchased
                  </p>
                  <p className="font-display text-lg font-bold">
                    {r.milk}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      L
                    </span>
                  </p>
                </div>
                {/* COST & ACTIONS */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                  {/* COST */}
                  <span className="font-display text-xl font-bold">
                    ₨{r.cost.toLocaleString()}
                  </span>
                  {/* ACTIONS */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* EDIT */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(r)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
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
              </motion.div>
            ))}
          </div>
          {/* NO PURCHASES */}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No purchases found.
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
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Purchases.displayName = "Purchases";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default memo(Purchases);
