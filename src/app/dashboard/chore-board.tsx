"use client";

import { getChoreIcon } from "@/components/icons";

interface Chore {
  id: number;
  name: string;
  iconName: string;
  iconStyle: string;
  points: number;
}

export function ChoreBoard({ chores }: { chores: Chore[] }) {
  if (chores.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">
          No chores yet. Add some in{" "}
          <a
            href="/settings"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Settings
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {chores.map((chore) => {
        const Icon = getChoreIcon(chore.iconName, chore.iconStyle);
        return (
          <button
            key={chore.id}
            type="button"
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:scale-95"
          >
            <div className="text-blue-600">
              {Icon ? <Icon size={56} /> : null}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {chore.name}
            </span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {chore.points} {chore.points === 1 ? "pt" : "pts"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
