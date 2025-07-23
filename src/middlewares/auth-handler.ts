import jwt from "jsonwebtoken";

import type { Request, Response, NextFunction } from "express";

import { UnauthorizedError } from "../errors/app.error";
import type { AuthenticatedUser } from "../schemas/user.schema";


export const authenticateUser = (req: Request, _res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return next(new UnauthorizedError("No token provided."));
	}

	jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
		if (err) {
			return next(new UnauthorizedError("Invalid token."));
		}

        console.log("Decoded token:", decoded);
		req.user = decoded as AuthenticatedUser;
		next();
	});
};
