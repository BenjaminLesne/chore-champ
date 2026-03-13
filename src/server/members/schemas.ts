import { z } from "zod";

const avatarUrlField = z
  .union([z.string(), z.undefined()])
  .transform((v) => (v === "" || v === undefined ? undefined : v))
  .pipe(z.string().url("Invalid URL").max(512).optional());

export const createMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  avatarUrl: avatarUrlField,
});

export const updateMemberSchema = z.object({
  memberId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(256),
  avatarUrl: avatarUrlField,
});

export const deleteMemberSchema = z.object({
  memberId: z.number().int().positive(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>;
