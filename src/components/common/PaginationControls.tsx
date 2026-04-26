// <== IMPORTS ==>
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// <== PAGINATION CONTROLS PROPS INTERFACE ==>
interface PaginationControlsProps {
  // <== CURRENT PAGE ==>
  currentPage: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== ROWS PER PAGE ==>
  rowsPerPage: number;
  // <== TOTAL FILTERED RECORDS ==>
  totalFiltered: number;
  // <== START INDEX FOR DISPLAY ==>
  startIndex: number;
  // <== ON PAGE CHANGE HANDLER ==>
  onPageChange: (page: number) => void;
  // <== ON ROWS PER PAGE CHANGE HANDLER ==>
  onRowsPerPageChange: (value: string) => void;
}

// <== PAGINATION CONTROLS COMPONENT ==>
const PaginationControls = memo(
  ({
    currentPage,
    totalPages,
    rowsPerPage,
    totalFiltered,
    startIndex,
    onPageChange,
    onRowsPerPageChange,
  }: PaginationControlsProps) => {
    // RETURNING PAGINATION CONTROLS
    return (
      // PAGINATION CONTAINER
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
        {/* ROWS PER PAGE SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page:
          </span>
          {/* ROWS PER PAGE SELECT */}
          <Select
            value={rowsPerPage.toString()}
            onValueChange={onRowsPerPageChange}
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
        {/* PAGE NAVIGATION */}
        <div className="flex items-center gap-2">
          {/* RECORD COUNT */}
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {totalFiltered === 0
              ? "0–0"
              : `${startIndex + 1}–${Math.min(startIndex + rowsPerPage, totalFiltered)}`}{" "}
            of {totalFiltered}
          </span>
          {/* NAVIGATION BUTTONS */}
          <div className="flex gap-1">
            {/* PREVIOUS PAGE */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {/* NEXT PAGE */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PaginationControls.displayName = "PaginationControls";

// <== EXPORT ==>
export default PaginationControls;
