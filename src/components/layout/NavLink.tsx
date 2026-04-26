// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { memo, forwardRef } from "react";
import { NavLink as RouterNavLink, type NavLinkProps } from "react-router-dom";

// <== NAV LINK PROPS INTERFACE ==>
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  // <== BASE CLASS NAME ==>
  className?: string;
  // <== ACTIVE CLASS NAME ==>
  activeClassName?: string;
  // <== PENDING CLASS NAME ==>
  pendingClassName?: string;
}

// <== NAV LINK COMPONENT ==>
const NavLink = memo(
  forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
    ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
      return (
        <RouterNavLink
          ref={ref}
          to={to}
          className={({ isActive, isPending }): string =>
            cn(
              className,
              isActive && activeClassName,
              isPending && pendingClassName,
            )
          }
          {...props}
        />
      );
    },
  ),
);
// <== DISPLAY NAME FOR DEVTOOLS ==>
NavLink.displayName = "NavLink";
// <== EXPORT ==>
export { NavLink };
