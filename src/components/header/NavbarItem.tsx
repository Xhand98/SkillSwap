import type { NavbarItemProps } from "./types.d";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { NavbarItem as NextNavbarItem } from "@heroui/react";

/**
 * @typedef {object} NavbarItemProps
 * @property {string} [className] - The CSS class to apply to the navbar item
 * @property {ReactNode} children - The content of the navbar item
 * @property {boolean} [isImportant] - Whether to show an important indicator
 */
const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
  ({ className, children, isImportant, ...rest }, _) => {
    return (
      <NextNavbarItem
        className={cn(
          "flex flex-cols gap-1 justify-center items-center text-foreground font-medium cursor-pointer",
          className,
        )}
        {...rest}
      >
        {children}
        {isImportant && (
          <span
            aria-label="Nuevo contenido!"
            className="size-1.5 bg-primary-500 rounded-full animate-pulse"
          />
        )}
      </NextNavbarItem>
    );
  },
);

NavbarItem.displayName = "SkillSwap.NavbarItem";

export default NavbarItem;
