// biome-ignore assist/source/organizeImports: <this rule is not applicable>
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { Cart } from "./cart.entity";

export type UserRole = "user" | "admin";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column("varchar", { unique: true })
	email!: string;

	@Column("varchar")
	password!: string;

	@Column("varchar", { default: "user" })
	role!: UserRole; // Default role is 'user'

	@OneToMany(
		() => Product,
		(product) => product.creator,
	)
	products!: Product[];

	@OneToMany(
		() => Cart,
		(cart) => cart.creator,
	)
	carts!: Cart[];

	@CreateDateColumn() // { default: 'CURRENT_TIMESTAMP' }
	createdAt!: Date;

	@UpdateDateColumn() // { default: 'CURRENT_TIMESTAMP' }
	updatedAt!: Date;
}
