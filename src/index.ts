import USERS from "./data/users.json";

import type { UserRole } from "./models/user";

import { User } from "./models/user";

export function seed(): void {
	// create all the users from the JSON file
	USERS.forEach((userData) => {
		const user = new User(userData.email, userData.password);
		user.role = userData.role as UserRole;
		console.log(
			`User created: ${user.getUserInfo().email} with role ${user.role}`,
		);
	});
	console.log("Seeding completed.");
	// You can add more seeding logic here if needed
}
