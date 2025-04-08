import axios from 'axios';
import { checkAdminRole } from './jwtConfig'
import { config } from 'dotenv';
// Handle axios
const URLString = 'http://localhost:6789/api/'
const client = axios.create({
    baseURL: URLString, // Địa chỉ API của bạn
});
// Token config
let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken))
    refreshSubscribers = []
}

client.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwtToken'); // Lấy token từ localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Gắn token vào header Authorization
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

client.interceptors.response.use(
    (response) => {
        console.log(`Status Code: ${response.status}`)
        return response
    }, async (error) => {
        const request = error.config
        if (error.response && error.response.status === 401 && !request._retry) {
            sessionStorage.removeItem('jwtToken')
            //window.location.href = '/auth/login'
        }
        return
    }
)

// Staff configuration
export const fetchStaffDetail = (id) => {
    return client.get(`/v1/staffs/${id}`).then((response) => {
        return response;
    });
};

export const fetchStaffByUsername = (username) => {
    return client.get(`/v1/staffs/username/${username}`);
};
export const fetchStaffs = () => client.get('v1/staffs/');

export const updateStaff = (formDataToSend) => {
    return client.put(`${URLString}v1/staffs/`, formDataToSend);
};

export const addStaff = (account) => {
    return client.post(`${URLString}v1/staffs/`, account);
};

export const searchStaff = (keyword) => client.get(`v1/staffs/search?keyword=${keyword}`);

export const deleteStaff = (staffID) => client.delete(`v1/staffs/${staffID}`);


export const addImportStockDetail = (savedStockId, details) => {
    return client.post(`/v1/importStock/${savedStockId}/details`, details, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        console.log("ImportStockDetail added successfully:", response.data);
        return response.data;
    }).catch((error) => {
        console.error("Error adding ImportStockDetail:", error.response || error.message);
        throw error;
    });
};

// Account configuration
const addAccount = (account) => {
    return client.post(`v1/accounts/`, account, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};
const fetchAccounts = () => {
    return client.get(`v1/accounts/`)

}
const fetchAccountDetail = (username) => {

    return client.get(`v1/accounts/${username}`)

}
const deleteAccount = (username) => client.delete(`v1/accounts/${username}`);
const updateAccount = (username, formDataToSend) => {
    return client.put(`v1/accounts/${username}`, formDataToSend);
};
const searchAccount = (keyword) => client.get(`v1/accounts/search?keyword=${keyword}`);


export const sortBooks = (sortBy, sortOrder) => {
    return client.get(`v1/books/sort`, {
        params: {
            sortBy,
            sortOrder,
        },
    });
};

export const searchBook = (keyword) => client.get(`v1/books/search?keyword=${keyword}`)

export const fetchBooksByCategory = (categoryID) => client.get(`v1/books/category?categoryID=${categoryID}`)
// Profile configuration
const changePassword = (changePassword) => client.put('v1/accounts/change', changePassword, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});


