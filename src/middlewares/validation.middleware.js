import { ZodError } from "zod";
import { ValidationError } from "../errors/app.error";
// Generic validation middleware factory
export const validateSchema = (schema, source = "body") => {
    return (req, _res, next) => {
        try {
            const dataToValidate = req[source];
            const validatedData = schema.parse(dataToValidate);
            // Replace the original data with validated data
            req[source] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));
                const validationError = new ValidationError(`Validation failed: ${errorMessages.map((e) => `${e.field}: ${e.message}`).join(", ")}`, { validationErrors: errorMessages });
                next(validationError);
            }
            else {
                next(error);
            }
        }
    };
};
// Specific validation middlewares for common use cases
export const validateBody = (schema) => validateSchema(schema, "body");
export const validateParams = (schema) => validateSchema(schema, "params");
export const validateQuery = (schema) => validateSchema(schema, "query");
