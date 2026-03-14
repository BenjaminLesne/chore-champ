"use server";

import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { chores, choreLogs, members } from "@/server/db/schema";
import { getSession } from "@/server/auth/session";
import { logChoreSchema, undoChoreLogSchema } from "./schemas";

export type ChoreLogActionState = {
  error?: string;
  success?: boolean;
};

export async function logChore(
  _prevState: ChoreLogActionState,
  formData: FormData,
): Promise<ChoreLogActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in" };
  }

  const parsed = logChoreSchema.safeParse({
    choreId: Number(formData.get("choreId")),
    memberId: Number(formData.get("memberId")),
    loggedAt: formData.get("loggedAt") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { choreId, memberId, loggedAt } = parsed.data;

  // Verify the chore belongs to this household
  const [chore] = await db
    .select({ id: chores.id, points: chores.points })
    .from(chores)
    .where(
      and(eq(chores.id, choreId), eq(chores.householdId, session.householdId)),
    )
    .limit(1);

  if (!chore) {
    return { error: "Chore not found" };
  }

  // Verify the member belongs to this household
  const [member] = await db
    .select({ id: members.id })
    .from(members)
    .where(
      and(
        eq(members.id, memberId),
        eq(members.householdId, session.householdId),
      ),
    )
    .limit(1);

  if (!member) {
    return { error: "Member not found" };
  }

  const loggedAtField = loggedAt ? { loggedAt: new Date(loggedAt) } : {};

  await db.insert(choreLogs).values({
    choreId,
    memberId,
    pointsEarned: chore.points,
    ...loggedAtField,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function undoChoreLog(
  _prevState: ChoreLogActionState,
  formData: FormData,
): Promise<ChoreLogActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "You must be logged in" };
  }

  const parsed = undoChoreLogSchema.safeParse({
    logId: Number(formData.get("logId")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { logId } = parsed.data;

  // Verify the log exists, belongs to this household, and is within the current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [log] = await db
    .select({ id: choreLogs.id })
    .from(choreLogs)
    .innerJoin(members, eq(choreLogs.memberId, members.id))
    .where(
      and(
        eq(choreLogs.id, logId),
        eq(members.householdId, session.householdId),
        gte(choreLogs.loggedAt, monthStart),
      ),
    )
    .limit(1);

  if (!log) {
    return { error: "Log not found or outside current month" };
  }

  await db.delete(choreLogs).where(eq(choreLogs.id, logId));

  revalidatePath("/dashboard");
  return { success: true };
}
