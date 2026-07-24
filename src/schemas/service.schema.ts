import { z } from "zod";

export const ServiceFilterSchema = z.object({
  search: z.string().optional().default(""),
  sort: z.enum(["price-low", "price-high", "popular", ""]).optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  price: z.string().optional().default(""),
  delivery: z.string().optional().default(""),
});

export type ServiceFilterParams = z.infer<typeof ServiceFilterSchema>;
