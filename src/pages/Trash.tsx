// <== IMPORTS ==>
import {
  List,
  Table2,
  LayoutGrid,
  type LucideIcon,
  Trash2 as TrashIcon,
} from "lucide-react";
import {
  useTrash,
  useEmptyTrash,
  useRestoreTrashItem,
  usePermanentlyDeleteTrashItem,
} from "@/hooks/useTrash";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getItemTitle } from "@/lib/trashUtils";
import { Skeleton } from "@/components/ui/skeleton";
import TrashListView from "@/components/trash/TrashListView";
import TrashGridView from "@/components/trash/TrashGridView";
import TrashTableView from "@/components/trash/TrashTableView";
import TrashEmptyDialog from "@/components/trash/TrashEmptyDialog";
import { PageTransition } from "@/components/layout/PageTransition";
import TrashDeleteDialog from "@/components/trash/TrashDeleteDialog";
import type { TrashCategory, TrashRecord } from "@/types/trash-types";
import { useState, useCallback, useEffect, useMemo, memo } from "react";

// <== TRASH VIEW MODE TYPE ==>
type TrashViewMode = "table" | "list" | "grid";

// <== LOCAL STORAGE KEY FOR PERSISTED VIEW MODE ==>
const VIEW_KEY = "trash_view";
// <== LOCAL STORAGE KEY FOR PERSISTED ROWS PER PAGE ==>
const ROWS_KEY = "trash_rows_per_page";

// <== VIEW MODE TYPE GUARD ==>
const isViewMode = (v: string | null): v is TrashViewMode =>
  v === "table" || v === "list" || v === "grid";

// <== GET INITIAL VIEW FROM LOCAL STORAGE ==>
const getInitialView = (): TrashViewMode => {
  // READ SAVED VALUE
  const saved = localStorage.getItem(VIEW_KEY);
  // RETURN SAVED MODE OR DEFAULT TO LIST
  return isViewMode(saved) ? saved : "list";
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
  mode: TrashViewMode;
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

// <== CATEGORY FILTER PILL CONFIG ==>
const CATEGORY_FILTERS: { value: TrashCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "QuickSale", label: "Quick Sales" },
  { value: "Sale", label: "Sales" },
  { value: "Customer", label: "Customers" },
  { value: "Expenditure", label: "Expenditures" },
  { value: "Purchase", label: "Purchases" },
  { value: "StaffMember", label: "Staff" },
];

