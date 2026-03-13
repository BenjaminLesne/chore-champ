import { redirect } from "next/navigation";
import { eq, and, gte, desc } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";
import { db } from "@/server/db";
import { chores, members, choreLogs } from "@/server/db/schema";
import { ChoreBoard } from "./chore-board";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Start of current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [householdChores, householdMembers, recentLogs] = await Promise.all([
    db
      .select({
        id: chores.id,
        name: chores.name,
        iconName: chores.iconName,
        iconStyle: chores.iconStyle,
        points: chores.points,
      })
      .from(chores)
      .where(eq(chores.householdId, session.householdId))
      .orderBy(chores.createdAt),
    db
      .select({
        id: members.id,
        name: members.name,
      })
      .from(members)
      .where(eq(members.householdId, session.householdId))
      .orderBy(members.createdAt),
    db
      .select({
        id: choreLogs.id,
        choreId: choreLogs.choreId,
        memberId: choreLogs.memberId,
        pointsEarned: choreLogs.pointsEarned,
        loggedAt: choreLogs.loggedAt,
      })
      .from(choreLogs)
      .innerJoin(members, eq(choreLogs.memberId, members.id))
      .where(
        and(
          eq(members.householdId, session.householdId),
          gte(choreLogs.loggedAt, monthStart),
        ),
      )
      .orderBy(desc(choreLogs.loggedAt))
      .limit(20),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chore Board</h1>
          <div className="flex gap-2">
            <a
              href="/settings"
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Settings
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <section className="mt-6">
          <ChoreBoard
            chores={householdChores}
            members={householdMembers}
            recentLogs={recentLogs}
          />
        </section>
      </div>
    </main>
  );
}
