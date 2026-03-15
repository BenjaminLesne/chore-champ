import { type LucideIcon, icons } from "lucide-react";

/** Kebab-case name → Lucide component */
const LUCIDE_MAP = new Map<string, LucideIcon>();

for (const [pascalName, component] of Object.entries(icons)) {
  // Convert PascalCase to kebab-case: "WashingMachine" → "washing-machine"
  const kebab = pascalName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  LUCIDE_MAP.set(kebab, component);
}

/** All Lucide icon names in sorted kebab-case */
export const ICON_NAMES: string[] = [...LUCIDE_MAP.keys()].sort();

/** Curated chore/household icons shown first in the picker */
const SUGGESTED_CANDIDATES = [
  "cooking-pot",
  "utensils",
  "chef-hat",
  "spray-can",
  "trash-2",
  "shirt",
  "bed-double",
  "bath",
  "sparkles",
  "washing-machine",
  "vacuum",
  "scissors",
  "shopping-cart",
  "wrench",
  "hammer",
  "brush",
  "leaf",
  "dog",
  "cat",
  "baby",
  "lamp",
  "sofa",
  "refrigerator",
  "microwave",
  "iron",
  "broom",
  "mop",
  "hand-platter",
  "salad",
  "beef",
];

export const SUGGESTED_ICON_NAMES: string[] = SUGGESTED_CANDIDATES.filter((n) =>
  LUCIDE_MAP.has(n),
);

/** Look up a Lucide icon by kebab-case name */
export function getLucideIcon(name: string): LucideIcon | null {
  return LUCIDE_MAP.get(name) ?? null;
}
