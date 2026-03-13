import { z } from "zod";

export const logChoreSchema = z.object({
  choreId: z.number().int().positive(),
  memberId: z.number().int().positive(),
});

export type LogChoreInput = z.infer<typeof logChoreSchema>;
