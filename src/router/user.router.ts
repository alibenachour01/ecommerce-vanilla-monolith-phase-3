import { Router } from "express";

import { getAllUsers, registerUser, getUserById, loginUser } from "../controllers/user.controller";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { registerUserSchema, loginUserSchema, getUserByIdSchema } from "../schemas/user.schema";
import { authenticateUser } from "../middlewares/auth-handler";
import { requireRole } from "../middlewares/authorize";

// PUBLIC routes
const publicUserRouter = Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User with this email already exists."
 *               statusCode: 409
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /users/register
publicUserRouter.post("/register", validateBody(registerUserSchema), registerUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password, returns JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid email or password."
 *               statusCode: 401
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /users/login
publicUserRouter.post("/login", validateBody(loginUserSchema), loginUser);

// PRIVATE routes
const privateUserRouter = Router({ mergeParams: true });
privateUserRouter.use(authenticateUser);
// GET /users
privateUserRouter.get("/", requireRole("admin"), getAllUsers);
// GET /users/:id
privateUserRouter.get("/:id", validateParams(getUserByIdSchema), getUserById);

const userRouter = Router();
userRouter.use(publicUserRouter);
userRouter.use(privateUserRouter);

export { userRouter };
