// <== IMPORTS ==>
import {
  Plus,
  Edit,
  List,
  Trash2,
  Table2,
  Search,
  Wallet,
  Receipt,
  Utensils,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  ShoppingBag,
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

// <== EXPENDITURE INTERFACE ==>
interface Expenditure {
  // <== ID ==>
  id: number;
  // <== TITLE ==>
  title: string;
  // <== CATEGORY ==>
  category: string;
  // <== AMOUNT ==>
  amount: number;
  // <== DATE ==>
  date: string;
  // <== NOTE ==>
  note: string;
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
  trend: "up" | "down" | "neutral";
};
// <== CATEGORY CONFIG TYPE ==>
type CategoryConfig = {
  // <== LABEL ==>
  label: string;
  // <== ICON ==>
  icon: LucideIcon;
  // <== COLOR ==>
  color: string;
};
// <== CATEGORY CONFIG ==>
const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // SUPPLIES CATEGORY
  supplies: {
    label: "Supplies",
    icon: ShoppingBag,
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  // MEALS CATEGORY
  meals: {
    label: "Meals",
    icon: Utensils,
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  // TRANSPORT CATEGORY
  transport: {
    label: "Transport",
    icon: Receipt,
    color:
      "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  // MISCELLANEOUS CATEGORY
  misc: {
    label: "Miscellaneous",
    icon: Receipt,
    color:
      "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};
// <== VIEW BUTTONS LIST ==>
const VIEW_BUTTONS: ViewButton[] = [
  { mode: "table", icon: Table2, label: "Table" },
  { mode: "list", icon: List, label: "List" },
  { mode: "grid", icon: LayoutGrid, label: "Grid" },
];
// <== TODAY'S DATE STRING ==>
const TODAY = new Date().toISOString().split("T")[0];
// <== INITIAL RECORDS ==>
const INITIAL_RECORDS: Expenditure[] = [
  {
    id: 1,
    title: "Shopping Bags (100 pcs)",
    category: "supplies",
    amount: 1500,
    date: "2026-03-08",
    note: "Large size bags",
  },
  {
    id: 2,
    title: "Employee Lunch",
    category: "meals",
    amount: 800,
    date: "2026-03-08",
    note: "3 employees",
  },
  {
    id: 3,
    title: "Delivery Fuel",
    category: "transport",
    amount: 2000,
    date: "2026-03-07",
    note: "Weekly fuel",
  },
  {
    id: 4,
    title: "Cleaning Supplies",
    category: "supplies",
    amount: 650,
    date: "2026-03-07",
    note: "Detergent & cloths",
  },
  {
    id: 5,
    title: "Employee Dinner",
    category: "meals",
    amount: 1200,
    date: "2026-03-06",
    note: "Overtime dinner",
  },
  {
    id: 6,
    title: "Bottle Caps",
    category: "supplies",
    amount: 3000,
    date: "2026-03-05",
    note: "500 caps",
  },
  {
    id: 7,
    title: "Repair - Cooler",
    category: "misc",
    amount: 4500,
    date: "2026-03-04",
    note: "Compressor fix",
  },
  {
    id: 8,
    title: "Stationery",
    category: "misc",
    amount: 350,
    date: "2026-03-03",
    note: "Notebooks & pens",
  },
];

// <== EXPENDITURES PAGE COMPONENT ==>
const Expenditures = memo(() => {
  // RECORDS STATE
  const [records, setRecords] = useState<Expenditure[]>(INITIAL_RECORDS);
  // SEARCH STATE
  const [search, setSearch] = useState<string>("");
  // DIALOG STATE
  const [open, setOpen] = useState<boolean>(false);
  // EDIT ITEM STATE
  const [editItem, setEditItem] = useState<Expenditure | null>(null);
  // VIEW MODE STATE
  const [view, setView] = useState<ViewMode>(() => {
    // VIEW MODE FROM LOCAL STORAGE
    return (localStorage.getItem("expenditures_view") as ViewMode) || "table";
  });
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    // RETRIEVE ROWS PER PAGE FROM LOCAL STORAGE
    return parseInt(localStorage.getItem("expenditures_rows_per_page") || "5");
  });
  // SET VIEW MODE HANDLER
  const setViewMode = useCallback((mode: ViewMode): void => {
    // SET VIEW MODE
    setView(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem("expenditures_view", mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = useCallback((value: string): void => {
    // SET ROWS PER PAGE
    setRowsPerPage(parseInt(value));
    // RESET CURRENT PAGE
    setCurrentPage(1);
    // PERSIST ROWS PER PAGE TO LOCAL STORAGE
    localStorage.setItem("expenditures_rows_per_page", value);
  }, []);
  // HANDLE DIALOG OPEN CHANGE
  const handleDialogOpenChange = useCallback((v: boolean): void => {
    // SET DIALOG STATE
    setOpen(v);
    // RESET EDIT ITEM ON CLOSE
    if (!v) setEditItem(null);
  }, []);
  // HANDLE EDIT ITEM
  const handleEdit = useCallback((record: Expenditure): void => {
    // SET EDIT ITEM
    setEditItem(record);
    // OPEN DIALOG
    setOpen(true);
  }, []);
  // FILTERED RECORDS
  const filtered = records.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  );
  // CALCULATE TOTAL PAGES
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  // CALCULATE START INDEX
  const startIndex = (currentPage - 1) * rowsPerPage;
  // CALCULATE PAGINATED RECORDS
  const paginatedRecords = filtered.slice(startIndex, startIndex + rowsPerPage);
  // TOTAL SPENT
  const totalSpent = records.reduce((a, r) => a + r.amount, 0);
  // TODAY'S RECORDS
  const todayRecords = records.filter((r) => r.date === TODAY);
  // TODAY'S SPENT
  const todaySpent = todayRecords.reduce((a, r) => a + r.amount, 0);
  // CALCULATE WEEKLY SPENDING (LAST 7 DAYS)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklySpent = records
    .filter((r) => new Date(r.date) >= oneWeekAgo)
    .reduce((a, r) => a + r.amount, 0);
  // SUPPLIES TOTAL
  const suppliesTotal = records
    .filter((r) => r.category === "supplies")
    .reduce((a, r) => a + r.amount, 0);
  // STATS
  const stats: Stat[] = [
    // TOTAL SPENT
    {
      label: "Total Spent",
      value: `₨${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      change: `${records.length} items`,
      trend: "neutral",
    },
    // TODAY
    {
      label: "Today",
      value: `₨${todaySpent.toLocaleString()}`,
      icon: Receipt,
      change: `${todayRecords.length} items`,
      trend: "down",
    },
    // THIS WEEK
    {
      label: "This Week",
      value: `₨${weeklySpent.toLocaleString()}`,
      icon: TrendingDown,
      change: "-8%",
      trend: "down",
    },
    // SUPPLIES
    {
      label: "Supplies",
      value: `₨${suppliesTotal.toLocaleString()}`,
      icon: ShoppingBag,
      change: `${((suppliesTotal / (totalSpent || 1)) * 100).toFixed(0)}%`,
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
      // PARSE AMOUNT FROM FORM DATA
      const amount = parseFloat(fd.get("amount") as string) || 0;
      // IF EDIT ITEM
      if (editItem) {
        // UPDATE RECORD
        setRecords((prev) =>
          prev.map((r) =>
            r.id === editItem.id
              ? {
                  ...r,
                  title: fd.get("title") as string,
                  category: fd.get("category") as string,
                  amount,
                  note: fd.get("note") as string,
                }
              : r,
          ),
        );
        // SUCCESS TOAST
        toast.success("Expenditure updated!");
      } else {
        // ADD RECORD
        setRecords((prev) => [
          {
            id: Date.now(),
            title: fd.get("title") as string,
            category: fd.get("category") as string,
            amount,
            date: TODAY,
            note: fd.get("note") as string,
          },
          ...prev,
        ]);
        // SUCCESS TOAST
        toast.success("Expenditure added!");
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
  // CATEGORY BADGE
  const categoryBadge = (category: string) => {
    // GET CATEGORY CONFIG
    const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.misc;
    // RETURNING CATEGORY BADGE
    return (
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] font-bold tracking-wider uppercase",
          config.color,
        )}
      >
        {config.label}
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
          {filtered.length > 0 ? startIndex + 1 : 0}-
          {Math.min(startIndex + rowsPerPage, filtered.length)} of{" "}
          {filtered.length}
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
  // RETURNING EXPENDITURES PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Expenditures</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track daily expenses and miscellaneous spending
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
              placeholder="Search expenditures..."
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
                  {editItem ? "Edit" : "Add"} Expenditure
                </DialogTitle>
              </DialogHeader>
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* TITLE INPUT */}
                <div>
                  <Label>Title</Label>
                  <Input
                    name="title"
                    defaultValue={editItem?.title}
                    required
                    className="mt-1"
                    placeholder="e.g. Shopping Bags"
                  />
                </div>
                {/* CATEGORY SELECT */}
                <div>
                  <Label>Category</Label>
                  <Select
                    name="category"
                    defaultValue={editItem?.category || "supplies"}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="misc">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* AMOUNT INPUT */}
                <div>
                  <Label>Amount (₨)</Label>
                  <Input
                    name="amount"
                    type="number"
                    defaultValue={editItem?.amount || ""}
                    required
                    className="mt-1"
                  />
                </div>
                {/* NOTE INPUT */}
                <div>
                  <Label>Note</Label>
                  <Input
                    name="note"
                    defaultValue={editItem?.note}
                    className="mt-1"
                    placeholder="Optional details"
                  />
                </div>
                {/* SUBMIT */}
                <Button type="submit" className="w-full">
                  {editItem ? "Update" : "Add"} Expenditure
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
                  {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {stat.trend === "down" && (
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
      {/* EXPENDITURES TABLE VIEW */}
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
                    Title
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Note
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* TABLE BODY */}
              <tbody>
                {/* EXPENDITURES */}
                {paginatedRecords.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{r.title}</td>
                    <td className="p-3">{categoryBadge(r.category)}</td>
                    <td className="p-3 font-semibold">
                      ₨{r.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-muted-foreground">{r.date}</td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[150px] truncate">
                      {r.note}
                    </td>
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
            {/* NO EXPENDITURES */}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No expenditures found.
              </div>
            )}
          </div>
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* EXPENDITURES LIST VIEW */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* EXPENDITURES */}
          <div className="divide-y divide-border/50">
            {paginatedRecords.map((r, i) => {
              // GET CATEGORY CONFIG
              const config =
                CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.misc;
              // CATEGORY ICON
              const CatIcon = config.icon;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* CATEGORY ICON */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CatIcon className="w-4 h-4 text-primary" />
                  </div>
                  {/* EXPENDITURE INFO */}
                  <div className="flex-1 min-w-0">
                    {/* TITLE & CATEGORY */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{r.title}</span>
                      {categoryBadge(r.category)}
                    </div>
                    {/* DATE & NOTE */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{r.date}</span>
                      {r.note && (
                        <span className="truncate max-w-[200px]">{r.note}</span>
                      )}
                    </div>
                  </div>
                  {/* AMOUNT */}
                  <div className="text-right shrink-0">
                    <span className="font-display text-lg font-bold">
                      ₨{r.amount.toLocaleString()}
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
              );
            })}
          </div>
          {/* NO EXPENDITURES */}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No expenditures found.
            </div>
          )}
          {/* PAGINATION */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* EXPENDITURES GRID VIEW */}
      {view === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* EXPENDITURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {paginatedRecords.map((r, i) => {
              // GET CATEGORY CONFIG
              const config =
                CATEGORY_CONFIG[r.category] ?? CATEGORY_CONFIG.misc;
              // CATEGORY ICON
              const CatIcon = config.icon;
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-5 flex flex-col hover:shadow-md transition-all group relative"
                >
                  {/* EXPENDITURE INFO */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* CATEGORY ICON */}
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <CatIcon className="w-5 h-5 text-primary" />
                      </div>
                      {/* TITLE & DATE */}
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {r.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.date}
                        </p>
                      </div>
                    </div>
                    {categoryBadge(r.category)}
                  </div>
                  {/* NOTE */}
                  {r.note && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-muted-foreground">{r.note}</p>
                    </div>
                  )}
                  {/* AMOUNT & ACTIONS */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                    {/* AMOUNT */}
                    <span className="font-display text-xl font-bold">
                      ₨{r.amount.toLocaleString()}
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
              );
            })}
          </div>
          {/* NO EXPENDITURES */}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              No expenditures found.
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
Expenditures.displayName = "Expenditures";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Expenditures;
