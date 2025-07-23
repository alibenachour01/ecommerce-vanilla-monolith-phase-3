import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/data-source";
import { User as UserEntity } from "../db/entities/user.entity";
import { NotFoundError, UnauthorizedError, ConflictError } from "../errors/app.error";
const userRepo = AppDataSource.getRepository(UserEntity);
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";
// Helper function to format user response (excluding sensitive data)
const formatUserResponse = (user) => {
    const userResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
    return userResponse;
};
export const getAllUsers = async (_req, res, next) => {
    try {
        const users = await userRepo.find();
        if (!users || users.length === 0) {
            throw new NotFoundError("No users found.");
        }
        const userResponse = users.map((user) => formatUserResponse(user));
        return res.json(userResponse);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        next(error);
    }
};
export const getUserById = async (req, res, next) => {
    try {
        // TypeScript knows req.params is validated by middleware
        const { id: userId } = req.params;
        console.log("authenticated user:", req.user);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundError("User not found.");
        }
        return res.json(formatUserResponse(user));
    }
    catch (error) {
        console.error("Error fetching user:", error);
        next(error);
    }
};
export const registerUser = async (req, res, next) => {
    try {
        // TypeScript knows req.body is validated by middleware
        const { email, password } = req.body;
        // Check if user already exists
        const existingUser = await userRepo
            .createQueryBuilder("user")
            .where("LOWER(user.email) = LOWER(:email)", { email })
            .getOne();
        if (existingUser) {
            throw new ConflictError("User with this email already exists.");
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new UserEntity();
        newUser.email = email;
        newUser.password = hashedPassword;
        const user = await userRepo.save(newUser);
        const response = formatUserResponse(user);
        return res.status(201).json(response);
    }
    catch (error) {
        console.error("Error registering user:", error);
        if (error instanceof Error && error.message.includes("duplicate key value")) {
            next(new ConflictError("User with this email already exists."));
        }
        else {
            next(error);
        }
    }
};
export const loginUser = async (req, res, next) => {
    try {
        // TypeScript knows req.body is validated by middleware
        const { email, password } = req.body;
        const user = await userRepo
            .createQueryBuilder("user")
            .where("LOWER(user.email) = LOWER(:email)", { email })
            .getOne();
        if (!user) {
            throw new UnauthorizedError("Invalid email or password.");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password.");
        }
        // Generate JWT token (assuming you have a function to do this)
        const response = formatUserResponse(user);
        const token = jwt.sign({ ...response, role: user.role }, process.env.JWT_SECRET ?? "", { expiresIn: "1h" }); // env variable is causing sign function to throw a ts error
        return res.json({ ...response, token });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        next(error);
    }
};
