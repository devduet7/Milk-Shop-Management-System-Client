// <== IMPORTS ==>
import {
  format,
  isSameDay,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  Eye,
  Plus,
  List,
  Edit,
  Milk,
  Users,
  Phone,
  Search,
  Trash2,
  Table2,
  MapPin,
  XCircle,
  DollarSign,
  LayoutGrid,
  TrendingUp,
  ChevronLeft,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { memo, useState, type FormEvent } from "react";
import { PageTransition } from "@/components/PageTransition";

// <== DAILY RECORD INTERFACE ==>
interface DailyRecord {
  // <== DATE ==>
  date: string;
  // <== MILK ==>
  milk: number;
  // <== DELIVERED ==>
  delivered: boolean;
}
// <== CUSTOMER INTERFACE ==>
interface Customer {
  // <== ID ==>
  id: number;
  // <== NAME ==>
  name: string;
  // <== PHONE ==>
  phone: string;
  // <== ADDRESS ==>
  address: string;
  // <== DAILY MILK ==>
  dailyMilk: number;
  // <== PRICE PER LITER ==>
  pricePerLiter: number;
  // <== DAILY RECORDS ==>
  dailyRecords: DailyRecord[];
  // <== TOTAL PAID ==>
  totalPaid: number;
  // <== CREATED AT ==>
  createdAt: string;
}
// <== VIEW MODE TYPE ==>
type ViewMode = "table" | "list" | "grid";
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
// <== VIEW BUTTON TYPE ==>
type ViewButton = {
  // <== MODE ==>
  mode: ViewMode;
  // <== ICON ==>
  icon: LucideIcon;
  // <== LABEL ==>
  label: string;
};
// <== INITIAL VIEW MODE HELPER ==>
const isViewMode = (value: string | null): value is ViewMode => {
  // CHECK IF VALUE IS VALID
  return value === "table" || value === "list" || value === "grid";
};
// <== GET INITIAL VIEW MODE ==>
const getInitialViewMode = (): ViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("customers_view");
  // RETURN SAVED MODE OR DEFAULT
  return isViewMode(saved) ? saved : "table";
};
// <== GET INITIAL ROWS PER PAGE ==>
const getInitialRowsPerPage = (): number => {
  // READ SAVED VALUE
  const saved = localStorage.getItem("customers_rows_per_page");
  // PARSE VALUE
  const parsed = Number.parseInt(saved ?? "5", 10);
  // FALLBACK IF INVALID
  if (Number.isNaN(parsed) || parsed <= 0) {
    // RETURN DEFAULT
    return 5;
  }
  // RETURN PARSED
  return parsed;
};

