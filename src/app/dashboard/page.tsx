import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";
import { db } from "@/server/db";
import { chores } from "@/server/db/schema";
import { ChoreBoard } from "./chore-board";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const householdChores = await db
    .select({
      id: chores.id,
      name: chores.name,
      iconName: chores.iconName,
      iconStyle: chores.iconStyle,
      points: chores.points,
    })
    .from(chores)
    .where(eq(chores.householdId, session.householdId))
    .orderBy(chores.createdAt);

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
          <ChoreBoard chores={householdChores} />
        </section>
      </div>
    </main>
  );
}
