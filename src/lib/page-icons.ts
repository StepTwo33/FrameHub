import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Crosshair,
  Dog,
  FileText,
  FolderOpen,
  GitCompareArrows,
  Hammer,
  Heart,
  Info,
  Link2,
  Megaphone,
  Plane,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";

/** Serializable icon keys for Server → Client props (Lucide components cannot cross the RSC boundary). */
export const PAGE_ICON_MAP = {
  alertTriangle: AlertTriangle,
  arrowLeftRight: ArrowLeftRight,
  bookOpen: BookOpen,
  crosshair: Crosshair,
  dog: Dog,
  fileText: FileText,
  folderOpen: FolderOpen,
  gitCompareArrows: GitCompareArrows,
  hammer: Hammer,
  heart: Heart,
  info: Info,
  link2: Link2,
  megaphone: Megaphone,
  plane: Plane,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  swords: Swords,
  target: Target,
  trophy: Trophy,
  users: Users,
} as const satisfies Record<string, LucideIcon>;

export type PageIconName = keyof typeof PAGE_ICON_MAP;

export function resolvePageIcon(
  icon?: LucideIcon,
  iconName?: PageIconName,
): LucideIcon | undefined {
  if (icon) return icon;
  if (iconName) return PAGE_ICON_MAP[iconName];
  return undefined;
}
