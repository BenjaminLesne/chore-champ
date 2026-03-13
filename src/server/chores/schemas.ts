import { z } from "zod";

const iconNameField = z.enum(["washing_machine", "dishwasher", "garbage"], {
  errorMap: () => ({ message: "Invalid icon name" }),
});

const iconStyleField = z.enum(["empty", "fill"], {
  errorMap: () => ({ message: "Invalid icon style" }),
});

export const createChoreSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  iconName: iconNameField,
  iconStyle: iconStyleField,
  points: z.number().int().positive("Points must be a positive integer"),
});

export const updateChoreSchema = z.object({
  choreId: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(256),
  iconName: iconNameField,
  iconStyle: iconStyleField,
  points: z.number().int().positive("Points must be a positive integer"),
});

export const deleteChoreSchema = z.object({
  choreId: z.number().int().positive(),
});

export type CreateChoreInput = z.infer<typeof createChoreSchema>;
export type UpdateChoreInput = z.infer<typeof updateChoreSchema>;
export type DeleteChoreInput = z.infer<typeof deleteChoreSchema>;
