import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import redis from "../../config/connect-redis";
import { AppDataSource } from "../../config/data-source.dev";
import { appRouter } from "../router/app.router";
import { errorHandler } from "../middlewares/error-handler";
import { rateLimiter } from "../middlewares/rate-limiter";

dotenv.config();

export const App = express();

// Setup Redis event listeners
const setupRedisListeners = () => {
	redis.on("error", (err) => {
		console.error("🔴 Redis connection error:", err);
	});

	redis.on("connect", () => {
		console.log("🔴 Redis connecting...");
	});

	redis.on("ready", () => {
		console.log("🔴 Redis ready!");
	});
};

// Initialize connections and start server
const startServer = async () => {
	try {
		// Setup Redis listeners
		setupRedisListeners();

		// Initialize database
		await AppDataSource.initialize();
		console.log("📦 DB connected");

		// Start Express server
		App.listen(process.env.PORT, () => {
			console.log(`🚀 Server is running on port ${process.env.PORT}`);
		});
	} catch (err) {
		console.error("❌ Connection failed", err);
		process.exit(1);
	}
};

// Global middleware
App.use(express.json());

// Trust proxy if running behind one (e.g., Docker, load balancer)
App.set("trust proxy", 1);

// Security headers with Helmet
App.use(
	helmet({
		contentSecurityPolicy: false, // not relevant for APIs
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
		referrerPolicy: { policy: "no-referrer" },
		hidePoweredBy: true, // remove X-Powered-By
	}),
);

// Apply rate limiting middleware
App.use(rateLimiter);

// Mount all app routes
App.use("/", appRouter);

// Register error handler AFTER all routes
App.use(errorHandler);

// Start the application
startServer();
