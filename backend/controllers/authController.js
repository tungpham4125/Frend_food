const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
    const { username, password, fullName, phone } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword,
            fullName,
            phone,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }
    } catch (error) {
        console.error('❌ Register Error:', error.message, error.stack);
        res.status(500).json({ message: 'Lỗi server', detail: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Đăng nhập không thành công' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error('❌ Login Error:', error.message, error.stack);
        res.status(500).json({ message: 'Lỗi server', detail: error.message });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Không thể xóa tài khoản Admin' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa hệ thống thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { register, login, getAllUsers, deleteUser };
