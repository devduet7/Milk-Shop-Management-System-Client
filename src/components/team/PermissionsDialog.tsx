// <== IMPORTS ==>
import {
  MODULE_KEYS,
  MODULE_DISPLAY_LABELS,
  PERMISSION_LEVEL_OPTIONS,
} from "@/types/team-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  updatePermissionsSchema,
  type UpdatePermissionsFormValues,
} from "@/validators/teamSchemas";
import { toast } from "sonner";
import { memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import type { TeamMember } from "@/types/team-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useUpdatePermissions } from "@/hooks/useTeam";

// <== PERMISSIONS DIALOG PROPS ==>
interface PermissionsDialogProps {
  // <== OPEN STATE ==>
  open: boolean;
  // <== TARGET TEAM MEMBER ==>
  member: TeamMember | null;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== PERMISSIONS DIALOG COMPONENT ==>
const PermissionsDialog = memo(
  ({ open, member, onClose }: PermissionsDialogProps) => {
    // UPDATE PERMISSIONS MUTATION
    const updateMutation = useUpdatePermissions();
    // FORM SETUP WITH ZOD VALIDATION
    const {
      handleSubmit,
      control,
      reset,
      formState: { errors },
    } = useForm<UpdatePermissionsFormValues>({
      resolver: zodResolver(updatePermissionsSchema),
      mode: "onChange",
    });
    // RESET FORM WITH CURRENT MEMBER PERMISSIONS WHENEVER DIALOG OPENS OR MEMBER CHANGES
    useEffect(() => {
      // IF DIALOG IS OPEN AND MEMBER HAS PERMISSIONS
      if (open && member?.permissions) {
        // RESET THE FORM WITH THE MEMBER'S CURRENT PERMISSIONS
        reset({ permissions: member.permissions });
      }
    }, [open, member, reset]);
    // HANDLE FORM SUBMISSION
    const onSubmit = (data: UpdatePermissionsFormValues): void => {
      // GUARD: NO MEMBER SELECTED
      if (!member) return;
      // PERFORM THE MUTATION TO UPDATE PERMISSIONS
      updateMutation.mutate(
        { id: member._id, permissions: data.permissions },
        {
          // ON SUCCESS
          onSuccess: (res) => {
            // SHOW SUCCESS TOAST WITH SERVER MESSAGE
            toast.success(res.message || "Permissions updated!");
            // CLOSE DIALOG ON SUCCESS
            onClose();
          },
        },
      );
    };
    // RENDERING PERMISSIONS DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          // PREVENT CLOSE WHILE MUTATION IS PENDING
          if (!isOpen && !updateMutation.isPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-lg max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <ShieldCheck className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  Edit Permissions
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  {member
                    ? `Configure module access for ${member.fullName}`
                    : "Configure module access"}
                </DialogDescription>
              </div>
            </div>
          </div>
          {/* FORM — FLEX COLUMN TO SUPPORT FIXED FOOTER */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* SCROLLABLE FORM BODY */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
              {/* PERMISSIONS MATRIX — ONE ROW PER MODULE */}
              <div className="border rounded-lg divide-y divide-border overflow-hidden">
                {MODULE_KEYS.map((moduleKey) => (
                  <div
                    key={moduleKey}
                    className="flex items-center justify-between px-3 py-2.5 bg-background"
                  >
                    {/* MODULE NAME */}
                    <span className="text-sm font-medium">
                      {MODULE_DISPLAY_LABELS[moduleKey]}
                    </span>
                    {/* PERMISSION LEVEL SELECT */}
                    <Controller
                      name={`permissions.${moduleKey}`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? "none"}
                          onValueChange={field.onChange}
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger className="w-[148px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PERMISSION_LEVEL_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                ))}
              </div>
              {/* PERMISSIONS ERROR */}
              {errors.permissions && (
                <p className="text-xs text-destructive mt-2">
                  {errors.permissions.message as string}
                </p>
              )}
            </div>
            {/* FIXED FOOTER */}
            <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
              {/* CANCEL BUTTON */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="h-9 px-4 gap-1.5"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Permissions"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PermissionsDialog.displayName = "PermissionsDialog";

// <== EXPORT ==>
export { PermissionsDialog };
