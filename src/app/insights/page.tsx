import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { chores, members, choreLogs } from "@/server/db/schema";
import { InsightsCharts } from "./insights-charts";
import { PeriodSelector, type Period } from "./period-selector";
import {
  getMemberDailyStats,
  getMemberChoreBreakdown,
  type ChoreBreakdownEntry,
} from "./queries";
import { MemberAvgChart } from "./member-avg-chart";
import { ChoreBreakdownChart } from "./chore-breakdown-chart";

const VALID_PERIODS: Period[] = ["30d", "3m", "6m", "all"];

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const periodParam = params.period ?? "";
  const period: Period = VALID_PERIODS.find((p) => p === periodParam) ?? "30d";

  const [
    householdMembers,
    weeklyData,
    monthlyData,
    memberDailyStats,
    choreBreakdownMap,
  ] = await Promise.all([
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
        totalPoints: sql<number>`coalesce(sum(${chores.points}), 0)::int`.as(
          "total_points",
        ),
        choreCount: sql<number>`count(*)::int`.as("chore_count"),
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
        totalPoints: sql<number>`coalesce(sum(${chores.points}), 0)::int`.as(
          "total_points",
        ),
        choreCount: sql<number>`count(*)::int`.as("chore_count"),
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
    getMemberDailyStats(session.householdId, period),
    getMemberChoreBreakdown(session.householdId, period),
  ]);

  // Convert Map to plain object for serialization to client component
  const breakdownByMember: Record<string, ChoreBreakdownEntry[]> = {};
  for (const [memberId, entries] of choreBreakdownMap) {
    breakdownByMember[memberId.toString()] = entries;
  }

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

        <div className="mt-8">
          <PeriodSelector />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Average Chores per Day
          </h2>
          <MemberAvgChart data={memberDailyStats} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Chore Breakdown
          </h2>
          <ChoreBreakdownChart
            members={householdMembers}
            breakdownByMember={breakdownByMember}
          />
        </div>
      </div>
    </main>
  );
}
