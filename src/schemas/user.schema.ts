import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Base user schema for common fields
const baseUserSchema = z.object({
	id: z.uuid().openapi({
		description: "User ID",
		example: "550e8400-e29b-41d4-a716-446655440000",
	}),
	email: z.email("Invalid email format").openapi({
		description: "User email address",
		example: "user@example.com",
	}),
	role: z.enum(["user", "admin"]).default("user").openapi({
		description: "User role",
		example: "user",
	}),
	createdAt: z.date().openapi({
		description: "User creation timestamp",
		type: "string",
		format: "date-time",
		example: "2023-01-01T00:00:00.000Z",
	}),
	updatedAt: z.date().openapi({
		description: "User last update timestamp",
		type: "string",
		format: "date-time",
		example: "2023-01-01T00:00:00.000Z",
	}),
});

// Password validation schema
const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
		"Password must contain at least one lowercase letter, one uppercase letter, and one number",
	)
	.openapi({
		description:
			"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
		example: "StrongPassword123",
		minLength: 8,
	});

// Input validation schemas
export const registerUserSchema = z
	.object({
		email: z.email("Invalid email format").trim().toLowerCase().openapi({
			description: "User email address",
			example: "user@example.com",
		}),
		password: passwordSchema,
	})
	.openapi({
		title: "RegisterRequest",
		description: "User registration request",
	});

// Login validation schema
export const loginUserSchema = z
	.object({
		email: z.email("Invalid email format").trim().toLowerCase().openapi({
			description: "User email address",
			example: "user@example.com",
		}),
		password: z.string().min(1, "Password is required").openapi({
			description: "User password",
			example: "StrongPassword123",
		}),
	})
	.openapi({
		title: "LoginRequest",
		description: "User login request",
	});

// Get user by ID validation schema
export const getUserByIdSchema = z
	.object({
		id: z.uuid("Invalid user ID format").openapi({
			description: "User ID",
			example: "550e8400-e29b-41d4-a716-446655440000",
		}),
	})
	.openapi({
		title: "GetUserByIdParams",
		description: "Parameters for getting user by ID",
	});

// Output validation schemas
export const publicUserSchema = baseUserSchema
	.omit({ createdAt: true, updatedAt: true, role: true })
	.extend({
		createdAt: z.iso.datetime().openapi({
			description: "User creation timestamp",
			example: "2023-01-01T00:00:00.000Z",
		}),
		updatedAt: z.iso.datetime().openapi({
			description: "User last update timestamp",
			example: "2023-01-01T00:00:00.000Z",
		}),
	})
	.openapi({
		title: "User",
		description: "Public user information",
	});

// Output schema for authenticated user
export const authenticatedUserSchema = baseUserSchema
	.omit({ createdAt: true, updatedAt: true })
	.extend({
		createdAt: z.iso.datetime().openapi({
			description: "User creation timestamp",
			example: "2023-01-01T00:00:00.000Z",
		}),
		updatedAt: z.iso.datetime().openapi({
			description: "User last update timestamp",
			example: "2023-01-01T00:00:00.000Z",
		}),
	})
	.openapi({
		title: "AuthenticatedUser",
		description: "Authenticated user information with role",
	});

// Login response schema
export const loginResponseSchema = publicUserSchema
	.extend({
		token: z.string().openapi({
			description: "JWT authentication token",
			example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		}),
	})
	.openapi({
		title: "LoginResponse",
		description: "Login response with user data and JWT token",
	});

// Error schemas
export const errorSchema = z
	.object({
		error: z.string().openapi({
			description: "Error message",
			example: "Invalid email or password",
		}),
		statusCode: z.number().optional().openapi({
			description: "HTTP status code",
			example: 400,
		}),
	})
	.openapi({
		title: "Error",
		description: "Standard error response",
	});

export const validationErrorSchema = z
	.object({
		error: z.string().openapi({
			description: "Validation error message",
			example: "Validation failed",
		}),
		details: z
			.object({
				validationErrors: z.array(
					z.object({
						field: z.string().openapi({
							description: "Field that failed validation",
							example: "email",
						}),
						message: z.string().openapi({
							description: "Validation error message",
							example: "Invalid email format",
						}),
					}),
				),
			})
			.openapi({
				description: "Detailed validation error information",
			}),
	})
	.openapi({
		title: "ValidationError",
		description: "Validation error response with detailed field errors",
	});

// Update user schema (for future use)
export const updateUserSchema = z
	.object({
		email: z.email("Invalid email format").trim().toLowerCase().optional().openapi({
			description: "User email address",
			example: "user@example.com",
		}),
		password: passwordSchema.optional(),
		role: z.enum(["user", "admin"]).optional().openapi({
			description: "User role",
			example: "user",
		}),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	})
	.openapi({
		title: "UpdateUserRequest",
		description: "User update request",
	});

// Input types
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Output types
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ErrorResponse = z.infer<typeof errorSchema>;
export type ValidationErrorResponse = z.infer<typeof validationErrorSchema>;

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
