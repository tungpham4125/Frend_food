const Order = require('../models/Order');

const normalizeStatus = (status) => {
    const s = String(status || '').trim();
    if (!s) return '';
    if (s === 'Chờ xác nhận') return 'Chờ xử lý';
    if (s === 'Đang giao hàng') return 'Đang giao';
    return s;
};

// Create new order (Online or POS)
const addOrderItems = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice, orderType, discountAmount, voucherCode } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'Không có sản phẩm nào trong đơn hàng' });
    }

    try {
        const order = new Order({
            user: req.user ? req.user.id : null, 
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            discountAmount: discountAmount || 0,
            voucherCode: voucherCode || '',
            orderType: orderType || 'Online',
            status: 'Chờ xử lý'
        });

        // Setup QR Code For Payment Support if requested
        let qrCodeUrl = null;
        if (paymentMethod === 'Chuyển khoản QR') {
            const bankId = '970415'; // Viettinbank example
            const accountNo = '1133668899'; // Example Account
            const accountName = 'FRESHFOOD';
            qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${totalPrice}&addInfo=Thanh toan don hang ${order._id}&accountName=${accountName}`;
        }

        const createdOrder = await order.save();
        res.status(201).json({ order: createdOrder, qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo đơn hàng' });
    }
};


// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'username fullName');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin đơn hàng' });
    }
};

// Update order status (Admin/Staff)
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            const nextStatus = normalizeStatus(req.body.status || order.status);
            order.status = nextStatus || order.status;
            if(req.body.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
            // If completed, auto mark as paid for COD flow consistency
            if (order.status === 'Hoàn thành' && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật đơn hàng' });
    }
};

// User confirms order received -> completed
const markOrderReceived = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        // ensure order belongs to current user
        if (!order.user || String(order.user) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Không có quyền cập nhật đơn hàng này' });
        }

        if (normalizeStatus(order.status) === 'Đã hủy') {
            return res.status(400).json({ message: 'Đơn đã hủy, không thể xác nhận nhận hàng' });
        }

        order.status = 'Hoàn thành';
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }
        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái nhận hàng' });
    }
};

// Get logged in user orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};

// Get all orders (Admin/Staff)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id fullName').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn' });
    }
};

module.exports = { addOrderItems, getOrderById, updateOrderStatus, markOrderReceived, getMyOrders, getOrders };
