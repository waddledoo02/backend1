const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const exphbs = require('express-handlebars');
const fs = require('fs/promises');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 8080;

app.use(express.json());
app.use(express.static('public')); // Puedes agregar un directorio public para tus archivos estáticos

// Configurar Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', './views'); // Asegúrate de tener un directorio 'views' en tu proyecto

// WebSockets
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Emitir lista de productos al cliente cuando se conecta
    socket.emit('products', getProducts());

    // Escuchar eventos desde el cliente
    socket.on('newProduct', async (newProduct) => {
        // Procesar la creación de un nuevo producto
        await addProduct(newProduct);
        // Actualizar la lista de productos y emitir a todos los clientes
        io.emit('products', await getProducts());
    });

    socket.on('deleteProduct', async (productId) => {
        // Procesar la eliminación de un producto
        await deleteProduct(productId);
        // Actualizar la lista de productos y emitir a todos los clientes
        io.emit('products', await getProducts());
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Vista con Handlebars para la lista de productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    const products = await getProducts();
    res.render('realTimeProducts', { products });
});

// Vista con Handlebars para la lista de productos estática
app.get('/', async (req, res) => {
    const products = await getProducts();
    res.render('home', { products });
});

// Funciones auxiliares
async function getProducts() {
    try {
        const data = await fs.readFile('productos.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveProducts(products) {
    await fs.writeFile('productos.json', JSON.stringify(products), 'utf8');
}

async function addProduct(newProduct) {
    const products = await getProducts();
    newProduct.id = generateUniqueId(products);
    products.push(newProduct);
    await saveProducts(products);
}

async function deleteProduct(productId) {
    const products = await getProducts();
    const filteredProducts = products.filter((p) => p.id !== productId);
    await saveProducts(filteredProducts);
}

function generateUniqueId(items) {
    const ids = new Set(items.map((item) => item.id));
    let newId = Math.floor(Math.random() * 1000);
    while (ids.has(newId)) {
        newId = Math.floor(Math.random() * 1000);
    }
    return newId;
}

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
