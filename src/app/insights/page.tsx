import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { chores, members, choreLogs } from "@/server/db/schema";
import { InsightsCharts } from "./insights-charts";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [householdMembers, weeklyData, monthlyData] = await Promise.all([
    db
      .select({ id: members.id, name: members.name })
      .from(members)
      .where(eq(members.householdId, session.householdId))
      .orderBy(members.createdAt),
    // Weekly aggregation: points per member per ISO week
    db
      .select({
        year: sql<number>`extract(isoyear from ${choreLogs.loggedAt})`.as(
          "log_year",
        ),
        week: sql<number>`extract(week from ${choreLogs.loggedAt})`.as(
          "log_week",
        ),
        memberId: choreLogs.memberId,
        totalPoints: sql<number>`coalesce(sum(${chores.points}), 0)`.as(
          "total_points",
        ),
        choreCount: sql<number>`count(*)`.as("chore_count"),
      })
      .from(choreLogs)
      .innerJoin(members, eq(choreLogs.memberId, members.id))
      .innerJoin(chores, eq(choreLogs.choreId, chores.id))
      .where(eq(members.householdId, session.householdId))
      .groupBy(
        sql`extract(isoyear from ${choreLogs.loggedAt})`,
        sql`extract(week from ${choreLogs.loggedAt})`,
        choreLogs.memberId,
      )
      .orderBy(sql`log_year asc`, sql`log_week asc`),
    // Monthly aggregation: points per member per month
    db
      .select({
        year: sql<number>`extract(year from ${choreLogs.loggedAt})`.as(
          "log_year",
        ),
        month: sql<number>`extract(month from ${choreLogs.loggedAt})`.as(
          "log_month",
        ),
        memberId: choreLogs.memberId,
        totalPoints: sql<number>`coalesce(sum(${chores.points}), 0)`.as(
          "total_points",
        ),
        choreCount: sql<number>`count(*)`.as("chore_count"),
      })
      .from(choreLogs)
      .innerJoin(members, eq(choreLogs.memberId, members.id))
      .innerJoin(chores, eq(choreLogs.choreId, chores.id))
      .where(eq(members.householdId, session.householdId))
      .groupBy(
        sql`extract(year from ${choreLogs.loggedAt})`,
        sql`extract(month from ${choreLogs.loggedAt})`,
        choreLogs.memberId,
      )
      .orderBy(sql`log_year asc`, sql`log_month asc`),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <a
            href="/dashboard"
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Back to Board
          </a>
        </div>

        <div className="mt-6">
          <InsightsCharts
            members={householdMembers}
            weeklyData={weeklyData}
            monthlyData={monthlyData}
          />
        </div>
      </div>
    </main>
  );
}
