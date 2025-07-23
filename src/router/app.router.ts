import { Router } from "express";
import { userRouter } from "./user.router";
import { productRouter } from "./product.router";
import { sessionRouter } from "./session.router";
import { cartRouter } from "./cart.router";

export const appRouter = Router();

appRouter.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount userRouter at /users
appRouter.use("/users", userRouter);
appRouter.use("/products", productRouter);
appRouter.use("/sessions", sessionRouter);
appRouter.use("/carts", cartRouter);

// You can mount more routers later: appRouter.use('/products', productRouter);
