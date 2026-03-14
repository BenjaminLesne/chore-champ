"use client";

import { useState, useTransition } from "react";
import { regenerateInviteCode } from "@/server/auth/actions";

export function InviteCodeSection({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleCopy() {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateInviteCode();
      if (result.inviteCode) {
        setCode(result.inviteCode);
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-medium text-gray-700">Invite Code</h3>
      <p className="mt-1 text-xs text-gray-500">
        Share this code with roommates so they can join your household.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="rounded-md bg-gray-100 px-3 py-2 font-mono text-lg tracking-widest text-gray-900">
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={pending}
          className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          {pending ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
