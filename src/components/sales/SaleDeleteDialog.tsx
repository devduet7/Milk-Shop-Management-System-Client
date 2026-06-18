// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { memo } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Sale } from "@/types/sale-types";
import { Button } from "@/components/ui/button";

// <== SALE DELETE DIALOG PROPS ==>
interface SaleDeleteDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== SALE RECORD TO DELETE ==>
  record: Sale | null;
  // <== PENDING DELETE STATE ==>
  isPending: boolean;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
  // <== CONFIRM DELETE HANDLER ==>
  onConfirm: () => void;
}

// <== SALE DELETE DIALOG COMPONENT ==>
const SaleDeleteDialog = memo(
  ({ open, record, isPending, onClose, onConfirm }: SaleDeleteDialogProps) => {
    // RETURNING DELETE CONFIRMATION DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !isPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-sm overflow-hidden gap-0">
          {/* FIXED DESTRUCTIVE GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* DESTRUCTIVE ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0 ring-1 ring-destructive/20 shadow-sm">
                <Trash2 className="w-[18px] h-[18px] text-destructive" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  Delete Sale
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* BODY — CONFIRMATION MESSAGE WITH RECORD SPECIFICS */}
          {record && (
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete this{" "}
                <span className="font-semibold text-foreground">
                  {record.quantity.toLocaleString()}
                  {record.productType === "milk" ? "L" : "kg"}{" "}
                  {record.productType === "milk" ? "Milk" : "Yoghurt"}
                </span>
                {record.customerName && (
                  <>
                    {" "}
                    sale for{" "}
                    <span className="font-semibold text-foreground">
                      {record.customerName}
                    </span>
                  </>
                )}{" "}
                from{" "}
                <span className="font-semibold text-foreground">
                  {record.date}
                </span>
                ?
              </p>
            </div>
          )}
          {/* FIXED FOOTER */}
          <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
            {/* CANCEL BUTTON */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4"
            >
              Cancel
            </Button>
            {/* CONFIRM DELETE BUTTON */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              disabled={isPending}
              className="h-9 px-4 gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SaleDeleteDialog.displayName = "SaleDeleteDialog";

// <== EXPORT ==>
export default SaleDeleteDialog;
