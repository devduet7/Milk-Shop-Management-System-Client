// <== IMPORTS ==>
import {
  forwardRef,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// <== TABLE COMPONENT ==>
const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  ),
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
Table.displayName = "Table";

// <== TABLE HEADER COMPONENT ==>
const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableHeader.displayName = "TableHeader";

// <== TABLE BODY COMPONENT ==>
const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableBody.displayName = "TableBody";

// <== TABLE FOOTER COMPONENT ==>
const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableFooter.displayName = "TableFooter";

// <== TABLE ROW COMPONENT ==>
const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50",
      className,
    )}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableRow.displayName = "TableRow";

// <== TABLE HEAD COMPONENT ==>
const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableHead.displayName = "TableHead";

// <== TABLE CELL COMPONENT ==>
const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableCell.displayName = "TableCell";

// <== TABLE CAPTION COMPONENT ==>
const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
// <== DISPLAY NAME FOR DEVTOOLS ==>
TableCaption.displayName = "TableCaption";

// <== EXPORTS ==>
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
