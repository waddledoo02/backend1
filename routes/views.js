const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/cart');

// Vista para visualizar todos los productos con paginación
router.get('/products', async (req, res) => {
  try {
    const limit = 10;
    const page = req.query.page || 1;
    const sort = req.query.sort || '';
    const query = req.query.query || '';

    const options = {
      limit,
      page,
      sort: sort === 'desc' ? { price: -1 } : sort === 'asc' ? { price: 1 } : {},
    };

    const filter = query ? { category: query } : {};

    const products = await Product.paginate(filter, options);

    res.render('products', {
      products: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/views/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}` : null,
      nextLink: products.hasNextPage ? `/views/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}` : null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

// Vista para visualizar un carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

module.exports = router;
