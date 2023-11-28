const fs = require('fs');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.loadProducts();
        this.lastCode = 0; // Inicializamos el último código utilizado a 0
    }

    loadProducts() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            this.products = JSON.parse(data);
        } catch (err) {
            this.products = [];
        }
    }

    saveProducts() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.products), 'utf8');
    }

    generateUniqueCode() {
        this.lastCode++;
        return `code_${this.lastCode}`;
    }

    getProducts() {
        return this.products;
    }

    addProduct(title, description, price, thumbnail, stock) {
        const code = this.generateUniqueCode(); // Generamos un código único
        const id = Date.now();
        const product = { id, title, description, price, thumbnail, stock, code };
        this.products.push(product);
        this.saveProducts();
        return product;
    }

    getProductById(id) {
        const product = this.products.find((p) => p.id === id);
        if (!product) {
            throw new Error("Product not found.");
        }
        return product;
    }

    updateProduct(id, updates) {
        const productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            throw new Error('Product not found');
        }
        this.products[productIndex] = { ...this.products[productIndex], ...updates };
        this.saveProducts();
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            throw new Error('Product not found');
        }
        this.products.splice(productIndex, 1);
        this.saveProducts();
    }
}




module.exports = ProductManager;


const productManager = new ProductManager('productos.json'); // 'productos.json' es el nombre del archivo donde se guardarán los productos

const products = productManager.getProducts();

try {
    const newProduct = productManager.addProduct(
        "producto prueba",
        "Este es un producto prueba",
        200,
        "Sin imagen",
        "abc123",
        25
    );

    const productById = productManager.getProductById(newProduct.id);
    console.log(products);
} catch (error) {
    console.error(error.message);
}