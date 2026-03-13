import type { ComponentType, SVGProps } from "react";
import { WashingMachineEmpty, WashingMachineFill } from "./washing-machine";
import { DishwasherEmpty, DishwasherFill } from "./dishwasher";
import { GarbageEmpty, GarbageFill } from "./garbage";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type IconName = "washing_machine" | "dishwasher" | "garbage";
export type IconStyle = "empty" | "fill";

const ICON_REGISTRY = new Map<string, ComponentType<IconProps>>([
  ["washing_machine:empty", WashingMachineEmpty],
  ["washing_machine:fill", WashingMachineFill],
  ["dishwasher:empty", DishwasherEmpty],
  ["dishwasher:fill", DishwasherFill],
  ["garbage:empty", GarbageEmpty],
  ["garbage:fill", GarbageFill],
]);

export function getChoreIcon(
  iconName: string,
  iconStyle: string,
): ComponentType<IconProps> | null {
  return ICON_REGISTRY.get(`${iconName}:${iconStyle}`) ?? null;
}

export {
  WashingMachineEmpty,
  WashingMachineFill,
  DishwasherEmpty,
  DishwasherFill,
  GarbageEmpty,
  GarbageFill,
};
