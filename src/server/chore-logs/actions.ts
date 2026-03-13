"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { chores, choreLogs, members } from "@/server/db/schema";
import { getSession } from "@/server/auth/session";
import { logChoreSchema } from "./schemas";

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
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { choreId, memberId } = parsed.data;

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

  await db.insert(choreLogs).values({
    choreId,
    memberId,
    pointsEarned: chore.points,
  });

  revalidatePath("/dashboard");
  return { success: true };
}
