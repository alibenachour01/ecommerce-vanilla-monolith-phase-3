import { z } from "zod";

export const SessionBaseSchema = z.object({
	sessionId: z.uuid(),
	userId: z.uuid().optional(),
	ip: z
		.string()
		.regex(
			/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?!$)|$)){4}$|^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/,
			"Invalid IP address",
		),
	userAgent: z.string(),
	createdAt: z.date(),
	lastActivity: z.date(),
	isAuthenticated: z.boolean(),
	cart: z
		.object({
			items: z.array(
				z.object({
					productId: z.uuid(),
					quantity: z.number().positive().min(1),
				}),
			),
		})
		.optional(),
});

export const SessionCreateSchema = SessionBaseSchema.omit({
	sessionId: true,
	createdAt: true,
	lastActivity: true,
	isAuthenticated: true,
});

export const SessionUpdateSchema = z.object({
	userId: z.uuid().optional(),
	cart: z.object({
		items: z.array(
			z.object({
				productId: z.uuid(),
				quantity: z.number().positive().min(1),
			}),
		),
	}),
});

// Types

export type SessionOutput = z.infer<typeof SessionBaseSchema>;
export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;
// helpers

export function validateSessionType(data: unknown): SessionOutput {
	return SessionBaseSchema.parse(data);
}

export function validateSessionUpdateInput(data: unknown): SessionUpdateInput {
	return SessionUpdateSchema.parse(data);
}

export function validateSessionUpdateInputSafe(data: unknown) {
	return SessionUpdateSchema.safeParse(data);
}
