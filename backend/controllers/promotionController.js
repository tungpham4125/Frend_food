const Promotion = require('../models/Promotion');

const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({ isActive: true });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const createPromotion = async (req, res) => {
    try {
        const { code, discountPercentage, discountAmount, minPurchase, expiryDate } = req.body;
        const exists = await Promotion.findOne({ code });
        if (exists) return res.status(400).json({ message: 'Mã này đã tồn tại' });

        const promo = new Promotion({ code, discountPercentage, discountAmount, minPurchase, expiryDate });
        const savedPromo = await promo.save();
        res.status(201).json(savedPromo);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo mã' });
    }
};

const applyPromotion = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        const promo = await Promotion.findOne({ code, isActive: true });
        
        if (!promo) return res.status(404).json({ message: 'Mã không tồn tại hoặc đã hết hạn' });
        if (new Date() > promo.expiryDate) return res.status(400).json({ message: 'Mã đã hết hạn' });
        if (orderValue < promo.minPurchase) return res.status(400).json({ message: `Đơn tối thiểu phải từ ${promo.minPurchase}đ` });

        res.json({
            message: 'Áp dụng mã thành công',
            discountPercentage: promo.discountPercentage,
            discountAmount: promo.discountAmount
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { getPromotions, createPromotion, applyPromotion };
