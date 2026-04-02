const express = require('express');
const { addOrderItems, getOrderById, updateOrderStatus, getMyOrders, getOrders } = require('../controllers/orderController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addOrderItems); // user ordering
router.post('/pos', protect, adminOrStaff, addOrderItems); // POS direct order
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOrStaff, updateOrderStatus);
router.get('/', protect, adminOrStaff, getOrders);

module.exports = router;
