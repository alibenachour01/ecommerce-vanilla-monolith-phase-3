import { randomBytes } from "node:crypto";

import redis from "../../config/connect-redis";
import { generateToken, hashToken } from "../utils/crypt";
import type { SessionOutput, SessionUpdateInput, SessionCreateInput } from "../schemas/session.schema";

export type SessionData = {
	sessionId: string;
	userId?: string; // undefined for guest sessions
	ip: string;
	userAgent: string;
	createdAt: number;
	lastActivity: number;
	cartId?: string; // for e-commerce cart persistence
	isAuthenticated: boolean;
};

export type SessionOptions = {
	maxAge?: number; // in seconds, default 24 hours for authenticated, 1 hour for guests
	secure?: boolean;
	httpOnly?: boolean;
};

// Constants
const DEFAULT_GUEST_TTL = 3600; // 1 hour for guest sessions
const DEFAULT_AUTH_TTL = 86400; // 24 hours for authenticated sessions
const SESSION_PREFIX = "ecom:session:";
const SESSION_HASH_PREFIX = "ecom:hash:";

/**
 * Create a new guest session
 */
export async function createGuestSession(
	input: SessionCreateInput,
	options: SessionOptions = {},
): Promise<{ token: string; session: SessionOutput }> {
	const { ip, userAgent } = input;
	if (!ip || !userAgent) {
		throw new Error("IP and User-Agent are required to create a session");
	}

	const sessionToken = generateToken();
	const sessionHash = hashToken(sessionToken);
	const sessionId = `guest_${Date.now()}_${randomBytes(8).toString("hex")}`;

	const sessionData: SessionOutput = {
		sessionId,
		ip,
		userAgent,
		createdAt: new Date(),
		lastActivity: new Date(),
		isAuthenticated: false,
	};

	const ttl = options.maxAge || DEFAULT_GUEST_TTL;

	// Store both the session data and a hash lookup
	await Promise.all([
		redis.set(`${SESSION_PREFIX}${sessionHash}`, JSON.stringify(sessionData), "EX", ttl),
		redis.set(`${SESSION_HASH_PREFIX}${sessionToken}`, sessionHash, "EX", ttl),
	]);

	return { token: sessionToken, session: sessionData };
}

/**
 * Retrieve session by token
 */
export async function getSession(
	token: string,
): Promise<{ currentSession: SessionOutput; sessionHash: string } | null> {
	try {
		// First get the hash from the token
		const sessionHash = await redis.get(`${SESSION_HASH_PREFIX}${token}`);
		console.log(`Session hash ${sessionHash}`);
		if (!sessionHash) {
			return null;
		}

		// Then get the session data using the hash
		const sessionDataStr = await redis.get(`${SESSION_PREFIX}${sessionHash}`);
		if (!sessionDataStr) {
			return null;
		}
		console.log(`Session data ${sessionDataStr}`);

		const sessionData: SessionOutput = JSON.parse(sessionDataStr);

		return { currentSession: sessionData, sessionHash };
	} catch (error) {
		console.error("Error retrieving session:", error);
		return null;
	}
}

/**
 * Upgrade guest session to authenticated session
 */
export async function updateGuestSession(
	input: SessionUpdateInput,
	sessionToken: string,
	options: SessionOptions = {},
): Promise<{ token: string; session: SessionOutput } | null> {
	const { userId, cart } = input;

	const sessionResult = await getSession(sessionToken);
	if (!sessionResult) {
		return null;
	}
	const { currentSession, sessionHash } = sessionResult;

	const newSessionData = { ...currentSession, userId, cart, lastActivity: new Date() };

	const ttl = options.maxAge || DEFAULT_GUEST_TTL;

	// Store both the session data and a hash lookup
	await Promise.all([
		redis.set(`${SESSION_PREFIX}${sessionHash}`, JSON.stringify(newSessionData), "EX", ttl),
		redis.set(`${SESSION_HASH_PREFIX}${sessionToken}`, sessionHash, "EX", ttl),
	]);

	return { token: sessionToken, session: newSessionData };
}

/**
 * Refresh/extend session TTL
 */
export async function refreshSession(token: string): Promise<boolean> {
	try {
		const sessionHash = await redis.get(`${SESSION_HASH_PREFIX}${token}`);
		if (!sessionHash) return false;

		const sessionDataStr = await redis.get(`${SESSION_PREFIX}${sessionHash}`);
		if (!sessionDataStr) return false;

		const sessionData: SessionData = JSON.parse(sessionDataStr);
		const ttl = sessionData.isAuthenticated ? DEFAULT_AUTH_TTL : DEFAULT_GUEST_TTL;

		// Extend TTL for both session and hash
		await Promise.all([
			redis.expire(`${SESSION_PREFIX}${sessionHash}`, ttl),
			redis.expire(`${SESSION_HASH_PREFIX}${token}`, ttl),
		]);

		return true;
	} catch (error) {
		console.error("Error refreshing session:", error);
		return false;
	}
}

/**
 * Delete session (logout)
 */
export async function deleteSession(token: string): Promise<boolean> {
	try {
		const sessionHash = await redis.get(`${SESSION_HASH_PREFIX}${token}`);
		if (!sessionHash) return false;

		// Delete both session data and hash lookup
		await Promise.all([redis.del(`${SESSION_PREFIX}${sessionHash}`), redis.del(`${SESSION_HASH_PREFIX}${token}`)]);

		return true;
	} catch (error) {
		console.error("Error deleting session:", error);
		return false;
	}
}

/**
 * Get all active sessions for a user (useful for "logout from all devices")
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
	try {
		const pattern = `${SESSION_PREFIX}*`;
		const keys = await redis.keys(pattern);
		const sessions: SessionData[] = [];

		for (const key of keys) {
			const sessionDataStr = await redis.get(key);
			if (sessionDataStr) {
				const sessionData: SessionData = JSON.parse(sessionDataStr);
				if (sessionData.userId === userId) {
					sessions.push(sessionData);
				}
			}
		}

		return sessions;
	} catch (error) {
		console.error("Error getting user sessions:", error);
		return [];
	}
}

/**
 * Cleanup expired sessions (can be run as a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
	try {
		const pattern = `${SESSION_PREFIX}*`;
		const keys = await redis.keys(pattern);
		let cleanedUp = 0;

		for (const key of keys) {
			const ttl = await redis.ttl(key);
			if (ttl === -1) {
				// No TTL set, this shouldn't happen but let's clean it up
				await redis.del(key);
				cleanedUp++;
			}
		}

		return cleanedUp;
	} catch (error) {
		console.error("Error cleaning up sessions:", error);
		return 0;
	}
}
