import type { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../../config/data-source.dev";
import { Product as ProductEntity } from "../db/entities/product.entity";
import { User as UserEntity } from "../db/entities/user.entity";
import { NotFoundError, ConflictError, UnauthorizedError } from "../errors/app.error";
import type {
	CreateProductInput,
	GetProductByIdInput,
	DeleteProductInput,
	PublicProduct,
} from "../schemas/product.schema";

import { safeParsePaginatedRequest } from "../schemas/app.schema";

const productRepo = AppDataSource.getRepository(ProductEntity);
const userRepo = AppDataSource.getRepository(UserEntity);

// Helper function to format product response
const formatProductResponse = (product: ProductEntity): PublicProduct => {
	const productResponse: PublicProduct = {
		id: product.id,
		name: product.name,
		price: `${product.price} €`,
		createdAt: product.createdAt.toISOString(),
		updatedAt: product.updatedAt.toISOString(),
	};

	return productResponse;
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
	// Middleware validates structure, controller applies defaults and type conversion
	const { page, limit } = safeParsePaginatedRequest(req.query);

	try {
		const products = await productRepo.find({
			skip: (page - 1) * limit,
			take: limit,
			order: { createdAt: "DESC" },
			relations: ["creator"],
		});

		if (!products || products.length === 0) {
			return res.json([]); // Return empty array instead of throwing error
		}

		const productResponse = products.map((product) => formatProductResponse(product));
		return res.json(productResponse);
	} catch (error) {
		console.error("Error fetching products:", error);
		next(error);
	}
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id: productId } = req.params as GetProductByIdInput;

		const product = await productRepo.findOne({ where: { id: productId } });

		if (!product) {
			throw new NotFoundError("Product not found.");
		}

		return res.json(formatProductResponse(product));
	} catch (error) {
		console.error("Error fetching product:", error);
		next(error);
	}
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, price } = req.body as CreateProductInput;

		// Get the authenticated user
		if (!req.user) {
			throw new UnauthorizedError("User not authenticated.");
		}

		// Find the user who is creating the product
		const creator = await userRepo.findOneBy({ id: req.user.id });
		if (!creator) {
			throw new NotFoundError("Creator user not found.");
		}

		// Check if product with this name already exists
		const existingProduct = await productRepo
			.createQueryBuilder("product")
			.where("LOWER(product.name) = LOWER(:name)", { name })
			.getOne();

		if (existingProduct) {
			throw new ConflictError("Product with this name already exists.");
		}

		const newProduct = new ProductEntity();
		newProduct.name = name;
		newProduct.price = price;
		newProduct.creator = creator;

		const product = await productRepo.save(newProduct);

		// Fetch the product with creator relation
		const savedProduct = await productRepo.findOne({
			where: { id: product.id },
		});

		if (!savedProduct) {
			throw new NotFoundError("Failed to retrieve created product.");
		}

		const response = formatProductResponse(savedProduct);

		return res.status(201).json(response);
	} catch (error) {
		console.error("Error creating product:", error);
		if (error instanceof Error && error.message.includes("duplicate key value")) {
			next(new ConflictError("Product with this name already exists."));
		} else {
			next(error);
		}
	}
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id: productId } = req.params as DeleteProductInput;

		// Get the authenticated user
		if (!req.user) {
			throw new NotFoundError("User not authenticated.");
		}

		const product = await productRepo.findOne({
			where: { id: productId },
			relations: ["creator"],
		});

		if (!product) {
			throw new NotFoundError("Product not found.");
		}

		// Check if the user is the creator of the product or is an admin
		if (product.creator.id !== req.user.id && req.user.role !== "admin") {
			throw new UnauthorizedError("You can only delete your own products.");
		}

		await productRepo.remove(product);

		return res.status(200).json({ message: "Product deleted successfully." });
	} catch (error) {
		console.error("Error deleting product:", error);
		next(error);
	}
};