export const forgotPassword = (forgotPassword) => axios.post(`${URLString}v1/accounts/email/send/`, forgotPassword, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

export const resetPassword = (resetPassword) => axios.post(`${URLString}v1/accounts/password/reset/`, resetPassword, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

export const verifyEmail = (code) => axios.post(`${URLString}v1/accounts/email/verify/`, code, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

export const verifyAccount = (code) => axios.post(`${URLString}v1/accounts/account/verify/`, code, {
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

const registerAccount = (account) => {
    return axios.post(`${URLString}v1/accounts/register`, account, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

// Login configuration
const loginInstance = axios.create({
    baseURL: 'http://localhost:6789/api/', // Địa chỉ API
});

const login = async (login) => {
    return loginInstance.post('auth/token', login, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

// Logout
const logout = () => {
    const token = sessionStorage.getItem("jwtToken")
    sessionStorage.removeItem("jwtToken")
    return loginInstance.post('auth/logout', token)
}


const fetchNotifications = () => client.get('v1/notifications/');
const fetchNotificationDetail = (notID) => client.get(`v1/notifications/detail/${notID}`); //Get notification detail
const addNotification = (notification) => {
    return client.post('v1/notifications/', notification, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};
const deleteNotification = (notID) => client.delete(`v1/notifications/${notID}`);


const fetchBooks = () => client.get('v1/books/');
const fetchBookDetail = (id) => client.get(`/v1/books/${id}`); // Hàm lấy chi tiết sách
const addBook = (formData) => {
    return client.post('/v1/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

const updateBook = (bookId, formDataToSend) => {
    return axios.put(`${URLString}v1/books/${bookId}`, formDataToSend);
};
const deleteBook = (id) => client.delete(`/books/${id}`);
const fetchBookById = (bookId) => axios.get(`${URLString}v1/books/${bookId}`);
const fetchSuppliers = () => client.get('v1/suppliers/');
// Fetch supplier details by ID
const fetchSupplierDetail = (supID) => {
    console.log("Fetching supplier detail for ID:", supID);  // Log the supID
    return client.get(`/v1/suppliers/${supID}`);
};


const addSupplier = (supplier) => client.post('/v1/suppliers/', supplier);


// Soft-delete a supplier (hide it) by ID
const deleteSupplier = (id) => client.delete(`/suppliers/${id}`);
const updateSupplier = (supID, supplierData) => {
    return client.put(`/v1/suppliers/${supID}`, supplierData, {
        headers: {
            'Content-Type': 'application/json', // Đảm bảo kiểu nội dung là JSON
        }
    });
}
// Fetch supplier by ID (Duplicate method - either remove or keep as an alias to fetchSupplierDetail)
const fetchSupplierById = (supID) => client.get(`/v1/suppliers/${supID}`);

const fetchPromotions = () => client.get('v1/promotions/');
const fetchPromotionsHomepage = () => axios.get(`${URLString}v1/promotions/`);
const fetchPromotionDetail = (proID) => {
    console.log("Fetching promotion detail for ID:", proID);
    return client.get(`/v1/promotions/${proID}`);
};
const addPromotion = (promotion, username) => {
    return client.post('/v1/promotions/', promotion, {
        params: { username },
    });
};

const updatePromotion = (id, promotion) => client.put(`/v1/promotions/${id}`, promotion);
const deletePromotion = (proID, staffID) => {
    return client.delete(`/v1/promotions/${proID}`, {
        params: { staffID }, // Gửi staffID qua query
    });
};


const searchPromotions = (id, term) => {
    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (term) params.append("term", term);
    return client.get(`/v1/promotions/search?${params.toString()}`);
};


const fetchPromotionById = (proID) => client.get(`/v1/promotions/${proID}`);

const fetchCategories = () => {
    return client.get(`v1/categories/`);
}
const fetchCategoryDetail = (catID) => {
    console.log("Fetching category detail for ID:", catID);
    return client.get(`/v1/categories/${catID}`);
};
const addCategory = (category) => {
    console.log("Data being sent to backend in addCategory:", category);
    return client.post('/v1/categories/', category);
};
const updateCategory = (catID, category) => client.put(`/v1/categories/${catID}`, category);
const deleteCategory = (catID) => {
    console.log("Soft deleting category with ID:", catID);
    return client.put(`/v1/categories/${catID}/soft-delete`);
};

const searchCategories = (id, name) => {
    const params = new URLSearchParams();
    if (id) params.append("id", id);
    if (name) params.append("name", name);
    return client.get(`/v1/categories/search?${params.toString()}`);
};
const searchCategoriesByParent = (parent) => {
    const params = new URLSearchParams();
    if (parent) params.append("parent", parent);
    return client.get(`/v1/categories/searchParent?${params.toString()}`);
};

const fetchCategoryById = (catID) => client.get(`/v1/categories/${catID}`);

const fetchOrders = () => client.get('v1/orders/');
const fetchOrdersHomepage = () => client.get(`v1/orders/`);

const searchOrders = (searchTerm) => {
    return client.get(`/v1/orders/search?term=${searchTerm}`);
};

const deleteOrder = (orderID) => {
    console.log("Soft deleting order with ID:", orderID);
    return client.put(`/v1/orders/${orderID}/soft-delete`); // Sử dụng PUT thay vì DELETE
};

const updateOrder = (orderID, orderData) => {
    console.log("Order ID:", orderID);
    console.log("Order Data:", orderData);
    return client.put(`/v1/orders/${orderID}`, orderData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

const addOrder = (orderData) => {
    return client.post('/v1/orders/', orderData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

const CancelOrder = async (orderID, username) => {
    console.log("Order ID:", orderID);
    try {
        const response = await axios.put(`/api/v1/orders/customer/cancel/${orderID}`, {
            username: username // Gửi username để xác thực người dùng
        });
        return response.data;
    } catch (error) {
        console.error("Error canceling order:", error);
    }
};

const fetchOrderDetailsByOrderID = (id) => {
    return axios.get(`/api/v1/orders/details/${id}`);
};

export const fetchOrderDetail = (orderID) => client.get(`v1/orders/${orderID}`);

export const fetchOrderDetail_homepage = (orderID) => client.get(`v1/orders/${orderID}`);
const fetchImportStocks = async () => {
    try {
        const response = await client.get('/v1/importStock/'); // Đảm bảo đây là GET yêu cầu
        console.log('fetchImportStocks response:', response);
        return response;
    } catch (error) {
        console.error('Error in fetchImportStocks:', error);
        throw error;
    }
};


const fetchImportStockById = async (id) => {
    return await client.get(`/importStock/${id}`);
};

const updateImportStock = async (id, data) => {
    return await client.put(`/importStock/${id}`, data);
};

const createImportStock = async (importStockData) => {
    return client.post(`/v1/importStock/`, importStockData); // Sửa lại endpoint cho đúng
};




const deleteImportStock = async (id) => {
    return await client.delete(`/Inventory/${id}`);
};

export const fetchImportStockDetailsByStockId = (id) => {
    console.log("Fetching details for import stock ID:", id);
    return client.get(`/v1/importStock/${id}/details`);
};



// Thêm sách vào giỏ hàng
const addBookToCart = (username, bookID, quantity) => {
    return client.post('v1/cart/add', null, {
        params: {
            username: username,
            bookID: bookID,
            quantity: quantity,
        },
    });
};

// Hàm tạo URL thanh toán
const createPayment = (totalAmount) => {
    return client.post('v1/payment/create', null, {
        params: {
            totalAmount: totalAmount,
        },
    });
};



const handlePaymentReturn = async (queryParams) => {
    try {
        const response = await client.get('/v1/payment/return', {
            params: queryParams, // Gửi tham số đến backend
        });
        return response.data; // Trả về kết quả từ backend
    } catch (error) {
        console.error("Error in handlePaymentReturn:", error.response || error.message);
        throw error;
    }
};






const viewCart = (username) => {
    return client
        .get(`/v1/cart/${username}`) // Sử dụng template string cho đúng cú pháp
        .then((response) => {
            console.log("API Data:", response.data); // Kiểm tra dữ liệu trả về từ backend
            return response.data; // Trả về dữ liệu
        })
        .catch((error) => {
            console.error('Error fetching cart:', error.response || error.message);
            throw error; // Ném lỗi để xử lý ở nơi gọi hàm
        });
};

// Xóa sách khỏi giỏ hàng
const deleteCartItem = (username, cartID) => {
    return client
        .delete('v1/cart/delete', {
            params: {
                username: username,
                cartID: cartID,

            },
        })
        .then((response) => {
            console.log("Cart item deleted successfully:", response.data);
            return response.data;
        })
        .catch((error) => {
            console.error("Error deleting cart item:", error.response || error.message);
            throw error;
        });
};
// Cập nhật số lượng sách trong giỏ hàng
const updateCartItem = (username, bookID, quantity) => {
    client.put(`/v1/cart/update`, null, {
        params: {
            username: username,
            bookID: bookID,
            quantity: quantity,
        },
    })
        .then((response) => {
            console.log("Cart item quantity updated successfully:", response.data);
            return response.data;
        })
        .catch((error) => {
            console.error("Error updating cart item quantity:", error.response || error.message);
            throw error;
        });
    return
};

const fetchPromotionLogs = (activity) => {
    const params = new URLSearchParams();
    if (typeof activity === "string" && activity) {
        params.append("activity", activity);
    }
    return client.get(`/v1/promotions/logs?${params.toString()}`);
};





export {
    fetchPromotionLogs,
    fetchOrderDetailsByOrderID,
    addOrder,
    updateOrder,
    fetchImportStocks,
    fetchImportStockById,
    updateImportStock,
    createImportStock,
    deleteImportStock,
    fetchSupplierById,
    updateSupplier,
    fetchSupplierDetail,
    deleteSupplier,
    addSupplier,
    fetchSuppliers,
    fetchBookById,
    deleteBook,
    updateBook,
    addBook,
    fetchBookDetail,
    fetchBooks,
    addNotification,
    fetchAccounts,
    deleteOrder,
    searchOrders,
    fetchOrders,
    searchPromotions,
    searchCategories,
    updateAccount,
    fetchPromotions,
    fetchPromotionDetail,
    addPromotion,
    updatePromotion,
    deletePromotion,
    fetchPromotionById,
    fetchAccountDetail,
    deleteAccount,
    addAccount,
    fetchCategories,
    fetchCategoryDetail,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchCategoryById,
    fetchNotifications,
    searchAccount,
    registerAccount,
    login,
    logout,
    addBookToCart,
    createPayment, // Thêm hàm createPayment
    handlePaymentReturn,
    viewCart,
    deleteCartItem,
    updateCartItem,
    changePassword,
    searchCategoriesByParent,
    deleteNotification,
    fetchNotificationDetail,
    fetchPromotionsHomepage,
    fetchOrdersHomepage,
    CancelOrder
};