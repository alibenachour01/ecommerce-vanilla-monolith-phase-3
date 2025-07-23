import crypto from "node:crypto";
export class User {
    #id;
    #role;
    email;
    #password;
    constructor(email, password) {
        this.#id = crypto.randomUUID();
        this.email = email;
        this.#password = password;
        this.#role = "user"; // Default role is 'user'
    }
    get id() {
        return this.#id;
    }
    get role() {
        return this.#role;
    }
    set role(newRole) {
        if (newRole === "user" || newRole === "admin") {
            this.#role = newRole;
        }
        else {
            throw new Error("Invalid role. Role must be 'user' or 'admin'.");
        }
    }
    getUserInfo() {
        return {
            id: this.#id,
            email: this.email,
            role: this.#role,
        };
    }
}
