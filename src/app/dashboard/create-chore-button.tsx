"use client";

import { useActionState, useState } from "react";
import { createChore, type ChoreActionState } from "@/server/chores/actions";

const ICON_OPTIONS = [
  { value: "washing_machine", label: "Washing Machine" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "garbage", label: "Garbage" },
] as const;

const STYLE_OPTIONS = [
  { value: "empty", label: "Empty" },
  { value: "fill", label: "Fill" },
] as const;

export function CreateChoreButton() {
  const [open, setOpen] = useState(false);
  const [iconName, setIconName] = useState("washing_machine");
  const [iconStyle, setIconStyle] = useState("empty");
  const initialState: ChoreActionState = {};
  const [state, formAction, pending] = useActionState(
    createChore,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        New Chore
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">New Chore</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form
              action={formAction}
              onSubmit={() => setOpen(false)}
              className="mt-4 space-y-4"
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="create-chore-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    id="create-chore-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Chore name"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="w-24">
                  <label
                    htmlFor="create-chore-points"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Points
                  </label>
                  <input
                    id="create-chore-points"
                    name="points"
                    type="number"
                    required
                    min={1}
                    defaultValue={1}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <input type="hidden" name="iconName" value={iconName} />
                <div className="mt-1 flex gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setIconName(icon.value)}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        iconName === icon.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {icon.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Style
                </label>
                <input type="hidden" name="iconStyle" value={iconStyle} />
                <div className="mt-1 flex gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setIconStyle(style.value)}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        iconStyle === style.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {state.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create Chore"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
