// <== IMPORTS ==>
import { cva, type VariantProps } from "class-variance-authority";

// <== BUTTON VARIANTS ==>
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // DEFAULT PRIMARY STYLING
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // DESTRUCTIVE / ERROR STYLING
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // BORDERED OUTLINE STYLING
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        // SECONDARY STYLING
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // GHOST / TRANSPARENT STYLING
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // LINK STYLING
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // DEFAULT SIZING
        default: "h-10 px-4 py-2",
        // SMALL SIZING
        sm: "h-9 rounded-md px-3",
        // LARGE SIZING
        lg: "h-11 rounded-md px-8",
        // SQUARE ICON SIZING
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// <== BUTTON PROPS INTERFACE ==>
export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // OPTION TO RENDER AS A DIFFERENT ELEMENT (RADIX SLOT)
  asChild?: boolean;
}
