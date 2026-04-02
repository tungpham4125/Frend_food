const express = require('express');
const { getPromotions, createPromotion, applyPromotion } = require('../controllers/promotionController');
const { protect, adminOrStaff } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getPromotions);
router.post('/', protect, adminOrStaff, createPromotion);
router.post('/apply', protect, applyPromotion);

module.exports = router;
