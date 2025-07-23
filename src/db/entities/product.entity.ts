// biome-ignore assist/source/organizeImports: <null>
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	ManyToMany,
} from "typeorm";

import { User } from "./user.entity";
import { Cart } from "./cart.entity";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column("varchar", { unique: true })
	name!: string;

	@Column("decimal", { precision: 10, scale: 2 })
	price!: number;

	@ManyToOne(
		() => User,
		(user) => user.products,
		{ eager: true },
	)
	@JoinColumn({ name: "creatorId" })
	creator!: User;

	@ManyToMany(
		() => Cart,
		(cart) => cart.products,
	)
	carts!: Cart[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
