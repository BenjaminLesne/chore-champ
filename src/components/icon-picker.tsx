"use client";

import { createElement, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { ICON_NAMES, getLucideIcon } from "@/components/icons/lucide";

function renderIcon(name: string, size: number) {
  const icon = getLucideIcon(name);
  if (!icon) return null;
  return createElement(icon, { size });
}

const COLS = 6;
const ROW_HEIGHT = 44;

interface IconPickerProps {
  /** Hidden input name for the icon name */
  name: string;
  /** Hidden input name for the icon style (default: "iconStyle") */
  styleName?: string;
  value?: string;
  defaultValue?: string;
  defaultStyle?: string;
  onValueChange?: (name: string) => void;
}

export function IconPicker({
  name,
  styleName = "iconStyle",
  value: controlledValue,
  defaultValue = "",
  defaultStyle = "outline",
  onValueChange,
}: IconPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [iconStyle, setIconStyle] = useState(defaultStyle);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = controlledValue ?? internalValue;
  const filled = iconStyle === "fill";

  const filtered = useMemo(() => {
    if (!search) return ICON_NAMES;
    const q = search.toLowerCase();
    return ICON_NAMES.filter((n) => n.includes(q));
  }, [search]);

  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < filtered.length; i += COLS) {
      result.push(filtered.slice(i, i + COLS));
    }
    return result;
  }, [filtered]);

  const handleSelect = (iconName: string) => {
    setInternalValue(iconName);
    onValueChange?.(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              aria-label={selected ? `Icon: ${selected}` : "Pick an icon"}
            />
          }
        >
          {selected ? (
            <>
              {renderIcon(selected, 18)}
              <span className="max-w-32 truncate">{selected}</span>
            </>
          ) : (
            <span className="text-gray-400">Pick an icon</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search icons..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-64">
              {filtered.length === 0 ? (
                <CommandEmpty>No icons found.</CommandEmpty>
              ) : (
                <VirtualGrid
                  rows={rows}
                  selected={selected}
                  onSelect={handleSelect}
                />
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Fill toggle */}
      <button
        type="button"
        onClick={() => setIconStyle(filled ? "outline" : "fill")}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium transition-colors ${
          filled
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
        }`}
        aria-label={filled ? "Switch to outline" : "Switch to fill"}
        title={
          filled ? "Filled — click for outline" : "Outline — click for fill"
        }
      >
        {selected ? renderIcon(selected, 14) : null}
        {filled ? "Fill" : "Outline"}
      </button>

      <input type="hidden" name={name} value={selected} />
      <input type="hidden" name={styleName} value={iconStyle} />
    </div>
  );
}

function VirtualGrid({
  rows,
  selected,
  onSelect,
}: {
  rows: string[][];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="max-h-60 overflow-auto p-1">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;
          return (
            <div
              key={virtualRow.index}
              className="absolute top-0 left-0 flex w-full gap-1"
              style={{
                height: `${ROW_HEIGHT}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.map((iconName) => {
                const isSelected = iconName === selected;
                return (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    onClick={() => onSelect(iconName)}
                    className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {renderIcon(iconName, 20)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
