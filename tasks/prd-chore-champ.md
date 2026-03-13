# PRD: Chore Champ

## Introduction

Chore Champ is a household chore management app where users log chores from a shared board to earn points. One admin creates the household account and adds member profiles — the admin also participates as a member. Chores are defined with custom icons (empty/fill style) and point values. Points reset automatically on the 1st of each month, and the app crowns a winner based on total points. Members can undo accidental chore logs. A trends page provides weekly/monthly charts showing chore activity and scores over time.

## Goals

- Allow a household admin to create an account and manage member profiles
- Provide a shared chore board where any member can log a chore as done
- Support custom chore creation with icon selection (empty/fill variants) and configurable point values
- Automatically determine the monthly winner (highest scorer)
- Display weekly and monthly trend charts for chore activity and scores per user

## User Stories

### US-001: Admin account creation
**Description:** As a household admin, I want to create an account so that I can set up my household.

**Acceptance Criteria:**
- [ ] Admin can register with email and password
- [ ] A household is created upon registration
- [ ] A member profile is automatically created for the admin in the household
- [ ] Admin is redirected to the household dashboard after sign-up
- [ ] Typecheck/lint passes

### US-002: Manage member profiles
**Description:** As an admin, I want to add, edit, and remove member profiles so that everyone in the household is represented.

**Acceptance Criteria:**
- [ ] Admin can create a member profile with a name and optional avatar
- [ ] Admin can edit a member's name/avatar
- [ ] Admin can delete a member profile
- [ ] Members appear in a list on the household settings page
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: Create a chore
**Description:** As an admin, I want to create a chore with an icon and point value so that it appears on the shared board.

**Acceptance Criteria:**
- [ ] Form to create a chore with: name, icon selection, point value
- [ ] Icon picker shows available icons in empty/fill style: washing machine, dishwasher, garbage
- [ ] Point value is a positive integer
- [ ] New chore appears on the board immediately after creation
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: Edit and delete a chore
**Description:** As an admin, I want to edit or delete a chore so that the board stays up to date.

**Acceptance Criteria:**
- [ ] Admin can edit a chore's name, icon, and point value
- [ ] Admin can delete a chore from the board
- [ ] Deleting a chore does not remove past logs of that chore
- [ ] Confirmation dialog shown before deletion
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: Log a chore as done
**Description:** As a household member, I want to tap a chore on the board and log it as done so that I earn points.

**Acceptance Criteria:**
- [ ] Member selects their profile before or during logging
- [ ] Tapping a chore on the board opens a confirmation to log it
- [ ] The log records: chore, member, timestamp, points earned
- [ ] Points are added to the member's monthly total
- [ ] Recent logs are visible on the board
- [ ] Member can undo/remove their own chore log (within the current month)
- [ ] Undoing a log deducts the points from the member's monthly total
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-006: Monthly winner calculation
**Description:** As a household member, I want to see who won the current/previous month so that we know the chore champion.

**Acceptance Criteria:**
- [ ] App calculates total points per member for the current month
- [ ] The member with the highest score is displayed as the winner
- [ ] Winner is highlighted on the dashboard (name, score, visual indicator)
- [ ] Users can view previous months' winners
- [ ] Ties are handled (show all tied members as co-winners)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: Database schema
**Description:** As a developer, I need to define the database tables for households, members, chores, and chore logs.

**Acceptance Criteria:**
- [ ] `household` table: id, name, created_at
- [ ] `admin_account` table: id, email, password_hash, household_id, member_id (FK to member), created_at
- [ ] `member` table: id, name, avatar_url, household_id, is_admin, created_at
- [ ] `chore` table: id, name, icon_name (washing_machine, dishwasher, garbage), icon_style (empty/fill), points, household_id, created_at
- [ ] `chore_log` table: id, chore_id, member_id, points_earned, logged_at
- [ ] Migrations generated and applied successfully
- [ ] Typecheck passes

### US-008: Insights page — trend charts
**Description:** As a household member, I want to see charts showing chore trends over time so that I understand the household's activity.

**Acceptance Criteria:**
- [ ] Page displays a line chart of points per member over weeks/months
- [ ] Bar chart showing average chores per member
- [ ] Users can toggle between weekly and monthly view
- [ ] Charts update when new logs are added
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-009: Chore board page
**Description:** As a household member, I want a main board page showing all available chores so that I can quickly log what I've done.

**Acceptance Criteria:**
- [ ] Board displays all chores as cards with their icon and point value
- [ ] Icons render in the correct empty/fill style
- [ ] Cards are tappable to log the chore
- [ ] Current month's scoreboard is visible alongside the board
- [ ] Responsive layout works on mobile and desktop
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Admin can register with email/password, creating a household automatically
- FR-2: Admin can create, edit, and delete member profiles within their household
- FR-3: Admin can create, edit, and delete chores with a name, icon (empty/fill style), and point value
- FR-4: Any member (including the admin) can log a chore as done, recording the chore, member, timestamp, and points
- FR-5: Members can undo/remove their own chore logs within the current month
- FR-6: The app calculates the monthly winner as the member with the highest total points for that month; scores reset automatically on the 1st
- FR-7: The board page displays all chores as icon cards with point values
- FR-8: The insights page shows line charts (points over time) and bar charts (average chores per member) with weekly/monthly toggle
- FR-9: Deleting a chore preserves its historical logs
- FR-10: The dashboard shows the current month's scoreboard and winner
- FR-11: Upon registration, admin is automatically added as a member of the household

## Non-Goals

- No recurring/scheduled chores — the board is a shared pool, anyone logs anytime
- No push notifications or reminders
- No in-app rewards or badges beyond the winner highlight
- No multi-household support per admin account
- No member-level authentication — members are profiles managed by the admin
- No real-time updates (standard request/response is fine)

## Design Considerations

- Icon set: pre-defined SVG icons with empty/fill variants — initial set: washing machine, dishwasher, garbage
- Mobile-first responsive design using Tailwind CSS
- Simple, clean UI — large tappable chore cards for easy logging
- Winner highlight should feel celebratory (larger display, distinct color)

## Technical Considerations

- **Stack:** Next.js 16 (App Router), Drizzle ORM, PostgreSQL, Tailwind CSS v4
- **Auth:** Simple email/password for admin (consider next-auth or a lightweight custom solution)
- **Charts:** Use a lightweight charting library (e.g., recharts or chart.js with react-chartjs-2)
- **Icons:** Custom SVG icon components with empty/fill props
- **Schema prefix:** All tables use `chore-champ_` prefix (already configured in Drizzle)

## Success Metrics

- Admin can set up a household with members and chores in under 3 minutes
- Logging a chore takes a single tap + confirmation
- Winner is visible on the dashboard without extra navigation
- Insights charts load in under 2 seconds

## Open Questions

_All previously open questions have been resolved._
