import { z } from "zod";

export const logChoreSchema = z.object({
  choreId: z.number().int().positive(),
  memberId: z.number().int().positive(),
  loggedAt: z.string().date().optional(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export type LogChoreInput = z.infer<typeof logChoreSchema>;

export const undoChoreLogSchema = z.object({
  logId: z.number().int().positive(),
});

export type UndoChoreLogInput = z.infer<typeof undoChoreLogSchema>;
