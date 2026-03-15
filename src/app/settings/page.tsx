import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";
import { db } from "@/server/db";
import { households, members, chores } from "@/server/db/schema";
import { MemberList } from "./member-list";
import { ChoreList } from "./chore-list";
import { InviteCodeSection } from "./invite-code-section";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const [householdMembers, householdChores, [household]] = await Promise.all([
    db
      .select({
        id: members.id,
        name: members.name,
        avatarUrl: members.avatarUrl,
        isAdmin: members.isAdmin,
      })
      .from(members)
      .where(eq(members.householdId, session.householdId))
      .orderBy(members.createdAt),
    db
      .select({
        id: chores.id,
        name: chores.name,
        iconName: chores.iconName,
        iconStyle: chores.iconStyle,
        iconColor: chores.iconColor,
        points: chores.points,
      })
      .from(chores)
      .where(eq(chores.householdId, session.householdId))
      .orderBy(chores.createdAt),
    db
      .select({ inviteCode: households.inviteCode })
      .from(households)
      .where(eq(households.id, session.householdId))
      .limit(1),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Household Settings
          </h1>
          <div className="flex gap-2">
            <a
              href="/dashboard"
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Dashboard
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

        {household && (
          <section className="mt-8">
            <InviteCodeSection initialCode={household.inviteCode} />
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <MemberList
            members={householdMembers}
            currentMemberId={session.memberId}
          />
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Chores</h2>
          <ChoreList chores={householdChores} />
        </section>
      </div>
    </main>
  );
}
