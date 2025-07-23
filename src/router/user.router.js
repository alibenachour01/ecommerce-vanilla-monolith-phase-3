import { Router } from "express";
import { getAllUsers, registerUser, getUserById, loginUser } from "../controllers/user.controller";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { registerUserSchema, loginUserSchema, getUserByIdSchema } from "../schemas/user.schema";
import { authenticateUser } from "../middlewares/auth-handler";
// PUBLIC routes
const publicUserRouter = Router();
// POST /users/register
publicUserRouter.post("/register", validateBody(registerUserSchema), registerUser);
// POST /users/login
publicUserRouter.post("/login", validateBody(loginUserSchema), loginUser);
// PRIVATE routes
const privateUserRouter = Router({ mergeParams: true });
privateUserRouter.use(authenticateUser);
// GET /users
privateUserRouter.get("/", getAllUsers);
// GET /users/:id
privateUserRouter.get("/:id", validateParams(getUserByIdSchema), getUserById);
const userRouter = Router();
userRouter.use(publicUserRouter);
userRouter.use(privateUserRouter);
export { userRouter };
