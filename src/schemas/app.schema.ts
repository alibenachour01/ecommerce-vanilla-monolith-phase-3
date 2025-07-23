import { z } from "zod";
import { BadRequestError } from "../errors/app.error";

export const PaginatedRequestSchema = z.object({
	page: z
		.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().positive())
		.default(1)
		.refine((val) => val > 0, {
			message: "Page must be a positive integer",
		}),
	limit: z
		.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().positive().max(100))
		.default(10)
		.refine((val) => val > 0 && val <= 100, {
			message: "Limit must be a positive integer between 1 and 100",
		}),
});

export type PaginatedRequestInput = z.infer<typeof PaginatedRequestSchema>;

export const safeParsePaginatedRequest = (data: unknown): PaginatedRequestInput => {
	const result = PaginatedRequestSchema.safeParse(data);
	if (!result.success) {
		throw new BadRequestError(`Invalid paginated request: ${result.error.message}`);
	}
	return result.data;
};
