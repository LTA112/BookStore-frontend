import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Select, InputNumber, message } from "antd";
import {
  fetchBooks,
  fetchPromotions,
  addOrder,
  fetchAccounts,
  fetchAccountDetail,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

const { Option } = Select;

const AddOrder = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState({});

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    // Fetch dữ liệu sách và khuyến mãi
    fetchBooks()
      .then((response) => {
        setBooks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });


    // Fetch danh sách tài khoản
    fetchAccounts()
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
      });
  }, []);

  const handleAccountChange = async (accountId) => {
    setSelectedAccount(accountId);

    try {
      const response = await fetchAccountDetail(accountId); // Gọi API lấy thông tin chi tiết tài khoản
      const accountDetails = response.data;
      setSelectedAccountDetails(accountDetails); // Lưu chi tiết tài khoản
    } catch (error) {
      console.error("Error fetching account details:", error);
      message.error("Failed to fetch account details.");
    }
  };

  const handleBookChange = (bookIds) => {
    const selectedBooksData = books.filter((book) =>
      bookIds.includes(book.bookID)
    );
    const totalBooksPrice = selectedBooksData.reduce(
      (total, book) => total + book.bookPrice,
      0
    );

    setSelectedBooks(selectedBooksData);

    // Tính tổng giá sách * quantity
    const totalPriceWithoutDiscount = selectedBooksData.reduce(
      (acc, book) =>
        acc +
        book.bookPrice * (form.getFieldValue(`quantity_${book.bookID}`) || 0),
      0
    );

    // Áp dụng chiết khấu nếu có
    const discountAmount = selectedPromotion?.discount
      ? (totalPriceWithoutDiscount * selectedPromotion.discount) / 100
      : 0;
    const finalPrice = totalPriceWithoutDiscount - discountAmount;

    setTotalPrice(finalPrice);
  };

  const handlePromotionChange = (promotionId) => {
    const promotion = promotions.find((promo) => promo.proID === promotionId);
    setSelectedPromotion(promotion);

    const totalPriceWithoutDiscount = selectedBooks.reduce(
      (acc, book) =>
        acc +
        book.bookPrice * (form.getFieldValue(`quantity_${book.bookID}`) || 0),
      0
    );

    // Áp dụng chiết khấu nếu có
    const discountAmount = promotion?.discount
      ? (totalPriceWithoutDiscount * promotion.discount) / 100
      : 0;
    const finalPrice = totalPriceWithoutDiscount - discountAmount;

    setTotalPrice(finalPrice);
  };

  const handleSubmit = async (values) => {
    try {
      const orderData = {
        orderDTO: {
          username: selectedAccount,
          proID: selectedPromotion?.proID || null,
          orderDate: new Date().toISOString().slice(0, 10), // Lấy ngày hiện tại
          orderStatus: 1,
          orderAddress: selectedAccountDetails.address || "N/A", // Lấy địa chỉ từ tài khoản
          email: selectedAccountDetails.email || "N/A", // Lấy email từ tài khoản
        },
        orderDetails: selectedBooks.map((book) => ({
          bookID: book.bookID,
          quantity: values[`quantity_${book.bookID}`],
          totalPrice: book.bookPrice * values[`quantity_${book.bookID}`],
        })),
      };

      console.log("Sending orderData:", JSON.stringify(orderData, null, 2)); // In dữ liệu gửi

      const response = await addOrder(orderData);
      message.success("Order added successfully");
      navigate("/dashboard/orders");
    } catch (error) {
      console.error("Error adding order:", error);
      message.error("Failed to add order");
    }
  };

  const handleFormChange = () => {
    const totalPriceWithoutDiscount = selectedBooks.reduce(
      (acc, book) =>
        acc +
        book.bookPrice * (form.getFieldValue(`quantity_${book.bookID}`) || 0),
      0
    );

    const discountAmount = selectedPromotion?.discount
      ? (totalPriceWithoutDiscount * selectedPromotion.discount) / 100
      : 0;
    const finalPrice = totalPriceWithoutDiscount - discountAmount;

    setTotalPrice(finalPrice);

    const values = form.getFieldsValue();
    const isEmpty =
      !values.books || values.books.length === 0 || !selectedAccount;
    setIsFormEmpty(isEmpty);
  };

  const handleResetOrBack = () => {
    if (isFormEmpty) {
      navigate("/dashboard/orders");
    } else {
      form.resetFields();
      setIsFormEmpty(true);
      setTotalPrice(0);
      setSelectedBooks([]);
      setSelectedPromotion(null);
      setSelectedAccount(null);
      message.info("Form has been reset");
    }
  };

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div className="dashboard-content">
        <div className="titlemanagement">
          <h2>Order Management - Add Order</h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFieldsChange={handleFormChange}
          style={{ maxWidth: "600px", margin: "auto" }}
        >
          <Form.Item
            label="Select Account"
            name="account"
            rules={[{ required: true, message: "Please select an account" }]}
          >
            <Select
              placeholder="Select an account"
              onChange={handleAccountChange}
              style={{ width: "100%" }}
            >
              {accounts.map((account) => (
                <Option key={account.username} value={account.username}>
                  {account.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Select Books"
            name="books"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              placeholder="Select books"
              onChange={handleBookChange}
              style={{ width: "100%" }}
            >
              {books.map((book) => (
                <Option key={book.bookID} value={book.bookID}>
                  {book.bookTitle} - {book.bookPrice} đ
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedBooks.map((book) => (
            <Form.Item
              key={book.bookID}
              label={`Quantity for ${book.bookTitle}`}
              name={`quantity_${book.bookID}`}
              rules={[{ required: true, message: "Please enter quantity" }]}
            >
              <InputNumber
                placeholder="Quantity"
                min={1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          ))}

          <Form.Item label="Select Promotion" name="promotion">
            <Select
              placeholder="Select promotion (optional)"
              onChange={handlePromotionChange}
              style={{ width: "100%" }}
              allowClear
            >
              {promotions.map((promotion) => (
                <Option key={promotion.proID} value={promotion.proID}>
                  {promotion.proName} - {promotion.discount}% off
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Total Price">
            <InputNumber
              value={totalPrice}
              disabled
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              htmlType="button"
              onClick={handleResetOrBack}
              style={{ marginLeft: "20px" }}
            >
              {isFormEmpty ? "Back" : "Reset"}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
};

export default AddOrder;
