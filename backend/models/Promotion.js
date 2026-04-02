const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, default: 0 }, // Giảm theo %
    discountAmount: { type: Number, default: 0 },     // Giảm trừ tiền mặt
    minPurchase: { type: Number, default: 0 },        // Đơn tối thiểu
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
