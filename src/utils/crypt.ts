import { randomBytes, createHash } from "crypto";
/**
 * Generate a cryptographically secure session token
 */
export function generateToken(): string {
	return randomBytes(32).toString("hex");
}

/**
 * Create a hash of the session token for lookup (security best practice)
 */
export function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
