import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

// Import schemas from the user schema file
import {
	registerUserSchema,
	loginUserSchema,
	getUserByIdSchema,
	publicUserSchema,
	loginResponseSchema,
	errorSchema,
	validationErrorSchema,
} from "../src/schemas/user.schema";

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

// Register all schemas
registry.register("RegisterRequest", registerUserSchema);
registry.register("LoginRequest", loginUserSchema);
registry.register("GetUserByIdParams", getUserByIdSchema);
registry.register("User", publicUserSchema);
registry.register("LoginResponse", loginResponseSchema);
registry.register("Error", errorSchema);
registry.register("ValidationError", validationErrorSchema);

// Register authentication routes
registry.registerPath({
	method: "post",
	path: "/users/register",
	tags: ["Authentication"],
	summary: "Register a new user",
	description: "Create a new user account with email and password",
	request: {
		body: {
			description: "User registration data",
			content: {
				"application/json": {
					schema: registerUserSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "User successfully registered",
			content: {
				"application/json": {
					schema: publicUserSchema,
				},
			},
		},
		400: {
			description: "Validation error",
			content: {
				"application/json": {
					schema: validationErrorSchema,
				},
			},
		},
		409: {
			description: "User with this email already exists",
			content: {
				"application/json": {
					schema: errorSchema,
					example: {
						error: "User with this email already exists.",
						statusCode: 409,
					},
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: errorSchema,
				},
			},
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/users/login",
	tags: ["Authentication"],
	summary: "Login user",
	description: "Authenticate user with email and password, returns JWT token",
	request: {
		body: {
			description: "User login credentials",
			content: {
				"application/json": {
					schema: loginUserSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "User successfully authenticated",
			content: {
				"application/json": {
					schema: loginResponseSchema,
				},
			},
		},
		400: {
			description: "Validation error",
			content: {
				"application/json": {
					schema: validationErrorSchema,
				},
			},
		},
		401: {
			description: "Invalid credentials",
			content: {
				"application/json": {
					schema: errorSchema,
					example: {
						error: "Invalid email or password.",
						statusCode: 401,
					},
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: errorSchema,
				},
			},
		},
	},
});

// Register security schemes
registry.registerComponent("securitySchemes", "BearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
	description: "JWT authorization header using the Bearer scheme.",
});

// Generate OpenAPI specification
const generator = new OpenApiGeneratorV3(registry.definitions);
const docs = generator.generateDocument({
	openapi: "3.0.0",
	info: {
		title: "E-commerce API",
		version: "1.0.0",
		description: "A simple e-commerce API built with Express and TypeScript",
	},
	servers: [
		{
			url: process.env.API_BASE_URL || "http://localhost:3000",
			description: "Development server",
		},
	],
	tags: [
		{
			name: "Authentication",
			description: "User authentication and registration endpoints",
		},
	],
});

export const setupSwagger = (app: Express): void => {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(docs));
	console.log("📖 Swagger UI available at /api-docs");
};

export default docs;
