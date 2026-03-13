"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { adminAccounts, households, members } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { loginSchema, registerSchema } from "./schemas";
import { clearSession, setSessionCookie } from "./session";

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
      .values({ name: householdName })
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

    return { adminId: admin.id, householdId: household.id };
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

  const [admin] = await db
    .select({
      id: adminAccounts.id,
      passwordHash: adminAccounts.passwordHash,
      householdId: adminAccounts.householdId,
    })
    .from(adminAccounts)
    .where(eq(adminAccounts.email, email))
    .limit(1);

  if (!admin) {
    return { error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  await setSessionCookie({ adminId: admin.id, householdId: admin.householdId });
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
