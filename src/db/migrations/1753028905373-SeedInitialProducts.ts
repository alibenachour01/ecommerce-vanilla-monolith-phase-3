// src/migration/1678881234567-SeedInitialProducts.ts
import { In, type MigrationInterface, type QueryRunner } from "typeorm";
import { Product } from "../entities/product.entity";
import { User } from "../entities/user.entity";
import PRODUCT from "../../data/products.json";

export class SeedInitialProducts1678881234567 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Use the queryRunner to get the repository for your entity
		const productRepository = queryRunner.manager.getRepository(Product);
		const userRepository = await queryRunner.manager.getRepository(User);

		const creator = await userRepository.save({
			email: "admin-bot@email.com",
			password: "Admin1234",
			role: "admin",
		});
		// Create entity instances from your JSON data
		const productsToInsert = PRODUCT.map((data) => {
			// console.log("Seeding product:", data.name);
			return productRepository.create({
				...data,
				creator: creator,
			});
		});

		// Save them to the database
		await productRepository.save(productsToInsert);

		console.log("Initial products seeded successfully!");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// In the down method, you define how to revert the changes.
		// This usually means deleting the seeded data.
		const productRepository = queryRunner.manager.getRepository(Product);
		const productNames = PRODUCT.map((p) => p.name);

		await productRepository.delete({ name: In(productNames) }); // Using 'In' operator from TypeORM
		console.log("Initial products seeding reverted!");
	}
}
