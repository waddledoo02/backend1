const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoosePaginate = require('mongoose-paginate-v2');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || '';
    const query = req.query.query || '';

    const options = {
      limit,
      page,
      sort: sort === 'desc' ? { price: -1 } : sort === 'asc' ? { price: 1 } : {},
    };

    const filter = query ? { category: query } : {};

    const result = await Product.paginate(filter, options);
    const totalPages = result.totalPages;
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const hasPrevPage = prevPage !== null;
    const hasNextPage = nextPage !== null;
    const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null;
    const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null;

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      payload: error.message,
    });
  }
});

module.exports = router;
