import { validateRegisterInput, validateLoginInput, validateGetUserByIdInput } from "../schemas/user.schema";
/**
 * Simple test file to verify schema validation works
 * This can be run with: npx tsx src/tests/schema-validation.test.ts
 */
console.log("Testing User Schema Validation...\n");
// Test 1: Valid registration data
try {
    const validRegisterData = {
        email: "test@example.com",
        password: "StrongPassword123",
    };
    const result = validateRegisterInput(validRegisterData);
    console.log("✅ Valid registration data passed:", result);
}
catch (error) {
    console.log("❌ Valid registration data failed:", error);
}
// Test 2: Invalid registration data (weak password)
try {
    const invalidRegisterData = {
        email: "test@example.com",
        password: "weak",
    };
    const result = validateRegisterInput(invalidRegisterData);
    console.log("❌ Invalid registration data should have failed:", result);
}
catch (error) {
    console.log("✅ Invalid registration data correctly failed:", error.message);
}
// Test 3: Invalid email format
try {
    const invalidEmailData = {
        email: "invalid-email",
        password: "StrongPassword123",
    };
    const result = validateRegisterInput(invalidEmailData);
    console.log("❌ Invalid email should have failed:", result);
}
catch (error) {
    console.log("✅ Invalid email correctly failed:", error.message);
}
// Test 4: Valid login data
try {
    const validLoginData = {
        email: "test@example.com",
        password: "anypassword",
    };
    const result = validateLoginInput(validLoginData);
    console.log("✅ Valid login data passed:", result);
}
catch (error) {
    console.log("❌ Valid login data failed:", error);
}
// Test 5: Valid user ID
try {
    const validUserIdData = {
        id: "550e8400-e29b-41d4-a716-446655440000",
    };
    const result = validateGetUserByIdInput(validUserIdData);
    console.log("✅ Valid user ID passed:", result);
}
catch (error) {
    console.log("❌ Valid user ID failed:", error);
}
// Test 6: Invalid user ID
try {
    const invalidUserIdData = {
        id: "invalid-uuid",
    };
    const result = validateGetUserByIdInput(invalidUserIdData);
    console.log("❌ Invalid user ID should have failed:", result);
}
catch (error) {
    console.log("✅ Invalid user ID correctly failed:", error.message);
}
console.log("\nSchema validation tests completed!");
