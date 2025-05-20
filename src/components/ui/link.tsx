"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-foreground hover:text-primary hover:underline",
        underlineHover: "text-foreground hover:underline hover:text-primary",
        underline: "text-foreground underline hover:text-primary",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  aschild?: boolean;
  href: string;
}

const ShadcnLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, aschild = false, href, ...props }, ref) => {
    const Comp = aschild ? Slot : "a";

    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return (
        <Comp
          className={cn(linkVariants({ variant, size, className }))}
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }
    if (aschild) {
      return (
        <Comp ref={ref} {...props}>
          <Link
            href={href}
            className={cn(linkVariants({ variant, size, className }))}
          />
        </Comp>
      );
    }

    return (
      <Link
        href={href}
        className={cn(linkVariants({ variant, size, className }))}
        ref={ref as any}
        {...props}
      />
    );
  }
);
ShadcnLink.displayName = "Link";

export { ShadcnLink, linkVariants };
