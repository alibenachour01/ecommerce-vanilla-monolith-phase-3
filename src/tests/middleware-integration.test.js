import express from "express";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { registerUserSchema, getUserByIdSchema } from "../schemas/user.schema";
import { errorHandler } from "../middlewares/error-handler";
/**
 * Simple Express app to test the validation middleware
 * Run with: npx tsx src/tests/middleware-integration.test.ts
 */
const app = express();
app.use(express.json());
// Test endpoint with body validation
app.post("/test-register", validateBody(registerUserSchema), (req, res) => {
    res.json({
        message: "Validation passed!",
        data: req.body,
    });
});
// Test endpoint with params validation
app.get("/test-user/:id", validateParams(getUserByIdSchema), (req, res) => {
    res.json({
        message: "Validation passed!",
        params: req.params,
    });
});
// Error handler
app.use(errorHandler);
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log("\nTest endpoints:");
    console.log("POST /test-register - Body validation");
    console.log("GET /test-user/:id - Params validation");
    console.log("\nTest commands:");
    console.log('curl -X POST http://localhost:3001/test-register -H "Content-Type: application/json" -d \'{"email": "test@example.com", "password": "StrongPassword123"}\'');
    console.log('curl -X POST http://localhost:3001/test-register -H "Content-Type: application/json" -d \'{"email": "invalid-email", "password": "weak"}\'');
    console.log("curl http://localhost:3001/test-user/550e8400-e29b-41d4-a716-446655440000");
    console.log("curl http://localhost:3001/test-user/invalid-uuid");
    console.log("\nPress Ctrl+C to stop the server");
});
