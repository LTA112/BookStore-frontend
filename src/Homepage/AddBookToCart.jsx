import React, { useState } from "react";
import { Modal, Button, InputNumber, Table, Typography, Tag } from "antd";
import { ShoppingCartOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { addBookToCart } from "../config";
import { useNavigate } from "react-router-dom";

const AddBookToCart = ({ username, bookId, bookData }) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const isDisabled = bookData.bookQuantity === 0 || bookData.bookStatus === 0;

  const handleShowCart = () => {
    setIsModalVisible(false);
    navigate("/cart/ViewDetail");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") {
      return "logo-bookstore.jpg"; // Đường dẫn ảnh mặc định
    }
    if (imageUrl.startsWith("/uploads")) {
      return `http://localhost:6789${imageUrl}`; // Gắn đường dẫn đầy đủ nếu bắt đầu bằng `/uploads`
    }
    if (!imageUrl.startsWith("http")) {
      return `http://localhost:6789/${imageUrl}`; // Gắn đường dẫn đầy đủ nếu thiếu `http`
    }
    return imageUrl; // Trả về ảnh đã hợp lệ
  };
  const handleAddToCart = async () => {
    if (quantity > bookData.bookQuantity) {
      Modal.error({
        title: "Insufficient Stock",
        content: `Only ${bookData.bookQuantity} items are available in stock.`,
      });
      return;
    }

    try {
      await addBookToCart(username, bookId, quantity);
      const existingItemIndex = cartItems.findIndex(
        (item) => item.key === bookId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        updatedItems[existingItemIndex].total =
          updatedItems[existingItemIndex].quantity *
          updatedItems[existingItemIndex].price;
        setCartItems(updatedItems);
      } else {
        const newCartItem = {
          key: bookId,
          name: bookData.bookTitle,
          price: bookData.bookPrice || 0,
          originalPrice: bookData.originalPrice || 0,
          discount: bookData.discount || 0,
          quantity: quantity,
          total: quantity * (bookData.bookPrice || 0),
          image: bookData.image || "logo-bookstore.jpg",
        };
        setCartItems((prevItems) => [...prevItems, newCartItem]);
      }

      setIsModalVisible(true);
    } catch (error) {
      Modal.error({
        title: "Error",
        content: "Failed to add book to cart. Please try again.",
      });
    }
  };

  const handleCheckout = () => {
    navigate("/OrderPage", {
      state: {
        bookData: [
          {
            bookID: parseInt(bookId, 10),
            bookTitle: bookData.bookTitle,
            price: bookData.bookPrice,
            quantity: quantity,
            total: quantity * bookData.bookPrice,
            image: bookData.image,
          },
        ],
      },
    });
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={normalizeImageUrl(bookData.image)}
            alt={text}
            style={{ width: 40, height: 50, marginRight: 10 }}
          />
          <Typography.Text>{text}</Typography.Text>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <div>
          <Typography.Text>{text.toLocaleString()}đ</Typography.Text>
          {record.discount > 0 && (
            <>
              <br />
              <Typography.Text delete style={{ color: "#999" }}>
                {record.originalPrice.toLocaleString()}đ
              </Typography.Text>
              <Tag color="volcano" style={{ marginLeft: 5 }}>
                -{record.discount}%
              </Tag>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Typography.Text>{total.toLocaleString()}đ</Typography.Text>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          style={{
            width: "150px",
            height: "45px",
            backgroundColor: isDisabled ? "#d9d9d9" : "#FF4500",
            borderColor: isDisabled ? "#d9d9d9" : "#FF4500",
            fontWeight: "bold",
            color: isDisabled ? "#999" : "#fff",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
          onClick={handleCheckout}
          disabled={isDisabled} // Vô hiệu hóa nếu hết sách hoặc trạng thái = 0
        >
          Buy now
        </Button>

        <div>
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Quantity
          </div>
          <InputNumber
            min={1}
            defaultValue={1}
            value={quantity}
            onChange={(value) => {
              console.log("Stock quantity:", bookData.bookQuantity);
              console.log("User entered:", value);

              if (value > bookData.bookQuantity) {
                Modal.warning({
                  title: "Exceeds Stock Quantity",
                  content: `Only ${bookData.bookQuantity} items are available in stock.`,
                });
                setQuantity(bookData.bookQuantity);
              } else {
                setQuantity(value);
              }
            }}
            disabled={isDisabled} // Vô hiệu hóa nếu hết sách hoặc trạng thái = 0
          />
        </div>

        <Button
          style={{
            width: "150px",
            height: "45px",
            borderColor: isDisabled ? "#d9d9d9" : "#FF4500",
            color: isDisabled ? "#999" : "#FF4500",
            fontWeight: "bold",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={isDisabled} // Vô hiệu hóa nếu hết sách hoặc trạng thái = 0
        >
          Add to cart
        </Button>
      </div>

      <Modal
        title={
          <Typography.Text strong style={{ fontSize: "16px" }}>
            Added to cart
          </Typography.Text>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={cartItems}
          pagination={false}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={3}>
                <Typography.Text strong>Total:</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Typography.Text strong>
                  {cartItems
                    .reduce((acc, item) => acc + item.total, 0)
                    .toLocaleString()}
                  đ
                </Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text strong style={{ fontSize: "16px" }}>
            Cart Subtotal:{" "}
            {cartItems
              .reduce((acc, item) => acc + item.total, 0)
              .toLocaleString()}
            đ
          </Typography.Text>
          <Button onClick={handleShowCart}>Go to Cart</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AddBookToCart;
