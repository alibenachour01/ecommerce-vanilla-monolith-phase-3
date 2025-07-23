import type { Request, Response, NextFunction } from "express";

import type { AppError } from "../errors/app.error";

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
	const status = err.status || 500;
	const message = err.message || "Internal server error";

	// Include details in the response if they exist
	const response: { error: string; details?: Record<string, unknown> } = { error: message };

	if (err.details) {
		response.details = err.details;
	}

	return res.status(status).json(response);
};
