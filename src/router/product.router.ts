import { Router } from "express";

import { getAllProducts, createProduct, getProductById, deleteProduct } from "../controllers/product.controller";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { createProductSchema, getProductByIdSchema, deleteProductSchema } from "../schemas/product.schema";
import { authenticateUser } from "../middlewares/auth-handler";
import { requireRole } from "../middlewares/authorize";
import { sessionHandler } from "../middlewares/session-handle";
import { PaginatedRequestSchema } from "../schemas/app.schema";

// PUBLIC routes
const publicProductRouter = Router();
// GET /products (public - anyone can view all products)
publicProductRouter.get("/", sessionHandler, validateQuery(PaginatedRequestSchema), getAllProducts);
// GET /products/:id
publicProductRouter.get("/:id", validateParams(getProductByIdSchema), getProductById);

// PRIVATE routes (protected - require authentication)
const privateProductRouter = Router({ mergeParams: true });
privateProductRouter.use(authenticateUser);
// POST /products/create
privateProductRouter.post("/create", validateBody(createProductSchema), requireRole("admin"), createProduct);
// DELETE /products/delete/:id
privateProductRouter.delete("/delete/:id", validateParams(deleteProductSchema), requireRole("admin"), deleteProduct);

const productRouter = Router();
productRouter.use(publicProductRouter);
productRouter.use(privateProductRouter);

export { productRouter };
