import type { SkillSwapContent } from "@/types/types";
import type { ReactNode } from "react";

export interface NavbarProps extends SkillSwapContent {
  notify?: React.ReactNode;
}

export interface NavbarItemProps {
  isImportant?: boolean;
  children: ReactNode;
  isActive?: boolean;
  classes?: string;
  href: string;
}

export interface NavbarNotifyProps extends SkillSwapContent {}
