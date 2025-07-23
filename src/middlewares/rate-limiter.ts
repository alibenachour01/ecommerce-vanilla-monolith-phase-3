import redisStore from "rate-limit-redis";
import { rateLimit } from "express-rate-limit";

import type { RedisReply } from "rate-limit-redis";

import redis from "../../config/connect-redis";

export const rateLimiter = rateLimit({
	store: new redisStore({
		sendCommand: async (command: string, ...args: string[]): Promise<RedisReply> => {
			const result = await redis.call(command, ...args);
			return result as RedisReply;
		},
		prefix: "rate-limit:",
		resetExpiryOnChange: false,
	}),
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // limit each IP to 100 requests per windowMs
	standardHeaders: true, // return RateLimit-* headers
	legacyHeaders: false, // disable X-RateLimit-* headers
	message: "Too many requests from this IP, please try again later.",
});
