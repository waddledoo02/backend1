const express = require('express');
const fs = require('fs/promises');

const app = express();
const PORT = 8080;

app.use(express.json());

// Manejo de productos
const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const products = await getProducts();
        res.json(limit ? products.slice(0, limit) : products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

productsRouter.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const products = await getProducts();
        const product = products.find((p) => p.id === productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

productsRouter.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const products = await getProducts();
        newProduct.id = generateUniqueId(products);
        products.push(newProduct);
        await saveProducts(products);
        res.json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

productsRouter.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updates = req.body;
        const products = await getProducts();
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        products[productIndex] = { ...products[productIndex], ...updates };
        await saveProducts(products);
        res.json(products[productIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

productsRouter.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const products = await getProducts();
        const filteredProducts = products.filter((p) => p.id !== productId);
        if (filteredProducts.length === products.length) {
            throw new Error('Producto no encontrado');
        }
        await saveProducts(filteredProducts);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

app.use('/api/products', productsRouter);

// Manejo de carritos
const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = {
            id: generateUniqueId(await getCarts()),
            products: [],
        };
        const carts = await getCarts();
        carts.push(newCart);
        await saveCarts(carts);
        res.json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const carts = await getCarts();
        const cart = carts.find((c) => c.id === cartId);
        if (cart) {
            res.json(cart.products);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;

        const carts = await getCarts();
        const products = await getProducts();

        const cartIndex = carts.findIndex((c) => c.id === cartId);
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        const productIndex = products.findIndex((p) => p.id == productId);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }

        const existingProduct = carts[cartIndex].products.find(
            (p) => p.product === productId
        );

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            carts[cartIndex].products.push({
                product: productId,
                quantity: quantity,
            });
        }

        await saveCarts(carts);
        res.json(carts[cartIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

app.use('/api/carts', cartsRouter);

// Funciones auxiliares
async function getProducts() {
    const data = await fs.readFile('productos.json', 'utf8');
    return JSON.parse(data);
}

async function saveProducts(products) {
    await fs.writeFile('productos.json', JSON.stringify(products), 'utf8');
}

async function getCarts() {
    const data = await fs.readFile('carrito.json', 'utf8');
    return JSON.parse(data);
}

async function saveCarts(carts) {
    await fs.writeFile('carrito.json', JSON.stringify(carts), 'utf8');
}

function generateUniqueId(items) {
    const ids = new Set(items.map((item) => item.id));
    let newId = Math.floor(Math.random() * 1000);
    while (ids.has(newId)) {
        newId = Math.floor(Math.random() * 1000);
    }
    return newId;
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
