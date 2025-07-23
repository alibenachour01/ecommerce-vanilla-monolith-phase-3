export class Product {
    #id;
    name;
    price;
    creator;
    constructor(name, price, creator) {
        this.#id = crypto.randomUUID();
        this.name = name;
        this.price = price;
        this.creator = creator;
    }
    get id() {
        return this.#id;
    }
    getProductInfo() {
        return {
            id: this.#id,
            name: this.name,
            price: this.price,
            creator: this.creator.email,
        };
    }
}
