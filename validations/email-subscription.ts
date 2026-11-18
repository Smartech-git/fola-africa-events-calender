import * as z from "zod";

export const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .max(254)
    .pipe(z.email("Enter a valid email address.")),
  // Hidden from people; a bot that fills every field gives itself away.
  company: z.string().max(200).optional(),
});
export type SubscribeValues = z.infer<typeof subscribeSchema>;
