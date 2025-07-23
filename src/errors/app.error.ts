export class AppError extends Error {
	status;
	message;
	details?: Record<string, unknown>;

	constructor(status: number, message: string, details?: Record<string, unknown>) {
		super(message);
		this.status = status || 500;
		this.message = message || "An unexpected error occurred";
		this.details = details;
		this.name = this.constructor.name; // Set the error name to the class name
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found", details?: Record<string, unknown>) {
		super(404, message, details);
		this.name = "NotFoundError";
	}
}

export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details?: Record<string, unknown>) {
		super(400, message, details);
		this.name = "ValidationError";
	}
}
export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized access", details?: Record<string, unknown>) {
		super(401, message, details);
		this.name = "UnauthorizedError";
	}
}
export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden", details?: Record<string, unknown>) {
		super(403, message, details);
		this.name = "ForbiddenError";
	}
}
export class InternalServerError extends AppError {
	constructor(message: string = "Internal server error", details?: Record<string, unknown>) {
		super(500, message, details);
		this.name = "InternalServerError";
	}
}
export class ConflictError extends AppError {
	constructor(message: string = "Conflict", details?: Record<string, unknown>) {
		super(409, message, details);
		this.name = "ConflictError";
	}
}
export class BadRequestError extends AppError {
	constructor(message: string = "Bad request", details?: Record<string, unknown>) {
		super(400, message, details);
		this.name = "BadRequestError";
	}
}
