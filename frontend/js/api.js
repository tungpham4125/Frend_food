// frontend/assets/js/api.js
const BASE_URL = 'http://localhost:5000/api';

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        return [];
    }
};