import {
	validateCreateProductInput,
	validateGetProductByIdInput,
	validateDeleteProductInput,
} from "../schemas/product.schema";

/**
 * Simple test file to verify product schema validation works
 * This can be run with: npx tsx src/tests/product-schema-validation.test.ts
 */

console.log("Testing Product Schema Validation...\n");

// Test 1: Valid product creation data
try {
	const validCreateData = {
		name: "iPhone 15",
		price: 999.99,
	};

	const result = validateCreateProductInput(validCreateData);
	console.log("✅ Valid product creation data passed:", result);
} catch (error) {
	console.log("❌ Valid product creation data failed:", error);
}

// Test 2: Invalid product creation data (negative price)
try {
	const invalidCreateData = {
		name: "iPhone 15",
		price: -100,
	};

	const result = validateCreateProductInput(invalidCreateData);
	console.log("❌ This should have failed but passed:", result);
} catch (error) {
	console.log("✅ Invalid product creation data (negative price) correctly failed:", (error as Error).message);
}

// Test 3: Invalid product creation data (empty name)
try {
	const invalidCreateData = {
		name: "",
		price: 100,
	};

	const result = validateCreateProductInput(invalidCreateData);
	console.log("❌ This should have failed but passed:", result);
} catch (error) {
	console.log("✅ Invalid product creation data (empty name) correctly failed:", (error as Error).message);
}

// Test 4: Valid UUID for get/delete operations
try {
	const validUUID = {
		id: "123e4567-e89b-12d3-a456-426614174000",
	};

	const getResult = validateGetProductByIdInput(validUUID);
	const deleteResult = validateDeleteProductInput(validUUID);
	console.log("✅ Valid UUID for get/delete operations passed:", { getResult, deleteResult });
} catch (error) {
	console.log("❌ Valid UUID for get/delete operations failed:", error);
}

// Test 5: Invalid UUID
try {
	const invalidUUID = {
		id: "invalid-uuid",
	};

	const result = validateGetProductByIdInput(invalidUUID);
	console.log("❌ This should have failed but passed:", result);
} catch (error) {
	console.log("✅ Invalid UUID correctly failed:", (error as Error).message);
}

console.log("\nProduct schema validation tests completed!");
