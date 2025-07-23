import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/app.error";
export const authenticateUser = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next(new UnauthorizedError("No token provided."));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new UnauthorizedError("Invalid token."));
        }
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    });
};
