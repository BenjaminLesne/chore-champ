"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { adminAccounts, households, members } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { generateInviteCode } from "./invite-code";
import { loginSchema, registerSchema, joinSchema } from "./schemas";
import { clearSession, getSession, setSessionCookie } from "./session";

export type AuthState = {
  error?: string;
};

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    householdName: formData.get("householdName"),
    memberName: formData.get("memberName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, password, householdName, memberName } = parsed.data;

  // Check if email already exists
  const existing = await db
    .select({ id: adminAccounts.id })
    .from(adminAccounts)
    .where(eq(adminAccounts.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);

  // Create household, member, and admin account in a transaction
  const result = await db.transaction(async (tx) => {
    const [household] = await tx
      .insert(households)
      .values({ name: householdName, inviteCode: generateInviteCode() })
      .returning({ id: households.id });

    if (!household) throw new Error("Failed to create household");

    const [member] = await tx
      .insert(members)
      .values({
        name: memberName,
        householdId: household.id,
        isAdmin: true,
      })
      .returning({ id: members.id });

    if (!member) throw new Error("Failed to create member");

    const [admin] = await tx
      .insert(adminAccounts)
      .values({
        email,
        passwordHash,
        householdId: household.id,
        memberId: member.id,
      })
      .returning({ id: adminAccounts.id });

    if (!admin) throw new Error("Failed to create admin account");

    return {
      adminId: admin.id,
      householdId: household.id,
      memberId: member.id,
      isAdmin: true,
    };
  });

  await setSessionCookie(result);
  redirect("/dashboard");
}

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  const [account] = await db
    .select({
      id: adminAccounts.id,
      passwordHash: adminAccounts.passwordHash,
      householdId: adminAccounts.householdId,
      memberId: adminAccounts.memberId,
      isAdmin: members.isAdmin,
    })
    .from(adminAccounts)
    .innerJoin(members, eq(adminAccounts.memberId, members.id))
    .where(eq(adminAccounts.email, email))
    .limit(1);

  if (!account) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await setSessionCookie({
    adminId: account.id,
    householdId: account.householdId,
    memberId: account.memberId,
    isAdmin: account.isAdmin,
  });
  redirect("/dashboard");
}

export async function joinHousehold(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = joinSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
    email: formData.get("email"),
    password: formData.get("password"),
    memberName: formData.get("memberName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { inviteCode, email, password, memberName } = parsed.data;

  // Look up household by invite code
  const [household] = await db
    .select({ id: households.id })
    .from(households)
    .where(eq(households.inviteCode, inviteCode))
    .limit(1);

  if (!household) {
    return { error: "Invalid invite code" };
  }

  // Check email uniqueness
  const existing = await db
    .select({ id: adminAccounts.id })
    .from(adminAccounts)
    .where(eq(adminAccounts.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);

  const result = await db.transaction(async (tx) => {
    const [member] = await tx
      .insert(members)
      .values({
        name: memberName,
        householdId: household.id,
        isAdmin: false,
      })
      .returning({ id: members.id });

    if (!member) throw new Error("Failed to create member");

    const [account] = await tx
      .insert(adminAccounts)
      .values({
        email,
        passwordHash,
        householdId: household.id,
        memberId: member.id,
      })
      .returning({ id: adminAccounts.id });

    if (!account) throw new Error("Failed to create account");

    return {
      adminId: account.id,
      householdId: household.id,
      memberId: member.id,
      isAdmin: false,
    };
  });

  await setSessionCookie(result);
  redirect("/dashboard");
}

export async function regenerateInviteCode(): Promise<{
  error?: string;
  inviteCode?: string;
}> {
  const session = await getSession();
  if (!session?.isAdmin) {
    return { error: "Only admins can regenerate invite codes" };
  }

  const newCode = generateInviteCode();
  await db
    .update(households)
    .set({ inviteCode: newCode })
    .where(eq(households.id, session.householdId));

  return { inviteCode: newCode };
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
