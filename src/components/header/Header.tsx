"use client";
import SkillSwapFull from "@/icons/logoFull";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown, Menu as MenuIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { forwardRef, useMemo, useState } from "react";
import NavbarMenu from "./NavbarMenu";
import type { NavbarProps } from "./types";

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <Link
        href={href || "#"}
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Header = forwardRef<
  HTMLDivElement,
  Omit<NavbarProps, "as" | "isBordered" | "isBlurred">
>(({ className, children, ...rest }, ref) => {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useMemo(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [path]);

  return (
    <div
      className="fixed top-0 w-full max-w-screen z-50 mb-20 transition-all duration-300"
      ref={ref}
    >
      {children}
      <div
        className={cn(
          "flex items-center justify-between h-16 min-h-16 px-4 sm:px-6",
          path.startsWith("/admin")
            ? "bg-white"
            : "bg-primary-100/50 backdrop-blur-sm border-b border-border",
          className
        )}
        {...rest}
      >
        <Link href="/" className="flex items-center flex-shrink-0">
          <SkillSwapFull
            width={"120"}
            height={"70"}
            className="w-[120px] sm:w-[170px] h-auto"
          />
        </Link>
        <NavigationMenu className="hidden lg:flex mx-auto">
          <NavigationMenuList>
            {locale.NAVBAR.ITEMS.map((item) => {
              const itemIsActive =
                item.LINK === path ||
                item.SUB_ITEMS?.some((sub) => sub.LINK === path);
              if (item.LINK) {
                return (
                  <NavigationMenuItem key={item.LINK}>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        itemIsActive && "text-primary font-semibold"
                      )}
                      asChild
                    >
                      <Link href={item.LINK}>{item.TEXT}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              }

              if (item.SUB_ITEMS) {
                return (
                  <NavigationMenuItem key={item.TEXT}>
                    <NavigationMenuTrigger
                      className={cn(
                        itemIsActive && "text-primary font-semibold"
                      )}
                    >
                      {item.TEXT}
                      <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] lg:w-[500px] grid-cols-1 md:grid-cols-2">
                        {item.SUB_ITEMS.map((sub) => (
                          <ListItem
                            key={sub.LINK}
                            href={sub.LINK}
                            title={sub.TEXT}
                            className={
                              path === sub.LINK
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }
                          >
                            {sub.DESCRIPTION}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }
              return null;
            })}
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>{" "}
        <div className="hidden lg:flex items-center gap-2">
          {/* Enlaces directos al perfil y cuenta */}
          <Button variant="link" size="sm" className="text-md" asChild>
            <Link href="/profiles/1" className="flex items-center gap-2">
              <User className="w-5 h-5 flex-shrink-0" />
              <span>Mi Perfil</span>
            </Link>
          </Button>

          <Button variant="link" size="sm" className="text-md" asChild>
            <Link href={locale.NAVBAR.LINK} className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{locale.NAVBAR.BUTTON}</span>
            </Link>
          </Button>
        </div>
        <div className="lg:hidden">
          <Button
            variant="link"
            size="icon"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <NavbarMenu />
        </div>
      )}
    </div>
  );
});

Header.displayName = "Header";

export default Header;
