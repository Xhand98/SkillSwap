"use client";
import SkillSwapFull from "@/icons/logoFull";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import { NotificationBell } from "@/components/NotificationBell";
import {
<<<<<<< HEAD
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarBrand,
  NavbarContent,
  NavbarMenuToggle,
  Navbar as NextNavbar,
} from "@heroui/react";
import { ChevronIcon } from "@heroui/shared-icons";
=======
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
  MessageCircle,
} from "lucide-react";
>>>>>>> recovered-branch
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useMemo, useState } from "react";
import NavbarItem from "./NavbarItem";
import NavbarMenu from "./NavbarMenu";
import type { NavbarProps } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = forwardRef<HTMLDivElement, NavbarProps>(
  ({ className, children, as, ...rest }, ref) => {
    const path = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

<<<<<<< HEAD
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
        <NextNavbar
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          isBordered
          position="static"
          isBlurred={true}
          className={cn(
            path.startsWith("/admin")
              ? "bg-white border-0"
              : "bg-primary-100/50 backdrop-blur-sm",
            "h-16 min-h-[4rem] px-2 sm:px-4",
            className
          )}
          classNames={{
            base: "h-16 min-h-[4rem]",
            wrapper: "mx-auto w-full h-full",
            content: "gap-2 h-full",
            brand: "gap-0 h-full",
            item: [
              "flex",
              "relative",
              "h-full",
              "items-center",
              "transition-colors duration-200",
              "hover:text-primary-600",
              "data-[active=true]:after:content-['']",
              "data-[active=true]:after:absolute",
              "data-[active=true]:after:bottom-0",
              "data-[active=true]:after:left-0",
              "data-[active=true]:after:right-0",
              "data-[active=true]:after:h-[2px]",
              "data-[active=true]:after:rounded-[2px]",
              "data-[active=true]:after:bg-primary",
            ],
          }}
          {...rest}
        >
          <NavbarBrand>
            <Link href="/" type="button" className="flex items-center">
              <SkillSwapFull
                width={"120"}
                height={"70"}
                className="w-[120px] sm:w-[170px] h-auto"
              />
            </Link>
          </NavbarBrand>
          <NavbarMenu />
          <NavbarContent justify="center" className="hidden  gap-2 lg:flex">
=======
const Header = forwardRef<
  HTMLDivElement,
  Omit<NavbarProps, "as" | "isBordered" | "isBlurred">
>(({ className, children, ...rest }, ref) => {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth(); // Usar nuestro hook para obtener el userId
  const currentUserId = useCurrentUserId();

  useMemo(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [path]);

  return (
    <div
      className="fixed bg-[#1a1a1a] top-0 w-full max-w-screen z-50 mb-20 transition-all duration-300"
      ref={ref}
    >
      {children}
      <div        className={cn(
          "flex items-center justify-between h-16 min-h-16 px-4 sm:px-6",
          path?.startsWith("/admin")
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
>>>>>>> recovered-branch
            {locale.NAVBAR.ITEMS.map((item) => {
              if (item.LINK) {
                const itemIsActive = item.LINK === path;
                return (
                  <NavbarItem
                    key={item.LINK}
                    isActive={itemIsActive}
                    isImportant={item.IMPORTANT}
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
                  <Dropdown
                    showArrow
                    shouldCloseOnBlur
                    radius="sm"
                    size="sm"
                    key={item.TEXT}
                    className="bg-default-100"
                  >
                    <NavbarItem isActive={itemIsActive}>
                      <DropdownTrigger>
                        <Button
                          disableRipple
                          className="p-0 bg-transparent data-[hover=true]:bg-transparent font-medium text-md"
                          endContent={<ChevronIcon className="-rotate-90" />}
                          radius="sm"
                          variant="light"
                        >
                          {item.TEXT}
                        </Button>
                      </DropdownTrigger>
                    </NavbarItem>
                    <DropdownMenu
                      aria-label={item.TEXT}
                      items={item.SUB_ITEMS}
                      className="max-w-[300px]"
                      disabledKeys={item.SUB_ITEMS.filter(
                        (sub) => sub.IS_DISABLED === true
                      ).map((sub) => sub.LINK)}
                    >
                      {(sub) => (
                        <DropdownItem
                          description={sub.DESCRIPTION}
                          as={Link}
                          key={sub.LINK}
                          href={sub.LINK}
                        >
                          <span className="text-primary font-semibold capitalize text-ellipsis overflow-hidden text-nowrap">
                            {sub.TEXT}
                          </span>
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                );
              }
            })}
<<<<<<< HEAD
          </NavbarContent>
          <NavbarContent justify="end" className="gap-2">
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
              className="lg:hidden"
            />
            <Button
              as={Link}
              href={locale.NAVBAR.LINK}
              className="hidden lg:inline-flex"
              size="sm"
              variant="light"
              color="primary"
              startContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              }
            >
              {locale.NAVBAR.BUTTON}
            </Button>
          </NavbarContent>
        </NextNavbar>
      </div>
    );
  }
);

Header.displayName = "skillSwap.Navbar";

=======
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>{" "}
        <div className="hidden lg:flex items-center gap-2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          ) : isAuthenticated ? (
            <>
              <NotificationBell />
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
                      href="/messages"
                      className="cursor-pointer flex items-center"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Mensajes</span>
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
            </>
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
>>>>>>> recovered-branch
export default Header;
