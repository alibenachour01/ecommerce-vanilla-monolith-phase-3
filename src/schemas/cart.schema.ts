import { z } from "zod";
import { publicProductSchema } from "./product.schema";
import { publicUserSchema } from "./user.schema";

export const CartBaseSchema = z.object({
	id: z.uuid(),
	products: z.array(publicProductSchema),
	creator: publicUserSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getCartByIdSchema = z.object({
	id: z.uuid("Invalid cart ID format"),
});

export const publicCartSchema = CartBaseSchema.omit({ createdAt: true, updatedAt: true }).extend({
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type PublicCart = z.infer<typeof publicCartSchema>;
