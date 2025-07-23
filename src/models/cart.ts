import type { IProduct } from "./product";

export interface ICart {
	id: string;
	userId: string;
	products: IProduct[];
	totalPrice: number;
}

export class Cart implements ICart {
	#id: string;
	#userId: string;
	#products: IProduct[];
	#totalPrice: number;

	constructor(userId: string) {
		this.#id = crypto.randomUUID();
		this.#userId = userId;
		this.#products = [];
		this.#totalPrice = 0;
	}

	get userId(): string {
		return this.#userId;
	}

	get products(): IProduct[] {
		return this.#products;
	}

	get totalPrice(): number {
		return this.#totalPrice;
	}

	get id(): string {
		return this.#id;
	}

	addProducts(products: IProduct[]): void {
		products.forEach((product) => {
			this.addProduct(product);
		});
	}

	addProduct(product: IProduct): void {
		this.#products.push(product);
		this.#totalPrice += product.price;
	}

	removeProduct(productId: string): void {
		const productIndex = this.#products.findIndex((p) => p.id === productId);
		if (productIndex !== -1 && this.#products[productIndex]) {
			this.#totalPrice -= this.#products[productIndex].price;
			this.#products.splice(productIndex, 1);
		}
	}
}
