// src/migration/1678881234567-SeedInitialProducts.ts
import { In, type MigrationInterface, type QueryRunner } from "typeorm";
import { User } from "../entities/user.entity"; // Assuming your Product entity is here
import USERS from "../../data/users.json"; // Adjust the path as necessary
import bcrypt from "bcrypt";

export class SeedInitialUsers1678881234567 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Use the queryRunner to get the repository for your entity
		const userRepository = queryRunner.manager.getRepository(User);

		// Create entity instances from your JSON data
		const usersToInsert = USERS.map((data) => {
			const newUser = new User();
			// Hash the password if necessary, e.g., using bcrypt
			newUser.email = data.email;
			newUser.password = bcrypt.hashSync(data.password, 10); // Hashing the password
			newUser.role = (data.role as "user" | "admin") || "user";
			return newUser;
		});
		// Save them to the database
		await userRepository.save(usersToInsert);

		console.log("Initial users seeded successfully!");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// In the down method, you define how to revert the changes.
		// This usually means deleting the seeded data.
		const userRepository = queryRunner.manager.getRepository(User);
		const userEmails = USERS.map((u) => u.email);

		await userRepository.delete({ email: In(userEmails) }); // Using 'In' operator from TypeORM
		console.log("Initial users seeding reverted!");
	}
}
