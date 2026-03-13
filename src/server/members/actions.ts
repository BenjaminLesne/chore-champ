"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { members } from "@/server/db/schema";
import { getSession } from "@/server/auth/session";
import {
  createMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
} from "./schemas";

export type MemberActionState = {
  error?: string;
  success?: boolean;
};

async function requireAdmin(): Promise<{
  householdId: number;
} | null> {
  const session = await getSession();
  if (!session) return null;
  return { householdId: session.householdId };
}

export async function createMember(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = createMemberSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, avatarUrl } = parsed.data;

  await db.insert(members).values({
    name,
    avatarUrl: avatarUrl ?? null,
    householdId: admin.householdId,
    isAdmin: false,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateMember(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = updateMemberSchema.safeParse({
    memberId: Number(formData.get("memberId")),
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { memberId, name, avatarUrl } = parsed.data;

  // Verify the member belongs to this household
  const [existing] = await db
    .select({ id: members.id })
    .from(members)
    .where(
      and(eq(members.id, memberId), eq(members.householdId, admin.householdId)),
    )
    .limit(1);

  if (!existing) {
    return { error: "Member not found" };
  }

  await db
    .update(members)
    .set({ name, avatarUrl: avatarUrl ?? null })
    .where(eq(members.id, memberId));

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteMember(
  _prevState: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = deleteMemberSchema.safeParse({
    memberId: Number(formData.get("memberId")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { memberId } = parsed.data;

  // Verify the member belongs to this household and is not an admin
  const [existing] = await db
    .select({ id: members.id, isAdmin: members.isAdmin })
    .from(members)
    .where(
      and(eq(members.id, memberId), eq(members.householdId, admin.householdId)),
    )
    .limit(1);

  if (!existing) {
    return { error: "Member not found" };
  }

  if (existing.isAdmin) {
    return { error: "Cannot delete the admin member" };
  }

  await db.delete(members).where(eq(members.id, memberId));

  revalidatePath("/settings");
  return { success: true };
}
