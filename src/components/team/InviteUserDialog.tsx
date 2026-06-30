// <== IMPORTS ==>
import {
  MODULE_KEYS,
  DEFAULT_PERMISSIONS,
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
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  inviteUserSchema,
  type InviteUserFormValues,
} from "@/validators/teamSchemas";
import { toast } from "sonner";
import { memo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useInviteUser } from "@/hooks/useTeam";
import { Loader2, UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { UserRole } from "@/stores/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

// <== INVITE USER DIALOG PROPS ==>
interface InviteUserDialogProps {
  // <== OPEN STATE ==>
  open: boolean;
  // <== ACTOR'S ROLE — DETERMINES WHICH ROLES CAN BE INVITED ==>
  actorRole: UserRole;
  // <== CLOSE HANDLER ==>
  onClose: () => void;
}

// <== INVITE USER DIALOG COMPONENT ==>
const InviteUserDialog = memo(
  ({ open, actorRole, onClose }: InviteUserDialogProps) => {
    // INVITE USER MUTATION
    const inviteMutation = useInviteUser();
    // FORM SETUP WITH ZOD VALIDATION
    const {
      register,
      handleSubmit,
      control,
      watch,
      reset,
      setValue,
      formState: { errors },
    } = useForm<InviteUserFormValues>({
      resolver: zodResolver(inviteUserSchema),
      mode: "onChange",
      defaultValues: {
        fullName: "",
        email: "",
        role: "user",
        permissions: { ...DEFAULT_PERMISSIONS },
      },
    });
    // WATCHING ROLE TO CONDITIONALLY SHOW PERMISSIONS MATRIX
    const selectedRole = watch("role");
    // RESET FULL FORM WHENEVER DIALOG OPENS
    useEffect(() => {
      // IF THE DIALOG IS OPEN
      if (open) {
        // RESET THE FORM WITH DEFAULT VALUES
        reset({
          fullName: "",
          email: "",
          role: "user",
          permissions: { ...DEFAULT_PERMISSIONS },
        });
      }
    }, [open, reset]);
    // RESET PERMISSIONS TO DEFAULTS WHENEVER ROLE CHANGES
    useEffect(() => {
      // RESETTING PERMISSIONS TO DEFAULTS ON ROLE CHANGE
      setValue("permissions", { ...DEFAULT_PERMISSIONS });
    }, [selectedRole, setValue]);
    // HANDLE FORM SUBMISSION
    const onSubmit = (data: InviteUserFormValues): void => {
      // CALL INVITE USER MUTATION — STRIP PERMISSIONS IF ROLE IS ADMIN
      inviteMutation.mutate(
        {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          permissions: data.role === "user" ? data.permissions : undefined,
        },
        {
          // ON SUCCESS
          onSuccess: (res) => {
            // SHOW SUCCESS TOAST WITH SERVER MESSAGE
            toast.success(res.message || "Invite sent successfully!");
            // CLOSE DIALOG ON SUCCESS
            onClose();
          },
        },
      );
    };
    // RETURNING INVITE USER DIALOG
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          // PREVENT CLOSE WHILE MUTATION IS PENDING
          if (!isOpen && !inviteMutation.isPending) onClose();
        }}
      >
        <DialogContent className="flex flex-col p-0 w-[calc(100vw-2rem)] sm:max-w-lg max-h-[92vh] overflow-hidden gap-0">
          {/* FIXED PRIMARY GRADIENT HEADER */}
          <div className="shrink-0 px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-start gap-3">
              {/* ICON BADGE */}
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20 shadow-sm">
                <UserPlus className="w-[18px] h-[18px] text-primary" />
              </div>
              {/* TITLE AND DESCRIPTION */}
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="font-display text-[15px] font-bold leading-tight text-left">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 text-left">
                  A setup code valid for 48 hours will be sent to their email
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
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4">
              {/* FULL NAME FIELD */}
              <div>
                <Label
                  htmlFor="invite-fullName"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="invite-fullName"
                  placeholder="e.g. Ahmed Abbas"
                  className="mt-1.5 h-10"
                  {...register("fullName")}
                  disabled={inviteMutation.isPending}
                />
                {errors.fullName && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              {/* EMAIL FIELD */}
              <div>
                <Label
                  htmlFor="invite-email"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="e.g. ahmed@example.com"
                  className="mt-1.5 h-10"
                  {...register("email")}
                  disabled={inviteMutation.isPending}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* ROLE FIELD */}
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Role
                </Label>
                <div className="mt-1.5">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={inviteMutation.isPending}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ADMIN OPTION — ONLY AVAILABLE TO SUPERADMIN */}
                          {actorRole === "superadmin" && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                          <SelectItem value="user">Team Member</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.role && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
              {/* PERMISSIONS MATRIX — ONLY VISIBLE FOR USER-TIER ROLE */}
              <AnimatePresence>
                {selectedRole === "user" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1">
                      {/* PERMISSIONS SECTION HEADER */}
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Module Permissions
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                        Configure what this team member can access.
                      </p>
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
                                  disabled={inviteMutation.isPending}
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
                        <p className="text-destructive text-xs mt-2">
                          {errors.permissions.message as string}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* FIXED FOOTER */}
            <div className="shrink-0 px-5 py-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
              {/* CANCEL BUTTON */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={inviteMutation.isPending}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                size="sm"
                disabled={inviteMutation.isPending}
                className="h-9 px-4 gap-1.5"
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invite"
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
InviteUserDialog.displayName = "InviteUserDialog";

// <== EXPORT ==>
export { InviteUserDialog };
