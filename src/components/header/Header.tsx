"use client";
import SkillSwapFull from "@/icons/logoFull";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import {
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
            "h-16 min-h-16 px-2 sm:px-4",
            className
          )}
          classNames={{
            base: "h-16 min-h-16",
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

export default Header;
