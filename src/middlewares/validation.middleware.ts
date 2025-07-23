import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import { ValidationError } from "../errors/app.error";

// Generic validation middleware factory
export const validateSchema = <T>(schema: ZodType<T>, source: "body" | "params" | "query" = "body") => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const dataToValidate = req[source];
			// Just validate the data - don't modify the request object
			schema.parse(dataToValidate);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.issues.map((err: $ZodIssue) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				const validationError = new ValidationError(
					`Validation failed: ${errorMessages.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", ")}`,
					{ validationErrors: errorMessages },
				);

				next(validationError);
			} else {
				next(error);
			}
		}
	};
};

// Specific validation middlewares for common use cases
export const validateBody = <T>(schema: ZodType<T>) => validateSchema(schema, "body");
export const validateParams = <T>(schema: ZodType<T>) => validateSchema(schema, "params");
export const validateQuery = <T>(schema: ZodType<T>) => validateSchema(schema, "query");
