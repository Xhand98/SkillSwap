"use client";
import SkillSwapFull from "@/icons/logoFull";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Nav, NavBrand, NavContent, NavMenuToggle } from "@/components/ui/nav";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useMemo, useState } from "react";
import NavbarItem from "./NavbarItem";
import NavbarMenu from "./NavbarMenu";
import type { NavbarProps } from "./types";

const Header = forwardRef<HTMLDivElement, NavbarProps>(
  ({ className, children, as, ...rest }, ref) => {
    const path = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useMemo(() => {
      if (isMenuOpen) setIsMenuOpen(false);
    }, [path]);

    return (
      <div
        className="fixed top-0 w-full max-w-screen z-50 mb-20 transition-all duration-300"
        ref={ref}
      >
        {children}
        <Nav
          position="static"
          isBordered={true}
          isBlurred={true}
          className={cn(
            path.startsWith("/admin")
              ? "bg-white border-0"
              : "bg-primary-100/50 backdrop-blur-sm",
            "h-16 min-h-16 px-2 sm:px-4",
            className
          )}
          {...rest}
        >
          <NavBrand>
            <Link href="/" type="button" className="flex items-center">
              <SkillSwapFull
                width={"120"}
                height={"70"}
                className="w-[120px] sm:w-[170px] h-auto"
              />
            </Link>
          </NavBrand>
          <NavbarMenu />
          <NavContent justify="center" className="hidden gap-2 lg:flex">
            {locale.NAVBAR.ITEMS.map((item) => {
              if (item.LINK) {
                const itemIsActive = item.LINK === path;
                return (
                  <NavbarItem
                    key={item.LINK}
                    isActive={itemIsActive}
                    isImportant={item.IMPORTANT}
                    href={item.LINK}
                  >
                    <Link
                      href={item.LINK}
                      scroll={false}
                      className="flex items-center"
                    >
                      {item.TEXT}
                    </Link>
                  </NavbarItem>
                );
              }

              if (item.SUB_ITEMS) {
                const itemIsActive = item.SUB_ITEMS?.some(
                  (subItem) => subItem.LINK === path
                );
                return (
                  <DropdownMenu key={item.TEXT}>
                    <NavbarItem isActive={itemIsActive} href="#">
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="p-0 bg-transparent data-[hover=true]:bg-transparent font-medium text-md"
                        >
                          {item.TEXT}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </NavbarItem>
                    <DropdownMenuContent className="max-w-[300px]">
                      {item.SUB_ITEMS.map((sub) => (
                        <DropdownMenuItem
                          key={sub.LINK}
                          disabled={sub.IS_DISABLED === true}
                          asChild
                        >
                          <Link href={sub.LINK} className="w-full">
                            <span className="text-primary font-semibold capitalize text-ellipsis overflow-hidden text-nowrap">
                              {sub.TEXT}
                            </span>
                            {sub.DESCRIPTION && (
                              <p className="text-xs text-muted-foreground">
                                {sub.DESCRIPTION}
                              </p>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return null;
            })}
          </NavContent>
          <NavContent justify="end" className="gap-2">
            <NavMenuToggle
              aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
              className="lg:hidden"
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
            <Button
              asChild
              className="hidden lg:inline-flex"
              size="sm"
              variant="ghost"
            >
              <Link href={locale.NAVBAR.LINK}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                {locale.NAVBAR.BUTTON}
              </Link>
            </Button>
          </NavContent>
        </Nav>
      </div>
    );
  }
);

Header.displayName = "skillSwap.Navbar";

export default Header;
