// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { BadgeProps, badgeVariants } from "@/types/badge-types";

// <== BADGE COMPONENT ==>
function Badge({ className, variant, ...props }: BadgeProps) {
  // RETURNING BADGE CONTENT
  return (
    <div
      // DYNAMIC CLASS MERGING WITH VARIANTS
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

// <== EXPORTS ==>
export { Badge };
