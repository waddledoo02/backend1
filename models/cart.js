const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // ... otras propiedades ...
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
