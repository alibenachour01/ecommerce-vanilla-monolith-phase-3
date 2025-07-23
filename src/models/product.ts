import type { User } from "./user";

export interface IProduct {
	id: string;
	name: string;
	price: number;
	creator: User;
}

export type ProductInfo = Pick<IProduct, "id" | "name" | "price"> & { creator: string }; // creator is a string (email) in the ProductInfo

export class Product implements Product {
	#id: string;
	name: string;
	price: number;
	creator: User;

	constructor(name: string, price: number, creator: User) {
		this.#id = crypto.randomUUID();
		this.name = name;
		this.price = price;
		this.creator = creator;
	}

	get id(): string {
		return this.#id;
	}

	getProductInfo(): ProductInfo {
		return {
			id: this.#id,
			name: this.name,
			price: this.price,
			creator: this.creator.email,
		};
	}
}
