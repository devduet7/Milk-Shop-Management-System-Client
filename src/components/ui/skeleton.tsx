// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

// <== SKELETON COMPONENT ==>
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// <== EXPORTS ==>
export { Skeleton };
