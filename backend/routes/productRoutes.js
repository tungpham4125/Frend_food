const express = require('express');
const { getProducts, getProductById, createProduct, seedProducts } = require('../controllers/productController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOrStaff, createProduct);

// Endpoint đặc biệt để tạo dữ liệu mẫu
router.post('/seed', seedProducts);

module.exports = router;
