import type { Request, Response, NextFunction } from "express";
import { createGuestSession, getSession } from "../services/session-manager.service";

async function generateAndAttachToken(req: Request, res: Response) {
	// Invalid session - create new guest session
	const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
	const userAgent = req.headers["user-agent"] || "unknown-user-agent";

	const { token, session } = await createGuestSession({ ip, userAgent });

	res.setHeader("X-Session-Token", token);
	// res.cookie("sessionToken", token, {
	// 	httpOnly: true,
	// 	secure: process.env.NODE_ENV === "production",
	// 	sameSite: "lax",
	// 	maxAge: 3600 * 1000, // 1 hour for guest sessions
	// });

	req.session = session;
	req.sessionToken = token;

	return session;
}

/**
 * Enhanced session middleware for e-commerce applications
 * Handles both guest and authenticated sessions seamlessly
 */
export async function sessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		// Check for session token in multiple places (headers, cookies, query params)
		const sessionToken = req.headers["x-session-token"] as string;
		// (req.cookies?.sessionToken as string) ||
		// (req.query.sessionToken as string);

		if (sessionToken) {
			// Session token provided - validate and retrieve session
			const sessionResult = await getSession(sessionToken);
			console.log(`Session token provided: ${sessionToken}`);
			console.log(`Session result: ${sessionResult}`);
			if (sessionResult) {
				const currentSession = sessionResult.currentSession;
				// Valid session found
				req.session = currentSession;
				req.sessionToken = sessionToken;

				console.log(`Found valid session: ${currentSession.sessionId}"})`);
			} else {
				// Invalid session - create new guest session
				const session = await generateAndAttachToken(req, res);
				console.log(`Created new guest session: ${session.sessionId}`);
			}
		} else {
			// No session token provided - create new guest session
			const session = await generateAndAttachToken(req, res);
			console.log(`No session token provided, created new guest session: ${session.sessionId}`);
		}
		next();
	} catch (error) {
		console.error("Error in attachSession middleware:", error);

		// Fallback: create guest session on any error
		try {
			const session = await generateAndAttachToken(req, res);
			console.error("Created fallback guest session due to error:", session.sessionId);

			next();
		} catch (fallbackError) {
			console.error("Failed to create fallback session:", fallbackError);
			return next(new Error("Session management error"));
		}
	}
}
