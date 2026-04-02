const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate Revenue (Total Paid)
        const orders = await Order.find({ isPaid: true });
        const revenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Optional: Sales per day (last 7 days logic can be here)

        res.json({
            totalOrders,
            totalProducts,
            totalUsers,
            revenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tải thống kê', error });
    }
};

module.exports = { getDashboardStats };
