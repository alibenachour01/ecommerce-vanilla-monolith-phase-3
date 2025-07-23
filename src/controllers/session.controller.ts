import type { Request, Response, NextFunction } from "express";

import { validateSessionUpdateInputSafe, type SessionOutput } from "../schemas/session.schema";
import { updateGuestSession } from "../services/session-manager.service";
import { ValidationError, NotFoundError } from "../errors/app.error";

export async function updateSessionCart(req: Request, res: Response, next: NextFunction) {
	const sessionToken = req.sessionToken;

	if (!sessionToken) {
		return next(new ValidationError("Session token is required"));
	}

	// Validate input using safe parsing
	const validationResult = validateSessionUpdateInputSafe({
		cart: req.body?.cart,
		userId: req.user?.id,
	});

	if (!validationResult.success) {
		const formattedErrors = validationResult.error.issues.map((err) => ({
			field: err.path.join("."),
			message: err.message,
			code: err.code,
		}));

		return next(new ValidationError("Invalid request data", { errors: formattedErrors }));
	}

	try {
		const sessionResult = await updateGuestSession(validationResult.data, sessionToken);
		res.status(200).json({ message: "Cart created successfully", session: sessionResult });
	} catch (error) {
		next(error);
	}
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
	try {
		const session: SessionOutput | undefined = req.session;
		if (!session) {
			return next(new NotFoundError("Session not found"));
		}
		res.status(200).json(session);
	} catch (error) {
		console.error("Error retrieving session:", error);
		next(error);
	}
}