// <== CUSTOMERS PAGE COMPONENT ==>
const Customers = memo(() => {
  // GETTING CURRENT MONTH
  const currentMonth = new Date();
  // SELECTED MONTH STATE
  const [selectedMonth, setSelectedMonth] = useState<Date>(currentMonth);
  // CUSTOMERS STATE
  const [records, setRecords] = useState<Customer[]>([
    {
      id: 1,
      name: "Ahmed Khan",
      phone: "0300-1234567",
      address: "House 12, Block A, Gulberg",
      dailyMilk: 2,
      pricePerLiter: 180,
      dailyRecords: [
        { date: "2026-03-01", milk: 2, delivered: true },
        { date: "2026-03-02", milk: 2, delivered: true },
        { date: "2026-03-03", milk: 0, delivered: false },
        { date: "2026-03-04", milk: 2, delivered: true },
        { date: "2026-03-05", milk: 2, delivered: true },
        { date: "2026-03-06", milk: 2, delivered: true },
        { date: "2026-03-07", milk: 2, delivered: true },
        { date: "2026-03-08", milk: 2, delivered: true },
      ],
      totalPaid: 2000,
      createdAt: "2026-01-15",
    },
    {
      id: 2,
      name: "Fatima Ali",
      phone: "0321-9876543",
      address: "Flat 5, Sunset Apartments",
      dailyMilk: 1.5,
      pricePerLiter: 180,
      dailyRecords: [
        { date: "2026-03-01", milk: 1.5, delivered: true },
        { date: "2026-03-02", milk: 1.5, delivered: true },
        { date: "2026-03-03", milk: 1.5, delivered: true },
        { date: "2026-03-04", milk: 0, delivered: false },
        { date: "2026-03-05", milk: 1.5, delivered: true },
        { date: "2026-03-06", milk: 1.5, delivered: true },
        { date: "2026-03-07", milk: 0, delivered: false },
        { date: "2026-03-08", milk: 1.5, delivered: true },
      ],
      totalPaid: 1500,
      createdAt: "2026-02-01",
    },
    {
      id: 3,
      name: "Bilal Hussain",
      phone: "0333-5551234",
      address: "Shop 3, Main Market",
      dailyMilk: 5,
      pricePerLiter: 175,
      dailyRecords: [
        { date: "2026-03-01", milk: 5, delivered: true },
        { date: "2026-03-02", milk: 5, delivered: true },
        { date: "2026-03-03", milk: 5, delivered: true },
        { date: "2026-03-04", milk: 5, delivered: true },
        { date: "2026-03-05", milk: 5, delivered: true },
        { date: "2026-03-06", milk: 5, delivered: true },
        { date: "2026-03-07", milk: 5, delivered: true },
        { date: "2026-03-08", milk: 5, delivered: true },
      ],
      totalPaid: 5000,
      createdAt: "2026-01-01",
    },
  ]);
  // SEARCH STATE
  const [search, setSearch] = useState<string>("");
  // OPEN STATE
  const [open, setOpen] = useState<boolean>(false);
  // EDIT STATE
  const [editItem, setEditItem] = useState<Customer | null>(null);
  // DETAIL STATE
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  // VIEW STATE
  const [view, setView] = useState<ViewMode>(() => {
    // GET VIEW FROM LOCAL STORAGE
    return getInitialViewMode();
  });
  // CURRENT PAGE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    // GET ROWS PER PAGE FROM LOCAL STORAGE
    return getInitialRowsPerPage();
  });
  // SET VIEW MODE
  const setViewMode = (mode: ViewMode) => {
    // UPDATE VIEW
    setView(mode);
    // UPDATE LOCAL STORAGE
    localStorage.setItem("customers_view", mode);
  };
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsPerPageChange = (value: string) => {
    // PARSE NEW VALUE
    const newValue = Number.parseInt(value, 10);
    // SANITIZE VALUE
    const safeValue = Number.isNaN(newValue) || newValue <= 0 ? 5 : newValue;
    // UPDATE ROWS PER PAGE
    setRowsPerPage(safeValue);
    // UPDATE CURRENT PAGE
    setCurrentPage(1);
    // UPDATE LOCAL STORAGE
    localStorage.setItem("customers_rows_per_page", String(safeValue));
  };
  // FILTERED RECORDS
  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search),
  );
  // CALCULATE TOTAL PAGES
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  // CALCULATE START INDEX
  const startIndex = (currentPage - 1) * rowsPerPage;
  // CALCULATE PAGINATED RECORDS
  const paginatedRecords = filtered.slice(startIndex, startIndex + rowsPerPage);
  // CALCULATE CUSTOMER TOTAL
  const totalCustomers = records.length;
  // CALCULATE CUSTOMER TOTAL DUE
  const calculateCustomerTotal = (customer: Customer) => {
    // FILTER MONTH RECORDS
    const monthRecords = customer.dailyRecords.filter((d) => {
      // GET SELECTED MONTH
      const date = new Date(d.date);
      // GET CURRENT MONTH
      return (
        date.getMonth() === selectedMonth.getMonth() &&
        date.getFullYear() === selectedMonth.getFullYear()
      );
    });
    // CALCULATE TOTAL
    return (
      monthRecords.reduce((sum, d) => sum + d.milk, 0) * customer.pricePerLiter
    );
  };
  // CALCULATE CUSTOMER PENDING
  const calculateCustomerPending = (customer: Customer) => {
    // CALCULATE PENDING
    return Math.max(0, calculateCustomerTotal(customer) - customer.totalPaid);
  };
  // SUMMARY VALUES
  const totalDue = records.reduce(
    (sum, c) => sum + calculateCustomerTotal(c),
    0,
  );
  // TOTAL PAID
  const totalReceived = records.reduce((sum, c) => sum + c.totalPaid, 0);
  // TOTAL PENDING
  const totalPending = records.reduce(
    (sum, c) => sum + calculateCustomerPending(c),
    0,
  );
  // HANDLE FORM SUBMIT
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // PREVENT DEFAULT
    e.preventDefault();
    // GET FORM DATA
    const fd = new FormData(e.currentTarget);
    // PARSE DAILY MILK DATA
    const dailyMilk = Number.parseFloat(String(fd.get("dailyMilk"))) || 0;
    // PARSE PRICE PER LITER
    const pricePerLiter =
      Number.parseFloat(String(fd.get("pricePerLiter"))) || 180;
    // PARSE NAME
    const name = String(fd.get("name") ?? "");
    // PARSE PHONE
    const phone = String(fd.get("phone") ?? "");
    // PARSE ADDRESS
    const address = String(fd.get("address") ?? "");
    // CHECK IF EDIT
    if (editItem) {
      // UPDATE EXISTING CUSTOMER
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editItem.id
            ? {
                ...r,
                name,
                phone,
                address,
                dailyMilk,
                pricePerLiter,
              }
            : r,
        ),
      );
      // TOAST SUCCESS MESSAGE
      toast.success("Customer updated!");
    } else {
      // ADD NEW CUSTOMER
      setRecords((prev) => [
        {
          id: Date.now(),
          name,
          phone,
          address,
          dailyMilk,
          pricePerLiter,
          dailyRecords: [],
          totalPaid: 0,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      // TOAST SUCCESS MESSAGE
      toast.success("Customer added!");
    }
    // CLOSE MODAL
    setOpen(false);
    // RESET FORM
    setEditItem(null);
  };
  // HANDLE DELETE HANDLER
  const handleDelete = (id: number) => {
    // DELETE CUSTOMER
    setRecords((prev) => prev.filter((r) => r.id !== id));
    // TOAST SUCCESS MESSAGE
    toast.success("Customer deleted!");
  };
  // HANDLE TOGGLE DELIVERY
  const handleToggleDelivery = (customerId: number, date: string) => {
    // TOGGLE DELIVERY
    setRecords((prev) =>
      prev.map((c) => {
        // CHECK IF CUSTOMER
        if (c.id !== customerId) return c;
        // CHECK IF RECORD EXISTS
        const existingIndex = c.dailyRecords.findIndex((d) => d.date === date);
        // IF EXISTS TOGGLE
        if (existingIndex >= 0) {
          // TOGGLE DELIVERY STATUS
          const updated = [...c.dailyRecords];
          // UPDATE DELIVERY STATUS
          updated[existingIndex] = {
            ...updated[existingIndex],
            delivered: !updated[existingIndex].delivered,
            milk: updated[existingIndex].delivered ? 0 : c.dailyMilk,
          };
          // RETURN UPDATED CUSTOMER
          return { ...c, dailyRecords: updated };
        }
        // ADD NEW RECORD
        return {
          ...c,
          dailyRecords: [
            ...c.dailyRecords,
            { date, milk: c.dailyMilk, delivered: true },
          ],
        };
      }),
    );
  };
  // HANDLE ADD PAYMENT
  const handleAddPayment = (customerId: number, amount: number) => {
    // ADD PAYMENT
    setRecords((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, totalPaid: c.totalPaid + amount } : c,
      ),
    );
    // TOAST SUCCESS
    toast.success(`Payment of ₨${amount.toLocaleString()} recorded!`);
  };
  // VIEW BUTTONS
  const viewButtons: ViewButton[] = [
    // TABLE VIEW
    { mode: "table", icon: Table2, label: "Table" },
    // LIST VIEW
    { mode: "list", icon: List, label: "List" },
    // GRID VIEW
    { mode: "grid", icon: LayoutGrid, label: "Grid" },
  ];
  // STATS
  const stats: Stat[] = [
    // TOTAL CUSTOMERS
    {
      label: "Total Customers",
      value: totalCustomers.toString(),
      icon: Users,
      change: "+2",
      trend: "up",
    },
    // MONTHLY DUE
    {
      label: "Monthly Due",
      value: `₨${totalDue.toLocaleString()}`,
      icon: DollarSign,
      change: "+12%",
      trend: "up",
    },
    // RECEIVED
    {
      label: "Received",
      value: `₨${totalReceived.toLocaleString()}`,
      icon: CheckCircle2,
      change: "+8%",
      trend: "up",
    },
    // PENDING
    {
      label: "Pending",
      value: `₨${totalPending.toLocaleString()}`,
      icon: XCircle,
      change: "-5%",
      trend: "down",
    },
  ];
  // MONTH DAYS
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });
  // GET DELIVERY STATUS HANDLER
  const getDeliveryStatus = (customer: Customer, date: Date) => {
    // FORMAT DATE
    const dateStr = format(date, "yyyy-MM-dd");
    // GET RECORD
    const record = customer.dailyRecords.find((d) => d.date === dateStr);
    // IF NO RECORD FOUND
    if (!record) return null;
    // RETURN DELIVERY STATUS
    return record.delivered;
  };
  // PAGINATION CONTROLS
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page:</span>
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
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "0-0"
            : `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, filtered.length)}`}{" "}
          of {filtered.length}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
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
  // RETURNING CUSTOMERS PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <PageTransition className="page-container">
      {/* CONTENT CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          {/* ICON */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          {/* TITLE & DESCRIPTION */}
          <div>
            <h1 className="font-display text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage customers and track daily milk deliveries
            </p>
          </div>
        </div>
        {/* ACTIONS CONTAINER */}
        <div className="flex items-center gap-2">
          {/* VIEW TOGGLE */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {viewButtons.map(({ mode, icon: Icon, label }) => (
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
          {/* SEARCH FIELD */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* ADD CUSTOMER DIALOG */}
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditItem(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editItem ? "Edit" : "Add"} Customer
                </DialogTitle>
              </DialogHeader>
              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* NAME FIELD */}
                <div>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    defaultValue={editItem?.name}
                    required
                    className="mt-1"
                  />
                </div>
                {/* PHONE FIELD */}
                <div>
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    defaultValue={editItem?.phone}
                    className="mt-1"
                  />
                </div>
                {/* ADDRESS FIELD */}
                <div>
                  <Label>Address</Label>
                  <Input
                    name="address"
                    defaultValue={editItem?.address}
                    className="mt-1"
                  />
                </div>
                {/* MILK AND RATE GRID */}
                <div className="grid grid-cols-2 gap-3">
                  {/* DAILY MILK */}
                  <div>
                    <Label>Daily Milk (L)</Label>
                    <Input
                      name="dailyMilk"
                      type="number"
                      step="0.5"
                      defaultValue={editItem?.dailyMilk || 1}
                      className="mt-1"
                    />
                  </div>
                  {/* PRICE PER LITER */}
                  <div>
                    <Label>Price/Liter (₨)</Label>
                    <Input
                      name="pricePerLiter"
                      type="number"
                      defaultValue={editItem?.pricePerLiter || 180}
                      className="mt-1"
                    />
                  </div>
                </div>
                {/* SUBMIT */}
                <Button type="submit" className="w-full">
                  {editItem ? "Update" : "Add"} Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* STATS CARDS */}
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
      {/* TABLE VIEW */}
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
              {/* TABLE HEAD */}
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Contact
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Daily Milk
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Monthly Total
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Paid
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Pending
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* TABLE BODY */}
              <tbody>
                {paginatedRecords.map((c, i) => {
                  // CALCULATE MONTHLY TOTAL
                  const monthlyTotal = calculateCustomerTotal(c);
                  // CALCULATE PENDING
                  const pending = calculateCustomerPending(c);
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {c.address}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.phone}</td>
                      <td className="p-3">{c.dailyMilk}L</td>
                      <td className="p-3">₨{c.pricePerLiter}/L</td>
                      <td className="p-3 font-semibold">
                        ₨{monthlyTotal.toLocaleString()}
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400">
                        ₨{c.totalPaid.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={pending > 0 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          ₨{pending.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {/* ACTIONS */}
                        <div className="flex gap-1">
                          {/* DETAILS BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDetailCustomer(c)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {/* EDIT BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditItem(c);
                              setOpen(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {/* DELETE BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(c.id)}
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
            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No customers found.
              </div>
            )}
          </div>
          {/* PAGINATION CONTROLS */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* LIST VIEW */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* CUSTOMER LIST */}
          <div className="divide-y divide-border/50">
            {paginatedRecords.map((c, i) => {
              // CALCULATE MONTHLY TOTAL
              const monthlyTotal = calculateCustomerTotal(c);
              // CALCULATE PENDING
              const pending = calculateCustomerPending(c);
              // RETURNING CUSTOMER CARD
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {c.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{c.name}</span>
                      <Badge
                        variant={pending > 0 ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {pending > 0
                          ? `₨${pending.toLocaleString()} DUE`
                          : "PAID"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {c.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Milk className="w-3 h-3" />
                        {c.dailyMilk}L/day
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {c.address}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-bold">
                      ₨{monthlyTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* DETAILS */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDetailCustomer(c)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {/* EDIT */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditItem(c);
                        setOpen(true);
                      }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {/* DELETE */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No customers found.
            </div>
          )}
          {/* PAGINATION CONTROLS */}
          {filtered.length > 0 && <PaginationControls />}
        </motion.div>
      )}
      {/* GRID VIEW */}
      {view === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* CUSTOMER GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {paginatedRecords.map((c, i) => {
              // CALCULATE MONTHLY TOTAL
              const monthlyTotal = calculateCustomerTotal(c);
              // CALCULATE PENDING
              const pending = calculateCustomerPending(c);
              // CALCULATE DELIVERED
              const deliveredDays = c.dailyRecords.filter((d) => {
                // GET TODAY DATE
                const date = new Date(d.date);
                // CHECK IF DELIVERED
                return (
                  d.delivered && date.getMonth() === selectedMonth.getMonth()
                );
              }).length;
              // RETURNING CUSTOMER CARD
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-5 flex flex-col hover:shadow-md transition-all group relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {c.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.phone}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={pending > 0 ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {pending > 0 ? "DUE" : "PAID"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Daily
                      </p>
                      <p className="font-display text-lg font-bold">
                        {c.dailyMilk}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          L
                        </span>
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Days
                      </p>
                      <p className="font-display text-lg font-bold">
                        {deliveredDays}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          delivered
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Due</span>
                      <span className="font-semibold">
                        ₨{monthlyTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ₨{c.totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        ₨{pending.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.address.slice(0, 20)}...
                    </span>
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* VIEW */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDetailCustomer(c)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {/* EDIT */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditItem(c);
                          setOpen(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {/* DELETE */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* EMPTY STATE */}
          {filtered.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground col-span-full">
              No customers found.
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
      {/* CUSTOMER DETAIL DIALOG */}
      <Dialog
        open={!!detailCustomer}
        onOpenChange={(v) => !v && setDetailCustomer(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {detailCustomer.name.charAt(0)}
                    </span>
                  </div>
                  {detailCustomer.name}
                </DialogTitle>
              </DialogHeader>
              {/* MONTH NAVIGATION */}
              <div className="flex items-center justify-between py-2">
                {/* PREV MONTH */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedMonth(
                      new Date(
                        selectedMonth.getFullYear(),
                        selectedMonth.getMonth() - 1,
                      ),
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {/* SELECTED MONTH */}
                <span className="font-medium">
                  {format(selectedMonth, "MMMM yyyy")}
                </span>
                {/* NEXT MONTH */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedMonth(
                      new Date(
                        selectedMonth.getFullYear(),
                        selectedMonth.getMonth() + 1,
                      ),
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {/* CALENDAR GRID */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-1"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {/* EMPTY CELLS FOR DAYS BEFORE MONTH START */}
                  {Array.from({
                    length: startOfMonth(selectedMonth).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {daysInMonth.map((date) => {
                    // FORMATTED DATE
                    const dateStr = format(date, "yyyy-MM-dd");
                    // DELIVERY STATUS
                    const status = getDeliveryStatus(detailCustomer, date);
                    // IS CURRENT DAY
                    const isToday = isSameDay(date, new Date());
                    // IS FUTURE
                    const isFuture = date > new Date();
                    // RETURN
                    return (
                      <button
                        key={dateStr}
                        onClick={() =>
                          !isFuture &&
                          handleToggleDelivery(detailCustomer.id, dateStr)
                        }
                        disabled={isFuture}
                        className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                          isFuture && "opacity-40 cursor-not-allowed",
                          !isFuture && "hover:ring-2 hover:ring-primary/50",
                          isToday && "ring-2 ring-primary",
                          status === true &&
                            "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                          status === false &&
                            "bg-red-500/20 text-red-700 dark:text-red-300",
                          status === null &&
                            !isFuture &&
                            "bg-muted hover:bg-muted/80",
                        )}
                      >
                        <span className="font-medium">{format(date, "d")}</span>
                        {status === true && (
                          <CheckCircle2 className="w-3 h-3 mt-0.5" />
                        )}
                        {status === false && (
                          <XCircle className="w-3 h-3 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-500/20" />{" "}
                    Delivered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-500/20" /> Missed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-muted" /> Not marked
                  </span>
                </div>
              </div>
              {/* SUMMARY */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Due</p>
                  <p className="font-display text-lg font-bold">
                    ₨{calculateCustomerTotal(detailCustomer).toLocaleString()}
                  </p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₨{detailCustomer.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-display text-lg font-bold text-red-600 dark:text-red-400">
                    ₨{calculateCustomerPending(detailCustomer).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* ADD PAYMENT */}
              <div className="flex gap-2 mt-4">
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="Enter payment amount"
                  className="flex-1"
                />
                {/* ADD PAYMENT */}
                <Button
                  onClick={() => {
                    // GET PAYMENT INPUT
                    const input = document.getElementById(
                      "paymentAmount",
                    ) as HTMLInputElement | null;
                    // PARSE AMOUNT
                    const amount = Number.parseFloat(input?.value ?? "");
                    // IF AMOUNT IS VALID
                    if (amount > 0) {
                      // ADD PAYMENT
                      handleAddPayment(detailCustomer.id, amount);
                      // IF INPUT NOT EMPTY
                      if (input) {
                        // CLEAR INPUT
                        input.value = "";
                      }
                      // UPDATE TOTAL PAID
                      setDetailCustomer((prev) =>
                        prev
                          ? { ...prev, totalPaid: prev.totalPaid + amount }
                          : null,
                      );
                    }
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-1" /> Add Payment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Customers.displayName = "Customers";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Customers;
