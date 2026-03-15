import { index, pgTableCreator, timestamp } from "drizzle-orm/pg-core";

/**
 * Multi-project schema: all tables prefixed with "chore-champ_"
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `chore-champ_${name}`);

export const households = createTable("household", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
  inviteCode: d.varchar("invite_code", { length: 8 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const members = createTable(
  "member",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    avatarUrl: d.varchar("avatar_url", { length: 512 }),
    householdId: d
      .integer("household_id")
      .notNull()
      .references(() => households.id),
    isAdmin: d.boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("member_household_idx").on(t.householdId)],
);

export const adminAccounts = createTable(
  "admin_account",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    email: d.varchar({ length: 256 }).notNull().unique(),
    passwordHash: d.varchar("password_hash", { length: 512 }).notNull(),
    householdId: d
      .integer("household_id")
      .notNull()
      .references(() => households.id),
    memberId: d
      .integer("member_id")
      .notNull()
      .references(() => members.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("admin_email_idx").on(t.email)],
);

export const chores = createTable(
  "chore",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    iconName: d.varchar("icon_name", { length: 64 }).notNull(),
    iconStyle: d
      .varchar("icon_style", { length: 16 })
      .notNull()
      .default("empty"),
    iconColor: d
      .varchar("icon_color", { length: 16 })
      .notNull()
      .default("#3b82f6"),
    points: d.integer().notNull(),
    householdId: d
      .integer("household_id")
      .notNull()
      .references(() => households.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("chore_household_idx").on(t.householdId)],
);

export const choreLogs = createTable(
  "chore_log",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    choreId: d
      .integer("chore_id")
      .notNull()
      .references(() => chores.id),
    memberId: d
      .integer("member_id")
      .notNull()
      .references(() => members.id),
    pointsEarned: d.integer("points_earned").notNull(),
    loggedAt: timestamp("logged_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("chore_log_member_idx").on(t.memberId),
    index("chore_log_chore_idx").on(t.choreId),
    index("chore_log_logged_at_idx").on(t.loggedAt),
  ],
);
