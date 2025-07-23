import { Router } from "express";
import { checkoutHandler, getUserCarts, getCart } from "../controllers/cart.controller";
import { sessionHandler } from "../middlewares/session-handle";
import { authenticateUser } from "../middlewares/auth-handler";
import { validateParams } from "../middlewares/validation.middleware";
import { getCartByIdSchema } from "../schemas/cart.schema";

const cartRouter = Router();

cartRouter.post("/checkout", sessionHandler, checkoutHandler);
cartRouter.get("/", sessionHandler, authenticateUser, getUserCarts);

cartRouter.get("/:id", sessionHandler, authenticateUser, validateParams(getCartByIdSchema), getCart);

export { cartRouter };
