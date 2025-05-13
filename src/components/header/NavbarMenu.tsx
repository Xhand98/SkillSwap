"use client";

import { useNotify } from "@/components/notify";
import { Text } from "@/components/text";
import locale from "@/locales/root.json";
import { NavMenu } from "@/components/ui/nav-menu";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavbarItem from "./NavbarItem";
import { cn } from "@/lib/utils";

function NavbarMenu() {
  const {
    NAVBAR: { ITEMS },
  } = locale;
  const path = usePathname();
  const { isOpen: notifyIsOpen } = useNotify();

  return (
    <NavMenu key={"navbar-menu-mobile"} className="gap-2" isOpen={true}>
      <div
        key={"spacing"}
        style={{
          paddingTop: notifyIsOpen ? "2rem" : "0px",
        }}
      />
      {ITEMS.map((item) => {
        if (item.LINK) {
          const itemIsActive = item.LINK === path;
          return (
            <NavbarItem
              key={item.TEXT}
              isActive={itemIsActive}
              href={item.LINK}
              classes="h-max w-max inline-flex gap-1 items-center"
            >
              <Link href={item.LINK} scroll={false}>
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
            <div key={item.TEXT}>
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  itemIsActive ? "opacity-100 italic" : "opacity-55"
                )}
              >
                <ChevronRight className="h-4 w-4" />
                <Text className="py-1 text-foreground">{item.TEXT}</Text>
              </div>
              <div className="pl-4 border-l-1 border-default-300">
                {item.SUB_ITEMS.map((sub) => (
                  <NavbarItem
                    key={sub.TEXT}
                    isActive={sub.LINK === path}
                    href={sub.LINK}
                    classes={cn(
                      "items-center gap-1 h-max w-max list-disc! opacity-60",
                      sub.IS_DISABLED && "opacity-30 pointer-events-none"
                    )}
                  >
                    <Link href={sub.LINK} scroll={false}>
                      {sub.TEXT}
                    </Link>
                    {sub.IS_DISABLED && (
                      <Text size="label-xs">Próximamente</Text>
                    )}
                  </NavbarItem>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </NavMenu>
  );
}

export default NavbarMenu;
