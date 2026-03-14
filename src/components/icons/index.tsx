import type { ComponentType, SVGProps } from "react";
import { WashingMachineEmpty, WashingMachineFill } from "./washing-machine";
import { DishwasherEmpty, DishwasherFill } from "./dishwasher";
import { GarbageEmpty, GarbageFill } from "./garbage";
import { getLucideIcon } from "./lucide";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type IconName = "washing_machine" | "dishwasher" | "garbage";
export type IconStyle = "empty" | "fill";

/** Legacy custom icons keyed by "name:style" */
const LEGACY_REGISTRY = new Map<string, ComponentType<IconProps>>([
  ["washing_machine:empty", WashingMachineEmpty],
  ["washing_machine:fill", WashingMachineFill],
  ["dishwasher:empty", DishwasherEmpty],
  ["dishwasher:fill", DishwasherFill],
  ["garbage:empty", GarbageEmpty],
  ["garbage:fill", GarbageFill],
]);

export interface ChoreIconResult {
  Icon: ComponentType<IconProps>;
  /** Whether the icon should use a filled/solid background treatment */
  filled: boolean;
}

export function getChoreIcon(
  iconName: string,
  iconStyle: string,
): ChoreIconResult | null {
  // Try legacy registry first (custom SVG icons — fill is baked in)
  const legacy = LEGACY_REGISTRY.get(`${iconName}:${iconStyle}`);
  if (legacy) return { Icon: legacy, filled: false };

  // Fall back to Lucide icons (kebab-case names)
  const lucide = getLucideIcon(iconName) as ComponentType<IconProps> | null;
  if (!lucide) return null;
  return { Icon: lucide, filled: iconStyle === "fill" };
}

export {
  WashingMachineEmpty,
  WashingMachineFill,
  DishwasherEmpty,
  DishwasherFill,
  GarbageEmpty,
  GarbageFill,
};
