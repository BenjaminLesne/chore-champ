"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createMember,
  updateMember,
  deleteMember,
  type MemberActionState,
} from "@/server/members/actions";

type Member = {
  id: number;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

const initialState: MemberActionState = {};

function AddMemberForm() {
  const [state, formAction, pending] = useActionState(
    createMember,
    initialState,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <label
          htmlFor="new-member-name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="new-member-name"
          name="name"
          type="text"
          required
          placeholder="Member name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex-1">
        <label
          htmlFor="new-member-avatar"
          className="block text-sm font-medium text-gray-700"
        >
          Avatar URL <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="new-member-avatar"
          name="avatarUrl"
          type="url"
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

function MemberRow({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    updateMember,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteMember,
    initialState,
  );

  if (editing) {
    return (
      <li className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <form action={editAction} className="flex items-end gap-3">
          <input type="hidden" name="memberId" value={member.id} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={member.name}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <input
              name="avatarUrl"
              type="url"
              defaultValue={member.avatarUrl ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
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
        {member.avatarUrl ? (
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-medium text-gray-900">{member.name}</span>
        {member.isAdmin && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Edit
        </button>

        {!member.isAdmin &&
          (confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete?</span>
              <form action={deleteAction}>
                <input type="hidden" name="memberId" value={member.id} />
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
          ))}
      </div>
    </li>
  );
}

export function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="mt-4 space-y-6">
      <AddMemberForm />
      <ul className="space-y-3">
        {members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
        {members.length === 0 && (
          <li className="py-4 text-center text-sm text-gray-500">
            No members yet. Add one above.
          </li>
        )}
      </ul>
    </div>
  );
}
