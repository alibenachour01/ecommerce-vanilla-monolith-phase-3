/** we need a handleCheckout function that do this 
- first check if the req.user is defined if not return an error
- then check if the req.session have a cart object defined if not return an error
- then save the cart to the database
- then calculate the total price of the cart
- initiate a payment with the total price
*/

import type { Request, Response, NextFunction } from "express";
import { updateGuestSession } from "../services/session-manager.service";
import { ValidationError, UnauthorizedError, NotFoundError } from "../errors/app.error";
import {
	saveCart,
	calculateTotalPrice,
	initiatePayment,
	getCartsByUserId,
	getCartById,
} from "../services/cart-manager.service";

export async function checkoutHandler(req: Request, res: Response, next: NextFunction) {
	const user = req.user;
	if (!user) {
		return next(new UnauthorizedError("User is not authenticated"));
	}

	const session = req.session;
	const sessionToken = req.sessionToken;
	if (!session || !session.cart || !sessionToken) {
		return next(new ValidationError("Session does not have a cart or session token is missing"));
	}

	// Update the guest session with the current cart and user ID
	await updateGuestSession({ cart: session.cart, userId: user.id }, sessionToken);

	// Save the cart to the database
	await saveCart(session.cart, user.id);
	// Calculate the total price of the cart
	const totalPrice = await calculateTotalPrice(session.cart);

	// Initiate a payment with the total price
	try {
		await initiatePayment(user, totalPrice);
	} catch {
		return next(new Error("Payment failed"));
	}

	return res
		.status(200)
		.json({ message: "Checkout completed successfully", products: session.cart.items, totalPrice: totalPrice });
}

export async function getUserCarts(req: Request, res: Response, next: NextFunction) {
	const user = req.user;
	if (!user) {
		return next(new UnauthorizedError("User is not authenticated"));
	}

	try {
		const carts = await getCartsByUserId(user.id);
		return res.status(200).json(carts);
	} catch (error) {
		console.error("Error fetching user carts:", error);
		return next(error);
	}
}

export async function getCart(req: Request, res: Response, next: NextFunction) {
	const user = req.user;
	if (!user) {
		return next(new UnauthorizedError("User is not authenticated"));
	}

	const cartId = req.params.id;
	if (!cartId) {
		return next(new ValidationError("Cart ID is required"));
	}

	try {
		const cart = await getCartById(cartId);
		if (!cart) {
			return next(new NotFoundError("Cart not found"));
		}
		return res.status(200).json(cart);
	} catch (error) {
		console.error("Error fetching cart:", error);
		return next(error);
	}
}
