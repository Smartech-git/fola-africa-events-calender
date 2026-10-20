import * as z from "zod";

export const eventSearchSchema = z.object({
  search: z.string().trim().max(100, "Use no more than 100 characters."),
});

export type EventSearchValues = z.infer<typeof eventSearchSchema>;
