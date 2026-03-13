"use client";

import { useActionState, useState } from "react";
import {
  createChore,
  updateChore,
  deleteChore,
  type ChoreActionState,
} from "@/server/chores/actions";

type Chore = {
  id: number;
  name: string;
  iconName: string;
  iconStyle: string;
  points: number;
};

const ICON_OPTIONS = [
  { value: "washing_machine", label: "Washing Machine" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "garbage", label: "Garbage" },
] as const;

const STYLE_OPTIONS = [
  { value: "empty", label: "Empty" },
  { value: "fill", label: "Fill" },
] as const;

const initialState: ChoreActionState = {};

function IconPicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [selected, setSelected] = useState(defaultValue ?? "washing_machine");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Icon</label>
      <input type="hidden" name={name} value={selected} />
      <div className="mt-1 flex gap-2">
        {ICON_OPTIONS.map((icon) => (
          <button
            key={icon.value}
            type="button"
            onClick={() => setSelected(icon.value)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              selected === icon.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {icon.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StylePicker({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [selected, setSelected] = useState(defaultValue ?? "empty");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Style</label>
      <input type="hidden" name={name} value={selected} />
      <div className="mt-1 flex gap-2">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => setSelected(style.value)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              selected === style.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddChoreForm() {
  const [state, formAction, pending] = useActionState(
    createChore,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <label
            htmlFor="new-chore-name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="new-chore-name"
            name="name"
            type="text"
            required
            placeholder="Chore name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="w-24">
          <label
            htmlFor="new-chore-points"
            className="block text-sm font-medium text-gray-700"
          >
            Points
          </label>
          <input
            id="new-chore-points"
            name="points"
            type="number"
            required
            min={1}
            defaultValue={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-6">
        <IconPicker name="iconName" />
        <StylePicker name="iconStyle" />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add chore"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}

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
          <div className="flex gap-6">
            <IconPicker name="iconName" defaultValue={chore.iconName} />
            <StylePicker name="iconStyle" defaultValue={chore.iconStyle} />
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
      <AddChoreForm />
      <ul className="space-y-3">
        {chores.map((chore) => (
          <ChoreRow key={chore.id} chore={chore} />
        ))}
        {chores.length === 0 && (
          <li className="py-4 text-center text-sm text-gray-500">
            No chores yet. Add one above.
          </li>
        )}
      </ul>
    </div>
  );
}
