import crypto from "node:crypto";

export type UserType = {
	id: string;
	email: string;
	password: string;
	role: UserRole;
};

export type UserRole = "user" | "admin";

export type UserInfo = Pick<UserType, "id" | "email" | "role">;

export class User {
	#id;
	#role: UserRole;
	email;
	#password;

	constructor(email: string, password: string) {
		this.#id = crypto.randomUUID();
		this.email = email;
		this.#password = password;
		this.#role = "user"; // Default role is 'user'
	}

	get id(): string {
		return this.#id;
	}

	get role(): UserRole {
		return this.#role;
	}

	set role(newRole: UserRole) {
		if (newRole === "user" || newRole === "admin") {
			this.#role = newRole;
		} else {
			throw new Error("Invalid role. Role must be 'user' or 'admin'.");
		}
	}

	getUserInfo(): UserInfo {
		return {
			id: this.#id,
			email: this.email,
			role: this.#role,
		};
	}
}
