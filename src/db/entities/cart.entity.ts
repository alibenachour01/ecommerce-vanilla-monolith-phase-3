import {
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	ManyToMany,
	JoinTable,
} from "typeorm";

import { User } from "./user.entity";
import { Product } from "./product.entity";

@Entity("carts")
export class Cart {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToMany(
		() => Product,
		(product) => product.carts,
		{ eager: true },
	)
	@JoinTable({
		name: "cart_products",
		joinColumn: { name: "cart_id", referencedColumnName: "id" },
		inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
	})
	products!: Product[];

	@ManyToOne(
		() => User,
		(user) => user.carts,
	)
	@JoinColumn({ name: "user_id" })
	creator!: User;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
