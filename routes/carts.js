const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/Product');

// ... otras rutas ...

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    cart.products = cart.products.filter((product) => product.product.toString() !== req.params.pid);
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    cart.products = req.body.products;
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

// Actualizar la cantidad de ejemplares del producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    const productIndex = cart.products.findIndex((product) => product.product.toString() === req.params.pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = req.body.quantity;
      await cart.save();
      res.json({ status: 'success', payload: cart });
    } else {
      res.status(404).json({ status: 'error', payload: 'Product not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', payload: error.message });
  }
});

module.exports = router;
