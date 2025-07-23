export class AppError extends Error {
    status;
    message;
    details;
    constructor(status, message, details) {
        super(message);
        this.status = status || 500;
        this.message = message || "An unexpected error occurred";
        this.details = details;
        this.name = this.constructor.name; // Set the error name to the class name
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Resource not found", details) {
        super(404, message, details);
        this.name = "NotFoundError";
    }
}
export class ValidationError extends AppError {
    constructor(message = "Validation failed", details) {
        super(400, message, details);
        this.name = "ValidationError";
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized access", details) {
        super(401, message, details);
        this.name = "UnauthorizedError";
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden", details) {
        super(403, message, details);
        this.name = "ForbiddenError";
    }
}
export class InternalServerError extends AppError {
    constructor(message = "Internal server error", details) {
        super(500, message, details);
        this.name = "InternalServerError";
    }
}
export class ConflictError extends AppError {
    constructor(message = "Conflict", details) {
        super(409, message, details);
        this.name = "ConflictError";
    }
}
export class BadRequestError extends AppError {
    constructor(message = "Bad request", details) {
        super(400, message, details);
        this.name = "BadRequestError";
    }
}
