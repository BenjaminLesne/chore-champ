import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { chores, choreLogs, members } from "@/server/db/schema";
import type { Period } from "./period-selector";
import {
  periodStartDate,
  periodCalendarDays,
  computeAvgAndStddev,
} from "./period-utils";

export type MemberDailyStat = {
  memberId: number;
  memberName: string;
  totalLogs: number;
  calendarDays: number;
  avg: number;
  stddev: number;
};

export type ChoreBreakdownEntry = {
  choreId: number;
  choreName: string;
  choreIconName: string;
  choreIconColor: string;
  count: number;
};

/**
 * For each household member, returns avg chores/day and standard deviation
 * for the given time period.
 */
export async function getMemberDailyStats(
  householdId: number,
  period: Period,
): Promise<MemberDailyStat[]> {
  const startDate = periodStartDate(period);

  const conditions = [eq(members.householdId, householdId)];
  if (startDate) {
    conditions.push(gte(choreLogs.loggedAt, startDate));
  }

  // Get daily chore counts per member
  const dailyCounts = await db
    .select({
      memberId: choreLogs.memberId,
      day: sql<string>`date(${choreLogs.loggedAt})`.as("log_day"),
      count: sql<number>`count(*)::int`.as("day_count"),
    })
    .from(choreLogs)
    .innerJoin(members, eq(choreLogs.memberId, members.id))
    .innerJoin(chores, eq(choreLogs.choreId, chores.id))
    .where(and(...conditions))
    .groupBy(choreLogs.memberId, sql`date(${choreLogs.loggedAt})`);

  // Get all household members (so members with 0 logs still appear)
  const householdMembers = await db
    .select({ id: members.id, name: members.name })
    .from(members)
    .where(eq(members.householdId, householdId))
    .orderBy(members.createdAt);

  // For "all" period, compute days from earliest log to today
  let calendarDays: number;
  if (period === "all") {
    const earliest = await db
      .select({
        minDate: sql<string>`min(date(${choreLogs.loggedAt}))`.as("min_date"),
      })
      .from(choreLogs)
      .innerJoin(members, eq(choreLogs.memberId, members.id))
      .innerJoin(chores, eq(choreLogs.choreId, chores.id))
      .where(eq(members.householdId, householdId));

    if (earliest[0]?.minDate) {
      const minDate = new Date(earliest[0].minDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      calendarDays =
        Math.floor((today.getTime() - minDate.getTime()) / 86_400_000) + 1;
    } else {
      calendarDays = 1;
    }
  } else {
    calendarDays = periodCalendarDays(period);
  }

  // Group daily counts by member
  const countsByMember = new Map<number, number[]>();
  for (const row of dailyCounts) {
    const existing = countsByMember.get(row.memberId) ?? [];
    existing.push(row.count);
    countsByMember.set(row.memberId, existing);
  }

  // Compute avg and stddev for each member
  return householdMembers.map((member) => {
    const counts = countsByMember.get(member.id) ?? [];
    const { totalLogs, avg, stddev } = computeAvgAndStddev(
      counts,
      calendarDays,
    );

    return {
      memberId: member.id,
      memberName: member.name,
      totalLogs,
      calendarDays,
      avg,
      stddev,
    };
  });
}

/**
 * For each member, returns chore counts grouped by chore, sorted descending.
 */
export async function getMemberChoreBreakdown(
  householdId: number,
  period: Period,
): Promise<Map<number, ChoreBreakdownEntry[]>> {
  const startDate = periodStartDate(period);

  const conditions = [eq(members.householdId, householdId)];
  if (startDate) {
    conditions.push(gte(choreLogs.loggedAt, startDate));
  }

  const rows = await db
    .select({
      memberId: choreLogs.memberId,
      choreId: chores.id,
      choreName: chores.name,
      choreIconName: chores.iconName,
      choreIconColor: chores.iconColor,
      count: sql<number>`count(*)::int`.as("chore_count"),
    })
    .from(choreLogs)
    .innerJoin(members, eq(choreLogs.memberId, members.id))
    .innerJoin(chores, eq(choreLogs.choreId, chores.id))
    .where(and(...conditions))
    .groupBy(
      choreLogs.memberId,
      chores.id,
      chores.name,
      chores.iconName,
      chores.iconColor,
    )
    .orderBy(sql`chore_count desc`);

  // Group by member
  const byMember = new Map<number, ChoreBreakdownEntry[]>();

  for (const row of rows) {
    const existing = byMember.get(row.memberId) ?? [];
    existing.push({
      choreId: row.choreId,
      choreName: row.choreName,
      choreIconName: row.choreIconName,
      choreIconColor: row.choreIconColor,
      count: row.count,
    });
    byMember.set(row.memberId, existing);
  }

  return byMember;
}
