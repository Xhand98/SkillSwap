"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  position?: "static" | "fixed";
  isBordered?: boolean;
  isBlurred?: boolean;
}

interface NavBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface NavContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

interface NavMenuToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Nav({
  children,
  className,
  position = "static",
  isBordered = false,
  isBlurred = false,
  ...props
}: NavProps) {
  return (
    <nav
      className={cn(
        "w-full flex flex-wrap items-center justify-between",
        position === "fixed" && "fixed top-0 left-0 right-0",
        isBordered && "border-b",
        isBlurred && "backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export function NavBrand({ children, className, ...props }: NavBrandProps) {
  return (
    <div
      className={cn("flex-shrink-0 flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavContent({
  children,
  className,
  justify = "start",
  ...props
}: NavContentProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        {
          "justify-start": justify === "start",
          "justify-center": justify === "center",
          "justify-end": justify === "end",
          "justify-between": justify === "between",
          "justify-around": justify === "around",
          "justify-evenly": justify === "evenly",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavMenuToggle({
  isOpen,
  onToggle,
  className,
  "aria-label": ariaLabel = "Toggle navigation",
  ...props
}: NavMenuToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary",
        className
      )}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      onClick={onToggle}
      {...props}
    >
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}

export { Link as NavLink };
