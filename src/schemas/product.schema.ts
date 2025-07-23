import { z } from "zod";

// Base product schema for common fields
const baseProductSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1, "Product name is required"),
	price: z.number().positive("Price must be a positive number"),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input validation schemas
export const createProductSchema = z.object({
	name: z.string().min(1, "Product name is required").trim(),
	price: z.number().positive("Price must be a positive number"),
});

// Get product by ID validation schema
export const getProductByIdSchema = z.object({
	id: z.uuid("Invalid product ID format"),
});

// Delete product validation schema
export const deleteProductSchema = z.object({
	id: z.uuid("Invalid product ID format"),
});

// Output validation schemas
export const publicProductSchema = baseProductSchema.omit({ createdAt: true, updatedAt: true, price: true }).extend({
	createdAt: z.string(),
	updatedAt: z.string(),
	price: z.string().regex(/^\d+(\.\d{1,2})? €$/, "Invalid price format"),
});

// Update product schema (for future use)
export const updateProductSchema = z
	.object({
		name: z.string().min(1, "Product name is required").trim().optional(),
		price: z.number().positive("Price must be a positive number").optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field must be provided for update",
	});

// Input types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Output types
export type PublicProduct = z.infer<typeof publicProductSchema>;

// Validation helper functions
export const validateCreateProductInput = (data: unknown): CreateProductInput => {
	return createProductSchema.parse(data);
};

export const validateGetProductByIdInput = (data: unknown): GetProductByIdInput => {
	return getProductByIdSchema.parse(data);
};

export const validateDeleteProductInput = (data: unknown): DeleteProductInput => {
	return deleteProductSchema.parse(data);
};

export const validateUpdateProductInput = (data: unknown): UpdateProductInput => {
	return updateProductSchema.parse(data);
};
