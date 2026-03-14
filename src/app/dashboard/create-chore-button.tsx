"use client";

import { useActionState, useState } from "react";
import { createChore, type ChoreActionState } from "@/server/chores/actions";
import { IconPicker } from "@/components/icon-picker";

export function CreateChoreButton() {
  const [open, setOpen] = useState(false);
  const initialState: ChoreActionState = {};
  const [state, formAction, pending] = useActionState(
    createChore,
    initialState,
  );
  const [prevPending, setPrevPending] = useState(false);

  // Close modal when action completes successfully (adjust state during render)
  if (prevPending && !pending && state.success) {
    setOpen(false);
  }
  if (prevPending !== pending) {
    setPrevPending(pending);
  }

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

            <form action={formAction} className="mt-4 space-y-4">
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
                <div className="mt-1">
                  <IconPicker name="iconName" />
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
