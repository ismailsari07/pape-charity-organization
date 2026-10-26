import type { ComponentType } from "react";
import { BookOpenIcon, CalendarDaysIcon, HeartIcon, InfoIcon, LeafIcon, MoonIcon, UsersIcon } from "lucide-react";
import MosqueIcon from "@/components/icons/MosqueIcon";

// services.icon values the panel allows → icons.
export const SERVICE_ICON: Record<string, ComponentType<{ size?: number }>> = {
  heart: HeartIcon,
  leaf: LeafIcon,
  book: BookOpenIcon,
  moon: MoonIcon,
  users: UsersIcon,
  calendar: CalendarDaysIcon,
  mosque: MosqueIcon,
  info: InfoIcon,
};
