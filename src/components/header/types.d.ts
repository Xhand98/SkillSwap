import type { SkillSwapContent } from "@/components/types.d";
import type { NavbarItemProps as NextNavbarItemProps } from "@heroui/navbar";

export interface NavbarProps extends SkillSwapContent {
  notify?: React.ReactNode;
}

export interface NavbarItemProps extends NextNavbarItemProps {
  isImportant?: boolean;
  children: ReactNode;
  isActive?: boolean;
}

export interface NavbarNotifyProps extends SkillSwapContent {}
