import type { NavbarItemProps } from "./types.d";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} NavbarItemProps
 * @property {string} [className] - The CSS class to apply to the navbar item
 * @property {ReactNode} children - The content of the navbar item
 * @property {boolean} [isImportant] - Whether to show an important indicator
 */
const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
  ({ classes, children, isImportant, isActive, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex relative h-full items-center justify-center",
          "transition-colors duration-200",
          "hover:text-primary-600",
          isActive &&
            "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-[2px] after:bg-primary",
          "text-foreground font-medium cursor-pointer",
          classes
        )}
        data-active={isActive}
        {...rest}
      >
        {children}
        {isImportant && (
          <span
            aria-label="Nuevo contenido!"
            className="size-1.5 bg-primary-500 rounded-full animate-pulse"
          />
        )}
      </div>
    );
  }
);

NavbarItem.displayName = "SkillSwap.NavbarItem";

export default NavbarItem;
