import { z } from "zod";

// Base user schema for common fields
const baseUserSchema = z.object({
	id: z.uuid(),
	email: z.email("Invalid email format"),
	role: z.enum(["user", "admin"]).default("user"),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Password validation schema
const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		"Password must contain at least one lowercase letter, one uppercase letter, and one number",
	);

// Input validation schemas
export const registerUserSchema = z.object({
	email: z.email("Invalid email format").trim().toLowerCase(),
	password: passwordSchema,
});

// Login validation schema
export const loginUserSchema = z.object({
	email: z.email("Invalid email format").trim().toLowerCase(),
	password: z.string().min(1, "Password is required"),
});

// Get user by ID validation schema
export const getUserByIdSchema = z.object({
	id: z.uuid("Invalid user ID format"),
});

// Output validation schemas
export const publicUserSchema = baseUserSchema.omit({ createdAt: true, updatedAt: true, role: true }).extend({
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

// Output schema for authenticated user
export const authenticatedUserSchema = baseUserSchema.omit({ createdAt: true, updatedAt: true }).extend({
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

// Update user schema (for future use)
export const updateUserSchema = z
	.object({
		email: z.email("Invalid email format").trim().toLowerCase().optional(),
		password: passwordSchema.optional(),
		role: z.enum(["user", "admin"]).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// Input types
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
// Output types
export type PublicUser = z.infer<typeof publicUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

// Validation helper functions
export const validateRegisterInput = (data: unknown): RegisterUserInput => {
	return registerUserSchema.parse(data);
};

export const validateLoginInput = (data: unknown): LoginUserInput => {
	return loginUserSchema.parse(data);
};

export const validateGetUserByIdInput = (data: unknown): GetUserByIdInput => {
	return getUserByIdSchema.parse(data);
};

export const validateUpdateUserInput = (data: unknown): UpdateUserInput => {
	return updateUserSchema.parse(data);
};
