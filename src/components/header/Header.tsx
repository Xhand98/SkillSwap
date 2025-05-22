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
