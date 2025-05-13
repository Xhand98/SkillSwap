"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NavMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isOpen?: boolean;
}

export function NavMenu({
  children,
  className,
  isOpen = false,
  ...props
}: NavMenuProps) {
  return (
    <div
      className={cn(
        "lg:hidden absolute top-16 right-0 w-full p-4 bg-background border-b shadow-md transition-opacity",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
