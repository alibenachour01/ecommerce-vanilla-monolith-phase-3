import type { SessionOutput } from "../schemas/session.schema";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: "user" | "admin";
				createdAt: string;
				updatedAt: string;
			};
			session?: SessionOutput;
			sessionToken?: string;
		}
	}
}
