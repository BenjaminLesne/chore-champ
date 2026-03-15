"use client";

import { useActionState, useState } from "react";
import {
  updateChore,
  deleteChore,
  type ChoreActionState,
} from "@/server/chores/actions";
import { IconPicker } from "@/components/icon-picker";

type Chore = {
  id: number;
  name: string;
  iconName: string;
  iconStyle: string;
  iconColor: string;
  points: number;
};

const initialState: ChoreActionState = {};

function ChoreRow({ chore }: { chore: Chore }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    updateChore,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteChore,
    initialState,
  );

  if (editing) {
    return (
      <li className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <form action={editAction} className="space-y-3">
          <input type="hidden" name="choreId" value={chore.id} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={chore.name}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">
                Points
              </label>
              <input
                name="points"
                type="number"
                required
                min={1}
                defaultValue={chore.points}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Icon
            </label>
            <div className="mt-1">
              <IconPicker
                name="iconName"
                defaultValue={chore.iconName}
                defaultStyle={chore.iconStyle}
                defaultColor={chore.iconColor}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={editPending}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
        {editState.error && (
          <p className="mt-2 text-sm text-red-600">{editState.error}</p>
        )}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {chore.iconName.replace("_", " ")} · {chore.iconStyle}
        </span>
        <span className="font-medium text-gray-900">{chore.name}</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          {chore.points} pts
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Edit
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Delete?</span>
            <form action={deleteAction}>
              <input type="hidden" name="choreId" value={chore.id} />
              <button
                type="submit"
                disabled={deletePending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletePending ? "Deleting…" : "Confirm"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            {deleteState.error && (
              <p className="text-sm text-red-600">{deleteState.error}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

export function ChoreList({ chores }: { chores: Chore[] }) {
  return (
    <div className="mt-4 space-y-6">
      <ul className="space-y-3">
        {chores.map((chore) => (
          <ChoreRow key={chore.id} chore={chore} />
        ))}
        {chores.length === 0 && (
          <li className="py-4 text-center text-sm text-gray-500">
            No chores yet. Create one from the dashboard.
          </li>
        )}
      </ul>
    </div>
  );
}
