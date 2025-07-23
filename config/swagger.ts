import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const options = {
	definition: {
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
		components: {
			schemas: {
				User: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "User ID",
							example: "550e8400-e29b-41d4-a716-446655440000",
						},
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "User creation timestamp",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "User last update timestamp",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
				RegisterRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						password: {
							type: "string",
							minLength: 8,
							description:
								"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
							example: "StrongPassword123",
						},
					},
				},
				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						password: {
							type: "string",
							minLength: 1,
							description: "User password",
							example: "StrongPassword123",
						},
					},
				},
				LoginResponse: {
					type: "object",
					properties: {
						id: {
							type: "string",
							format: "uuid",
							description: "User ID",
							example: "550e8400-e29b-41d4-a716-446655440000",
						},
						email: {
							type: "string",
							format: "email",
							description: "User email address",
							example: "user@example.com",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							description: "User creation timestamp",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							description: "User last update timestamp",
							example: "2023-01-01T00:00:00.000Z",
						},
						token: {
							type: "string",
							description: "JWT authentication token",
							example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
						},
					},
				},
				Error: {
					type: "object",
					properties: {
						error: {
							type: "string",
							description: "Error message",
							example: "Invalid email or password",
						},
						statusCode: {
							type: "integer",
							description: "HTTP status code",
							example: 400,
						},
					},
				},
				ValidationError: {
					type: "object",
					properties: {
						error: {
							type: "string",
							description: "Validation error message",
							example: "Validation failed",
						},
						details: {
							type: "array",
							items: {
								type: "object",
								properties: {
									field: {
										type: "string",
										description: "Field that failed validation",
										example: "email",
									},
									message: {
										type: "string",
										description: "Validation error message",
										example: "Invalid email format",
									},
								},
							},
						},
						statusCode: {
							type: "integer",
							description: "HTTP status code",
							example: 400,
						},
					},
				},
			},
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT authorization header using the Bearer scheme.",
				},
			},
		},
	},
	apis: ["./src/router/*.ts", "./src/controllers/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
	console.log("📖 Swagger UI available at /api-docs");
};

export default specs;
