export class Cart {
    #id;
    #userId;
    #products;
    #totalPrice;
    constructor(userId) {
        this.#id = crypto.randomUUID();
        this.#userId = userId;
        this.#products = [];
        this.#totalPrice = 0;
    }
    get userId() {
        return this.#userId;
    }
    get products() {
        return this.#products;
    }
    get totalPrice() {
        return this.#totalPrice;
    }
    get id() {
        return this.#id;
    }
    addProducts(products) {
        products.forEach((product) => {
            this.addProduct(product);
        });
    }
    addProduct(product) {
        this.#products.push(product);
        this.#totalPrice += product.price;
    }
    removeProduct(productId) {
        const productIndex = this.#products.findIndex((p) => p.id === productId);
        if (productIndex !== -1 && this.#products[productIndex]) {
            this.#totalPrice -= this.#products[productIndex].price;
            this.#products.splice(productIndex, 1);
        }
    }
}
