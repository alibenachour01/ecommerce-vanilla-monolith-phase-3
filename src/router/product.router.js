import { Router } from "express";
import { createProduct, getAllProducts } from "../controllers/product.controller";
export const productRouter = Router();
// POST /products/create
productRouter.post("/create", (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required." });
    }
    try {
        const newProduct = createProduct(name, price);
        return res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: "Product creation failed." });
    }
});
// You can add more product-related routes here, e.g., GET /products, PUT /products/:id, DELETE /products/:id
// Example: GET /products
productRouter.get("/", (_req, res) => {
    const products = getAllProducts();
    if (products.length === 0) {
        return res.status(404).json({ message: "No products found." });
    }
    return res.json(products);
});
