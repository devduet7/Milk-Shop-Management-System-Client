// <== IMPORTS ==>
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/settings-types";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { memo, useRef, useState, useCallback } from "react";
import { useUploadAvatar, useDeleteAvatar } from "@/hooks/useSettings";

// <== ALLOWED FILE TYPES ==>
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// <== MAX FILE SIZE: 5MB ==>
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// <== AVATAR UPLOAD PROPS ==>
interface AvatarUploadProps {
  // <== CURRENT PROFILE ==>
  profile: UserProfile | undefined;
}

// <== AVATAR UPLOAD COMPONENT ==>
const AvatarUpload = memo(({ profile }: AvatarUploadProps) => {
  // FILE INPUT REF — TRIGGERS HIDDEN FILE PICKER
  const fileInputRef = useRef<HTMLInputElement>(null);
  // DELETE CONFIRMATION VISIBLE STATE
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  // UPLOAD MUTATION
  const uploadMutation = useUploadAvatar();
  // DELETE MUTATION
  const deleteMutation = useDeleteAvatar();
  // COMBINED PENDING STATE
  const isPending = uploadMutation.isPending || deleteMutation.isPending;
  // CURRENT AVATAR URL
  const avatarUrl = profile?.avatar?.url ?? null;
  // NAME INITIAL FOR FALLBACK AVATAR
  const initial = (profile?.fullName ?? "?").charAt(0).toUpperCase();
  // HANDLE FILE SELECTION — VALIDATES BEFORE UPLOAD
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      // GET SELECTED FILE
      const file = e.target.files?.[0];
      // CLEAR INPUT VALUE TO ALLOW RE-SELECTION OF SAME FILE
      e.target.value = "";
      // GUARD: NO FILE
      if (!file) return;
      // CLIENT-SIDE TYPE VALIDATION
      if (!ALLOWED_TYPES.includes(file.type)) {
        // SHOW ERROR TOAST
        toast.error("Only JPEG, PNG, and WebP images are allowed!");
        // RETURN FROM FUNCTION
        return;
      }
      // CLIENT-SIDE SIZE VALIDATION
      if (file.size > MAX_SIZE_BYTES) {
        // SHOW ERROR TOAST
        toast.error("Image must be smaller than 5MB!");
        // RETURN FROM FUNCTION
        return;
      }
      // BUILD FORM DATA WITH FILE
      const formData = new FormData();
      // APPEND FILE TO FORM DATA
      formData.append("file", file);
      // TRIGGER UPLOAD MUTATION
      uploadMutation.mutate(formData);
    },
    [uploadMutation],
  );
  // HANDLE DELETE CONFIRM
  const handleDelete = useCallback((): void => {
    // TRIGGER DELETE MUTATION
    deleteMutation.mutate(undefined, {
      // ON SUCCESS, HIDE CONFIRMATION
      onSuccess: () => setShowDeleteConfirm(false),
    });
  }, [deleteMutation]);
  // RETURNING AVATAR UPLOAD
  return (
    // AVATAR SECTION CONTAINER
    <div className="flex flex-col items-center gap-3">
      {/* AVATAR DISPLAY */}
      <div className="relative group">
        {/* AVATAR CIRCLE */}
        <div
          className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-background shadow-lg",
            "bg-gradient-to-br from-primary/20 to-primary/10",
          )}
        >
          {avatarUrl ? (
            // CLOUDINARY AVATAR IMAGE
            <img
              src={avatarUrl}
              alt="Profile avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            // FALLBACK — NAME INITIAL
            <span className="text-3xl font-bold text-primary">{initial}</span>
          )}
          {/* LOADING OVERLAY */}
          {isPending && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        {/* PLUS ICON BUTTON — ONLY WHEN NO AVATAR */}
        {!isPending && !avatarUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center",
              "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors",
            )}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {/* ACTION ICONS — ONLY WHEN AVATAR IS SET */}
      {avatarUrl && (
        <div className="flex items-center gap-2">
          {/* EDIT ICON BUTTON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {/* TRASH ICON BUTTON */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* SUPPORTED FORMATS HINT */}
      <p className="text-[11px] text-muted-foreground">
        JPEG, PNG or WebP · Max 5MB
      </p>
      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />
      {/* DELETE CONFIRMATION MODAL — PORTALED TO BODY FOR TRUE FULL-VIEWPORT OVERLAY */}
      {createPortal(
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card p-5 sm:p-6 w-full max-w-sm text-center space-y-4"
              >
                {/* ICON */}
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                {/* HEADING */}
                <div>
                  <h3 className="font-display font-semibold text-base">
                    Remove Avatar?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your profile picture will be permanently removed.
                  </p>
                </div>
                {/* BUTTONS */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-9 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 h-9 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
});
// <== DISPLAY NAME FOR DEVTOOLS ==>
AvatarUpload.displayName = "AvatarUpload";

// <== EXPORT ==>
export default AvatarUpload;
