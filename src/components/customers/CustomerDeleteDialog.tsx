// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { memo } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/customer-types";

// <== CUSTOMER DELETE DIALOG PROPS ==>
interface CustomerDeleteDialogProps {
  // <== DIALOG OPEN STATE ==>
  open: boolean;
  // <== CUSTOMER RECORD TO DELETE ==>
  record: Customer | null;
  // <== PENDING DELETE STATE ==>
  isPending: boolean;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
  // <== CONFIRM DELETE HANDLER ==>
  onConfirm: () => void;
}

// <== CUSTOMER DELETE DIALOG COMPONENT ==>
const CustomerDeleteDialog = memo(
  ({
    open,
    record,
    isPending,
    onClose,
    onConfirm,
  }: CustomerDeleteDialogProps) => {
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
                  Delete Customer
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* BODY — CONFIRMATION MESSAGE WITH RECORD SPECIFICS */}
          {record && (
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {record.name}
                </span>
                ? Their delivery history and payment records will no longer be
                tracked.
              </p>
              {/* WARNING FOR ALL-TIME OUTSTANDING BALANCE */}
              {record.allTimeOutstanding > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    All-Time Outstanding Balance
                  </p>
                  <p className="font-display text-sm font-bold text-red-600 dark:text-red-400">
                    ₨{record.allTimeOutstanding.toLocaleString()}
                  </p>
                </div>
              )}
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
CustomerDeleteDialog.displayName = "CustomerDeleteDialog";

// <== EXPORT ==>
export default CustomerDeleteDialog;
