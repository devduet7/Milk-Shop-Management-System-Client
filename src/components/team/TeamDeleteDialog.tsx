// <== IMPORTS ==>
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { memo } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTeamUser } from "@/hooks/useTeam";
import type { TeamMember } from "@/types/team-types";

// <== TEAM DELETE DIALOG PROPS ==>
interface TeamDeleteDialogProps {
  // <== OPEN STATE ==>
  open: boolean;
  // <== TARGET TEAM MEMBER ==>
  member: TeamMember | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== TEAM DELETE DIALOG COMPONENT ==>
const TeamDeleteDialog = memo(
  ({ open, member, onClose }: TeamDeleteDialogProps) => {
    // DELETE USER MUTATION
    const deleteMutation = useDeleteTeamUser();
    // HANDLE CONFIRM DELETE
    const handleConfirm = (): void => {
      // GUARD: NO MEMBER STAGED
      if (!member) return;
      // FIRE DELETE MUTATION
      deleteMutation.mutate(member._id, {
        // ON SUCCESS
        onSuccess: (res) => {
          // SHOW SUCCESS TOAST WITH SERVER MESSAGE
          toast.success(res.message || "Account deleted.");
          // CLOSE DIALOG ON SUCCESS
          onClose();
        },
      });
    };
    // RENDERING DELETE CONFIRMATION DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ONLY ALLOW CLOSE WHEN NOT PENDING
          if (!v && !deleteMutation.isPending) onClose();
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
                  Delete Account
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* BODY — CONFIRMATION MESSAGE WITH MEMBER SPECIFICS */}
          {member && (
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {member.fullName}
                </span>
                's account? Their profile and all associated security codes will
                be removed.
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
              disabled={deleteMutation.isPending}
              className="h-9 px-4"
            >
              Cancel
            </Button>
            {/* CONFIRM DELETE BUTTON */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={deleteMutation.isPending}
              className="h-9 px-4 gap-1.5"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
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
TeamDeleteDialog.displayName = "TeamDeleteDialog";

// <== EXPORT ==>
export { TeamDeleteDialog };
