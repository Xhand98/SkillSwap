"use client";

import { useNotify } from "@/components/notify";
import { Text } from "@/components/text";
import locale from "@/locales/root.json";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavbarMenu() {
  const {
    NAVBAR: { ITEMS },
  } = locale;
  const path = usePathname();
  const { isOpen } = useNotify();

  return (
    <div className="flex flex-col gap-2 p-4">
      <div
        key={"spacing"}
        style={{
          paddingTop: isOpen ? "2rem" : "0px",
        }}
      />
      {ITEMS.map((item) => {
        if (item.LINK) {
          const itemIsActive = item.LINK === path;
          return (
            <div
              key={item.TEXT}
              className="h-max w-max inline-flex gap-1 items-center"
            >
              <Link 
                href={item.LINK} 
                scroll={false}
                className={`text-foreground font-medium ${itemIsActive ? 'text-primary font-semibold' : ''}`}
              >
                {item.TEXT}
              </Link>
              {item.IMPORTANT && (
                <span
                  aria-label="Nuevo contenido!"
                  className="size-1.5 bg-primary-500 rounded-full animate-pulse"
                />
              )}
            </div>
          );
        }

        if (item.SUB_ITEMS) {
          const itemIsActive = item.SUB_ITEMS?.some(
            (subItem) => subItem.LINK === path,
          );
          return (
            <div key={item.TEXT}>
              <div
                style={{
                  opacity: itemIsActive ? 1 : 0.55,
                  fontStyle: itemIsActive ? "italic" : "normal",
                }}
                className="inline-flex items-center gap-1 text-xs"
              >
                <ChevronRight className="w-4 h-4" />
                <Text className="py-1 text-foreground">{item.TEXT}</Text>
              </div>
              <div className="pl-4 border-l border-border">
                {item.SUB_ITEMS.map((sub) => (
                  <div
                    key={sub.TEXT}
                    style={{
                      opacity: sub.IS_DISABLED ? 0.3 : 1,
                      pointerEvents: sub.IS_DISABLED ? "none" : "auto",
                    }}
                    className="items-center gap-1 h-max w-max py-1"
                  >
                    <Link 
                      href={sub.LINK} 
                      scroll={false}
                      className={`text-foreground ${sub.LINK === path ? 'text-primary font-semibold' : ''}`}
                    >
                      {sub.TEXT}
                    </Link>
                    {sub.IS_DISABLED && (
                      <Text size="label-xs">Próximamente</Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}

export default NavbarMenu;
