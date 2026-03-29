// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonProps, buttonVariants } from "@/types/button-types";

// <== BUTTON COMPONENT ==>
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // DETERMINE UNDERLYING ELEMENT TYPE
    const Comp = asChild ? Slot : "button";
    // RETURNING BUTTON CONTENT
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
Button.displayName = "Button";
// <== EXPORTS ==>
export { Button };
