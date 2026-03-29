// <== IMPORTS ==>
import { Toaster as Sonner } from "sonner";
import { type ComponentProps } from "react";
import { useTheme } from "@/hooks/useTheme";

// <== TOASTER PROPS TYPE ==>
type ToasterProps = ComponentProps<typeof Sonner>;

// <== TOASTER COMPONENT ==>
const Toaster = ({ ...props }: ToasterProps) => {
  // GETTING CURRENT THEME FOR SONNER
  const { theme } = useTheme();
  // RETURNING SONNER
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// <== EXPORTS ==>
export { Toaster };
