import { z } from "zod";

const sessionPayloadSchema = z.object({
  adminId: z.number(),
  householdId: z.number(),
  memberId: z.number(),
  isAdmin: z.boolean(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createSessionToken(
  payload: SessionPayload,
  secret?: string,
): Promise<string> {
  const data = btoa(JSON.stringify(payload));
  const resolvedSecret = secret ?? (await import("@/env")).env.SESSION_SECRET;
  const sig = await hmacSign(data, resolvedSecret);
  return `${data}.${sig}`;
}

export async function parseSessionToken(
  token: string,
  secret?: string,
): Promise<SessionPayload | null> {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;

  const data = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);

  const resolvedSecret = secret ?? (await import("@/env")).env.SESSION_SECRET;
  const expectedSig = await hmacSign(data, resolvedSecret);
  if (sig !== expectedSig) return null;

  const parsed = sessionPayloadSchema.safeParse(
    JSON.parse(atob(data)) as unknown,
  );
  return parsed.success ? parsed.data : null;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const { cookies } = await import("next/headers");
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: (await import("@/env")).env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return parseSessionToken(cookie.value);
}

export async function clearSession(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
