"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { chores } from "@/server/db/schema";
import { getSession } from "@/server/auth/session";
import {
  createChoreSchema,
  updateChoreSchema,
  deleteChoreSchema,
} from "./schemas";

export type ChoreActionState = {
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

export async function createChore(
  _prevState: ChoreActionState,
  formData: FormData,
): Promise<ChoreActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = createChoreSchema.safeParse({
    name: formData.get("name"),
    iconName: formData.get("iconName"),
    iconStyle: formData.get("iconStyle"),
    points: Number(formData.get("points")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, iconName, iconStyle, points } = parsed.data;

  await db.insert(chores).values({
    name,
    iconName,
    iconStyle,
    points,
    householdId: admin.householdId,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateChore(
  _prevState: ChoreActionState,
  formData: FormData,
): Promise<ChoreActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = updateChoreSchema.safeParse({
    choreId: Number(formData.get("choreId")),
    name: formData.get("name"),
    iconName: formData.get("iconName"),
    iconStyle: formData.get("iconStyle"),
    points: Number(formData.get("points")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { choreId, name, iconName, iconStyle, points } = parsed.data;

  // Verify the chore belongs to this household
  const [existing] = await db
    .select({ id: chores.id })
    .from(chores)
    .where(
      and(eq(chores.id, choreId), eq(chores.householdId, admin.householdId)),
    )
    .limit(1);

  if (!existing) {
    return { error: "Chore not found" };
  }

  await db
    .update(chores)
    .set({ name, iconName, iconStyle, points })
    .where(eq(chores.id, choreId));

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteChore(
  _prevState: ChoreActionState,
  formData: FormData,
): Promise<ChoreActionState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "You must be logged in as an admin" };
  }

  const parsed = deleteChoreSchema.safeParse({
    choreId: Number(formData.get("choreId")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { choreId } = parsed.data;

  // Verify the chore belongs to this household
  const [existing] = await db
    .select({ id: chores.id })
    .from(chores)
    .where(
      and(eq(chores.id, choreId), eq(chores.householdId, admin.householdId)),
    )
    .limit(1);

  if (!existing) {
    return { error: "Chore not found" };
  }

  // Delete the chore — historical chore_logs with points_earned are preserved
  await db.delete(chores).where(eq(chores.id, choreId));

  revalidatePath("/settings");
  return { success: true };
}
