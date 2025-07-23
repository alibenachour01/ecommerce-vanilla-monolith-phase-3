import { Router } from "express";
import { userRouter } from "./user.router";
import { productRouter } from "./product.router";
export const appRouter = Router();
// middleware that is specific to this router
// const timeLog = (req, res, next) => {
// 	console.log("Time: ", Date.now());
// 	next();
// };
// appRouter.use(timeLog);
// Middleware specific to all routes can go here (optional)
// Mount userRouter at /users
appRouter.use("/users", userRouter);
appRouter.use("/products", productRouter);
// You can mount more routers later: appRouter.use('/products', productRouter);
