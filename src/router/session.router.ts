import { Router } from "express";
import { updateSessionCart, getSession } from "../controllers/session.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { SessionUpdateSchema } from "../schemas/session.schema";
import { sessionHandler } from "../middlewares/session-handle";

const sessionRouter = Router();

sessionRouter.put("/update", sessionHandler, validateBody(SessionUpdateSchema), updateSessionCart);
sessionRouter.get("/", sessionHandler, getSession);

export { sessionRouter };
