import dotenv from "dotenv";
import express from "express";
import { AppDataSource } from "../../config/data-source";
// import { seed } from "../index";
import { appRouter } from "../router/app.router";
import { errorHandler } from "../middlewares/error-handler";
dotenv.config();
export const App = express();
// Global middleware
App.use(express.json());
// Mount all app routes
App.use("/", appRouter);
// Register error handler AFTER all routes
App.use(errorHandler);
AppDataSource.initialize()
    .then(() => {
    console.log("📦 DB connected");
    // Then you can start your express server
    App.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ DB connection failed", err);
});
