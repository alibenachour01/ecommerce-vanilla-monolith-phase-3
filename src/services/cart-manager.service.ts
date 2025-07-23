import { Cart as CartEntity } from "../db/entities/cart.entity";
import { AppDataSource } from "../../config/data-source.dev";
import type { PublicCart } from "../schemas/cart.schema";

export function mapCartEntityToPublic(cart: CartEntity): PublicCart {
	return {
		id: cart.id,
		products: cart.products.map((product) => ({
			id: product.id,
			name: product.name,
			createdAt: product.createdAt.toISOString(),
			updatedAt: product.updatedAt.toISOString(),
			price: product.price.toString(),
		})),
		creator: {
			id: cart.creator.id,
			email: cart.creator.email,
			createdAt: cart.creator.createdAt.toISOString(),
			updatedAt: cart.creator.updatedAt.toISOString(),
		},
		createdAt: cart.createdAt.toISOString(),
		updatedAt: cart.updatedAt.toISOString(),
	};
}

export async function saveCart(
	cart: { items: { productId: string; quantity: number }[] },
	userId: string,
): Promise<PublicCart> {
	try {
		const cartRepository = AppDataSource.getRepository(CartEntity);
		const newCart = cartRepository.create({
			products: cart.items.map((item) => ({ id: item.productId })),
			creator: { id: userId },
		});

		await cartRepository.save(newCart);
		return mapCartEntityToPublic(newCart);
	} catch (error) {
		console.error("Error saving cart:", error);
		throw new Error("Failed to save cart");
	}
}

export async function calculateTotalPrice(cart: { items: { productId: string; quantity: number }[] }) {
	const cartRepository = AppDataSource.getRepository(CartEntity);
	const productPrices = await cartRepository
		.createQueryBuilder("cart")
		.innerJoin("cart.products", "product")
		.select("product.id", "productId")
		.addSelect("product.price", "price")
		.getRawMany();

	return cart.items.reduce((total, item) => {
		const price = productPrices.find((p) => p.productId === item.productId)?.price || 0;
		return total + price * item.quantity;
	}, 0);
}

export async function initiatePayment(user: { id: string }, totalPrice: number) {
	// This is a placeholder for the payment initiation logic.
	// In a real application, you would integrate with a payment gateway here.
	console.log(`Initiating payment for user ${user.id} with total price: $${totalPrice}`);
	// Simulate payment success
	return Promise.resolve();
}

export async function getCartsByUserId(userId: string) {
	const cartRepository = AppDataSource.getRepository(CartEntity);
	try {
		const carts = await cartRepository.find({
			where: { creator: { id: userId } },
			relations: ["products", "creator"],
		});
		return carts.map(mapCartEntityToPublic);
	} catch (error) {
		console.error("Error fetching carts by user ID:", error);
		throw new Error("Failed to fetch carts");
	}
}

export async function getCartById(cartId: string): Promise<PublicCart | null> {
	const cartRepository = AppDataSource.getRepository(CartEntity);
	try {
		const cart = await cartRepository.findOne({
			where: { id: cartId },
			relations: ["products", "creator"],
		});
		return cart ? mapCartEntityToPublic(cart) : null;
	} catch (error) {
		console.error("Error fetching cart by ID:", error);
		throw new Error("Failed to fetch cart");
	}
}
