"use client";
import SkillSwapFull from "@/icons/logoFull";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Menu as MenuIcon,
  User,
  LogOut,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { forwardRef, useMemo, useState } from "react";
import NavbarMenu from "./NavbarMenu";
import type { NavbarProps } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  // Usar nuestro hook para obtener el userId
  const currentUserId = useCurrentUserId();

  console.log("Header - ID de usuario desde hook:", currentUserId);

  useMemo(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [path]);

  return (
    <div
      className="fixed bg-[#1a1a1a] top-0 w-full max-w-screen z-50 mb-20 transition-all duration-300"
      ref={ref}
    >
      {children}
      <div
        className={cn(
          "flex items-center justify-between h-16 min-h-16 px-4 sm:px-6",
          path.startsWith("/admin")
            ? "bg-[#1a1a1a]"
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
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/images/avatars/default.png"
                      alt={user?.nombre_usuario || "Usuario"}
                    />
                    <AvatarFallback>
                      {user?.primer_nombre ? user.primer_nombre[0] : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block">
                    {user?.primer_nombre || "Usuario"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />{" "}
                <DropdownMenuItem asChild>
                  <Link
                    href={`/profiles/${currentUserId || user?.id}`}
                    className="cursor-pointer flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/feed"
                    className="cursor-pointer flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Feed</span>
                  </Link>
                </DropdownMenuItem>{" "}
                <DropdownMenuItem asChild>
                  <Link
                    href="/matches"
                    className="cursor-pointer flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Conexiones</span>
                  </Link>
                </DropdownMenuItem>
                {user?.rol === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/dashboard"
                      className="cursor-pointer flex items-center text-amber-600 font-medium"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Panel de Administración</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
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
          {isAuthenticated && (
            <div className="p-4 border-t">
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Header.displayName = "Header";
export default Header;