// <== TABLE SKELETON ==>
const TableSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {[140, 140, 100, 80, 80].map((w, i) => (
              <th key={i} className="px-3 py-2.5">
                <Skeleton style={{ width: w, height: 12 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </td>
              <td className="px-3 py-3 hidden md:table-cell">
                <Skeleton className="h-4 w-36" />
              </td>
              <td className="px-3 py-3 hidden sm:table-cell">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// <== LIST SKELETON ==>
const ListSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="divide-y divide-border/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-3 sm:p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="flex gap-1 shrink-0">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// <== GRID SKELETON ==>
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="glass-card overflow-hidden">
        <div className="h-[3px] bg-muted/50" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-0.5">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// <== TRASH PAGE SKELETON ==>
const TrashPageSkeleton = ({ view }: { view: TrashViewMode }) => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      <Skeleton className="h-9 w-32 rounded-md" />
    </div>
    {/* CONTROLS ROW SKELETON */}
    <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex items-center bg-muted rounded-lg p-0.5">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </div>
    {/* VIEW-SPECIFIC SKELETON */}
    {view === "table" && <TableSkeleton />}
    {view === "list" && <ListSkeleton />}
    {view === "grid" && <GridSkeleton />}
  </div>
);

// <== TRASH PAGE COMPONENT ==>
const Trash = memo(() => {
  // ACTIVE CATEGORY FILTER STATE
  const [categoryFilter, setCategoryFilter] = useState<TrashCategory | "">("");
  // VIEW MODE STATE — INITIALISED FROM LOCAL STORAGE
  const [viewMode, setViewMode] = useState<TrashViewMode>(getInitialView);
  // CURRENT PAGE STATE
  const [currentPage, setCurrentPage] = useState<number>(1);
  // ROWS PER PAGE STATE — INITIALISED FROM LOCAL STORAGE
  const [rowsPerPage, setRowsPerPage] = useState<number>(getInitialRows);
  // EMPTY TRASH DIALOG OPEN STATE
  const [emptyDialogOpen, setEmptyDialogOpen] = useState<boolean>(false);
  // DELETE DIALOG OPEN STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // RECORD STAGED FOR PERMANENT DELETION
  const [deleteTarget, setDeleteTarget] = useState<TrashRecord | null>(null);
  // RESET TO PAGE 1 WHENEVER THE CATEGORY FILTER CHANGES
  useEffect(() => {
    // RESETTING CURRENT PAGE
    setCurrentPage(1);
  }, [categoryFilter]);
  // FETCHING TRASH RECORDS WITH ACTIVE FILTERS
  const { data, isLoading, isError } = useTrash({
    entityType: categoryFilter,
    page: currentPage,
    limit: rowsPerPage,
  });
  // USING THE RESTORE TRASH ITEM MUTATION
  const restoreMutation = useRestoreTrashItem();
  // USING THE PERMANENTLY DELETE TRASH ITEM MUTATION
  const deleteMutation = usePermanentlyDeleteTrashItem();
  // USING THE EMPTY TRASH MUTATION
  const emptyMutation = useEmptyTrash();
  // COMPUTED RECORDS WITH SAFE FALLBACK
  const records = useMemo(() => data?.records ?? [], [data?.records]);
  // TOTAL MATCHING RECORDS
  const totalFiltered = data?.pagination?.total ?? 0;
  // TOTAL PAGES
  const totalPages = data?.pagination?.totalPages ?? 1;
  // START INDEX FOR PAGINATION DISPLAY
  const startIndex = (currentPage - 1) * rowsPerPage;
  // SET AND PERSIST VIEW MODE TO LOCAL STORAGE
  const handleSetView = useCallback((mode: TrashViewMode): void => {
    // UPDATE VIEW MODE STATE
    setViewMode(mode);
    // PERSIST VIEW MODE TO LOCAL STORAGE
    localStorage.setItem(VIEW_KEY, mode);
  }, []);
  // HANDLE ROWS PER PAGE CHANGE
  const handleRowsChange = useCallback((value: string): void => {
    // PARSE NEW VALUE
    const parsed = Number.parseInt(value, 10);
    // FALLBACK IF INVALID
    const safe = Number.isNaN(parsed) || parsed <= 0 ? 20 : parsed;
    // UPDATE STATE
    setRowsPerPage(safe);
    // RESET TO FIRST PAGE
    setCurrentPage(1);
    // PERSIST TO LOCAL STORAGE
    localStorage.setItem(ROWS_KEY, String(safe));
  }, []);
  // HANDLE RESTORE
  const handleRestore = useCallback(
    (record: TrashRecord): void => {
      // CALL RESTORE MUTATION
      restoreMutation.mutate({
        trashId: record._id,
        entityType: record.entityType,
      });
    },
    [restoreMutation],
  );
  // OPEN DELETE CONFIRMATION DIALOG
  const handleDeleteOpen = useCallback((record: TrashRecord): void => {
    // STAGE RECORD
    setDeleteTarget(record);
    // OPEN DIALOG
    setDeleteDialogOpen(true);
  }, []);
  // CLOSE DELETE DIALOG — BLOCKED WHILE MUTATION IS PENDING
  const handleDeleteClose = useCallback((): void => {
    // BLOCK CLOSE WHILE PENDING
    if (deleteMutation.isPending) return;
    // CLOSE DIALOG AND CLEAR STAGED TARGET
    setDeleteDialogOpen(false);
    // CLEAR TARGET
    setDeleteTarget(null);
  }, [deleteMutation.isPending]);
  // CONFIRM PERMANENT DELETE
  const handleDeleteConfirm = useCallback((): void => {
    // GUARD: ENSURE A TARGET IS STAGED
    if (!deleteTarget) return;
    // CALL DELETE MUTATION
    deleteMutation.mutate(deleteTarget._id, {
      // ON SUCCESS
      onSuccess: () => {
        // CLOSE DIALOG AND CLEAR TARGET
        setDeleteDialogOpen(false);
        // CLEAR TARGET
        setDeleteTarget(null);
      },
    });
  }, [deleteTarget, deleteMutation]);
  // CLOSE EMPTY TRASH DIALOG — BLOCKED WHILE MUTATION IS PENDING
  const handleEmptyClose = useCallback((): void => {
    // BLOCK CLOSE WHILE PENDING
    if (emptyMutation.isPending) return;
    // CLOSE DIALOG
    setEmptyDialogOpen(false);
  }, [emptyMutation.isPending]);
  // CONFIRM EMPTY TRASH — SCOPED TO CURRENT CATEGORY FILTER
  const handleEmptyConfirm = useCallback((): void => {
    // CALL EMPTY MUTATION WITH CURRENT CATEGORY SCOPE
    emptyMutation.mutate(categoryFilter, {
      // ON SUCCESS
      onSuccess: () => setEmptyDialogOpen(false),
    });
  }, [categoryFilter, emptyMutation]);
  // LABEL FOR THE CURRENT EMPTY-TRASH SCOPE
  const scopeLabel = useMemo(
    (): string =>
      categoryFilter
        ? (CATEGORY_FILTERS.find((f) => f.value === categoryFilter)?.label ??
          "Trash")
        : "All Trash",
    [categoryFilter],
  );
  // WHETHER A RESTORE OR DELETE MUTATION IS CURRENTLY IN FLIGHT
  const isMutating = restoreMutation.isPending || deleteMutation.isPending;
  // SHARED VIEW PROPS OBJECT — SPREAD INTO ALL THREE VIEW COMPONENTS
  const viewProps = {
    records,
    totalFiltered,
    isLoading: isLoading && !!data,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: handleRowsChange,
    onRestore: handleRestore,
    onDelete: handleDeleteOpen,
    isMutating,
  };
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) {
    // RETURNING FULL PAGE SKELETON WITH CURRENT VIEW MODE
    return <TrashPageSkeleton view={viewMode} />;
  }
  // RETURNING TRASH PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <TrashIcon className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Trash
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Restore or permanently delete removed records
            </p>
          </div>
        </div>
        {/* EMPTY TRASH BUTTON — HIDDEN WHEN THE CURRENT SCOPE IS ALREADY EMPTY */}
        {totalFiltered > 0 && (
          <Button
            variant="outline"
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => setEmptyDialogOpen(true)}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Empty {scopeLabel}
          </Button>
        )}
      </div>
      {/* ERROR STATE */}
      {isError && (
        <div className="glass-card p-5 sm:p-6 text-center mb-5">
          <p className="text-sm text-muted-foreground">
            Failed to load trash. Please check your connection and try again.
          </p>
        </div>
      )}
      {/* CATEGORY FILTER PILLS + VIEW TOGGLE */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        {/* CATEGORY FILTER PILLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTERS.map(({ value, label }) => (
            <button
              key={value || "all"}
              onClick={() => setCategoryFilter(value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-colors",
                categoryFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
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
      {/* TABLE VIEW */}
      {viewMode === "table" && <TrashTableView {...viewProps} />}
      {/* LIST VIEW */}
      {viewMode === "list" && <TrashListView {...viewProps} />}
      {/* GRID VIEW */}
      {viewMode === "grid" && <TrashGridView {...viewProps} />}
      {/* PERMANENT DELETE CONFIRMATION DIALOG */}
      <TrashDeleteDialog
        open={deleteDialogOpen}
        record={deleteTarget}
        itemTitle={deleteTarget ? getItemTitle(deleteTarget) : ""}
        isPending={deleteMutation.isPending}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
      {/* EMPTY TRASH CONFIRMATION DIALOG */}
      <TrashEmptyDialog
        open={emptyDialogOpen}
        scopeLabel={scopeLabel}
        isPending={emptyMutation.isPending}
        onClose={handleEmptyClose}
        onConfirm={handleEmptyConfirm}
      />
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Trash.displayName = "Trash";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Trash;
