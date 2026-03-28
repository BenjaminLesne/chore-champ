# PRD: Per-Member Stats on Insights Page

## Introduction

Add detailed per-member statistics to the existing `/insights` page so household members can compare their chore habits. The stats include average chores per day (with standard deviation), and a ranked breakdown of which chores each member does most. All stats are scoped per member with a selectable time period.

## Goals

- Show average chores per day per member with standard deviation to measure consistency
- Display each member's chore breakdown sorted by most done
- Allow selecting different time periods (last 30 days, last 3 months, all-time)
- Present data as graphs by default, with a member selector fallback when graphs aren't suitable
- All stats are per-member to enable direct comparison between household members

## User Stories

### US-001: Add time period selector to insights page

**Description:** As a user, I want to choose a time period for the stats so I can look at recent activity or all-time trends.

**Acceptance Criteria:**

- [ ] Add a period selector with options: "Last 30 days", "Last 3 months", "Last 6 months", "All time"
- [ ] Selector applies to the new stats sections (existing charts can keep their own toggle)
- [ ] Selected period persists in URL search params (via nuqs)
- [ ] Default is "Last 30 days"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-002: Average chores per day per member graph

**Description:** As a user, I want to see a bar chart comparing the average number of chores per day for each member, with standard deviation, so I can see who's contributing and how consistently.

**Acceptance Criteria:**

- [ ] Bar chart (Recharts) showing one bar per member with avg chores/day as the value
- [ ] Standard deviation shown as text label on or next to each bar (e.g. "3.2/day ± 1.5")
- [ ] Tooltip on hover shows: member name, exact average (1 decimal), std deviation (1 decimal)
- [ ] Chart respects the selected time period
- [ ] Empty state when no data exists for the selected period
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Chore breakdown per member

**Description:** As a user, I want to see which chores each member does most, sorted from most to least, so I can understand everyone's contribution patterns.

**Acceptance Criteria:**

- [ ] For each member, show a horizontal bar chart of their chores sorted by count (descending)
- [ ] Each bar shows chore icon, chore name, and count
- [ ] Use the chore's configured icon color for the bar
- [ ] Member selector to switch between members (since one chart per member)
- [ ] Chart respects the selected time period
- [ ] Empty state when a member has no logs in the selected period
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Server-side data queries for member stats

**Description:** As a developer, I need efficient database queries to compute per-member averages, standard deviations, and chore counts for a given time range.

**Acceptance Criteria:**

- [ ] Query: for each member, return total chore logs and distinct active days in the period (avg = total / days in period, stddev computed from daily counts)
- [ ] Query: for each member, return chore counts grouped by chore, sorted descending
- [ ] Both queries filter by householdId and the selected time range
- [ ] Both queries only count members belonging to the current household
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Add a period selector component to the insights page with options: "Last 30 days", "Last 3 months", "Last 6 months", "All time"
- FR-2: Compute average chores per day per member as: (total chore logs in period) / (number of calendar days in period). Days with zero chores count as 0, not skipped.
- FR-3: Compute standard deviation of daily chore count per member across all calendar days in the period
- FR-4: Display a bar chart comparing avg chores/day across all members, with std deviation as text label (e.g. "± 1.5")
- FR-5: Display a per-member chore breakdown as a horizontal bar chart, sorted by count descending, with a member selector to switch between members
- FR-6: All stats are filtered by the selected time period and the user's household
- FR-7: Only show chores that currently exist — deleted chores are excluded from all stats

## Non-Goals

- No household-level aggregate stats (totals across all members combined)
- No gamification or ranking badges — this is informational only
- No export or sharing of stats
- No notification or alerting based on stats
- No changes to the existing points-over-time or avg-chores-per-period charts already on insights

## Design Considerations

- Place the new sections below the existing charts on the `/insights` page
- Reuse the existing Recharts setup and color palette from `insights-charts.tsx`
- Use the same card/section styling as existing insight sections
- The member selector for chore breakdown should use the existing member list from the household
- Use the chore icon color (`iconColor` field) for the chore breakdown bars

## Technical Considerations

- Use Drizzle ORM queries joining `choreLogs`, `members`, and `chores` tables
- Standard deviation can be computed in JS from daily counts (no need for PostgreSQL `stddev`)
- Period filtering uses `choreLogs.loggedAt` with date boundaries
- Use nuqs for URL-persisted period selection, consistent with existing month/view params
- Server component fetches data, client component renders charts (same pattern as existing insights)

## Success Metrics

- Users can compare avg chores/day across members at a glance
- Users can identify each member's most-done chores in under 2 clicks
- Stats load within existing page performance expectations (no separate page load)

## Open Questions

None.
