import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Checkbox,
  Button,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  Dropdown,
  Menu,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { viewCart, updateCartItem, deleteCartItem, logout } from "../config"; // API functions
import { decodeJWT } from "../jwtConfig";

const { Header, Footer, Content } = Layout;
const { Text } = Typography;

const CartDetails = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const username = decodeJWT().sub; // Fetch username directly

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await viewCart(username);
        const formattedData = data.map((item) => ({
          id: item.cartID,
          bookID: item.bookID?.bookID, // Không nên gán `null`, thay vào đó cần kiểm tra lỗi nếu thiếu
          name: item.bookID?.bookTitle || "Unknown",
          price: item.bookID?.bookPrice || 0,
          quantity: item.quantity,
          selected: false,
          total: (item.bookID.bookPrice || 0) * (item.quantity || 1),
          image: item.bookID.image,
          bookStatus: item.bookID.bookStatus,
          bookQuantity: item.bookID.bookQuantity || 0,
        }));
        setCartItems(formattedData);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    if (username) {
      fetchCart();
    } else {
      navigate("/auth/login");
    }
  }, [username, navigate]);

  // Calculate total amount
  const calculateTotal = () =>
    cartItems.reduce(
      (total, item) =>
        item.selected ? total + item.price * item.quantity : total,
      0
    );

  const normalizeImageUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") {
      return "/logo-capybook.png"; // Đường dẫn ảnh mặc định
    }
    if (imageUrl.startsWith("/uploads")) {
      return `http://localhost:6789${imageUrl}`; // Gắn đường dẫn đầy đủ nếu bắt đầu bằng `/uploads`
    }
    if (!imageUrl.startsWith("http")) {
      return `http://localhost:6789/${imageUrl}`; // Gắn đường dẫn đầy đủ nếu thiếu `http`
    }
    return imageUrl; // Trả về ảnh đã hợp lệ
  };
  // Handle quantity change

  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleQuantityChange = async (value, itemId) => {
    try {
      const item = cartItems.find((item) => item.id === itemId);

      // Đảm bảo chỉ xử lý khi có item hợp lệ
      if (!item) return;

      let modalShown = false;
      if (item) {
        // Nếu số lượng vượt quá số lượng trong kho
        if (value > item.bookQuantity) {
          Modal.error({
            content: `Quantity in cart exceeds available stock (${item.bookQuantity} left).`,
          });

          // Tự động chỉnh số lượng về mức tối đa có thể đặt
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                  ...item,
                  quantity: item.bookQuantity,
                  total: item.bookQuantity * item.price,
                }
                : item
            )
          );
          return;
        }

        // Nếu người dùng nhập số lượng < 1
        if (value <= 0) {
          handleZeroQuantity(itemId, item);
          return;
        }

        console.log("Updating cart item with:", {
          username,
          id: item.id,
          quantity: value,
        });

        await updateCartItem(username, item.id, value);

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, quantity: value, total: value * item.price }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };
  const handleZeroQuantity = (itemId, item) => {
    if (isModalVisible) return; // Đảm bảo không hiển thị Modal nhiều lần
    setIsModalVisible(true);

    Modal.confirm({
      title: "Remove item from cart?",
      content:
        "You have set the quantity to 0. Do you want to remove this item from your cart?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        // Xóa mục khỏi giỏ hàng
        await handleDeleteItemAfterPay(itemId);
        setIsModalVisible(false);
      },
      onCancel: () => {
        // Đặt lại số lượng cũ nếu người dùng không muốn xóa
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                ...item,
                quantity: item.quantity,
                total: item.quantity * item.price,
              }
              : item
          )
        );
        setIsModalVisible(false);
      },
    });
  };

  // Handle select item
  const handleSelectItem = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleDeleteItem = async (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    Modal.confirm({
      title: "Confirm Deletion",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      content: (
        <>
          <Text>
            Are you sure you want to delete <Text strong>{item.name}</Text> from
            your cart?
          </Text>
          <br />
          <Text type="danger">This action cannot be undone!</Text>
        </>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      centered: true,
      onOk: async () => {
        try {
          const response = await deleteCartItem(username, item.id);
          if (response) {
            setCartItems((prev) => prev.filter((item) => item.id !== itemId));
            message.success("Item deleted successfully.");
          } else {
            console.error("Failed to delete cart item.");
            message.error("Failed to delete the item. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting cart item:", error);
          message.error("An error occurred while deleting the item.");
        }
      },
      onCancel: () => {
        message.info("Deletion cancelled.");
      },
    });
  };
  const handleDeleteItemAfterPay = async (itemId) => {
    try {
      const item = cartItems.find((item) => item.id === itemId);
      if (item) {
        const response = await deleteCartItem(username, item.id);
        if (response) {
          setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        } else {
          console.error("Failed to delete cart item.");
        }
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  // Handle select all items
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setCartItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected:
          isChecked && // Chỉ chọn khi tất cả điều kiện hợp lệ
          item.bookStatus !== 0 &&
          item.bookQuantity > 0 &&
          item.quantity <= item.bookQuantity,
      }))
    );
  };
  const invalidItems = cartItems.filter(
    (item) => item.bookStatus === 0 || item.bookQuantity === 0
  );
  const validItems = cartItems.filter(
    (item) => item.bookStatus !== 0 && item.bookQuantity > 0
  );
  const ConfirmModal = ({ visible, onConfirm, onCancel }) => {
    return (
      <Modal
        visible={visible}
        title="Remove item from cart?"
        onOk={onConfirm}
        onCancel={onCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>
          You have set the quantity to 0. Do you want to remove this item from
          your cart?
        </p>
      </Modal>
    );
  };

  const handleDashboardClick = () => {
    navigate("/dashboard/income-statistic");
  };
  const handleNotificationClick = () => {
    navigate("/notifications");
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // Hàm tính tổng số sản phẩm hợp lệ trong cart
  const countValidItems = () => {
    return cartItems.filter(
      (item) => item.bookStatus !== 0 && item.bookQuantity > 0
    ).length;
  };

  const userMenu = () => {
    if (decodeJWT()) {
      return (
        <Menu>
          {decodeJWT().scope != "CUSTOMER" ? (
            <Menu.Item
              key="dashboard"
              icon={<AppstoreOutlined />}
              onClick={handleDashboardClick}
            >
              Dashboard
            </Menu.Item>
          ) : (
            <Menu.Item
              key="profile"
              icon={<AppstoreOutlined />}
              onClick={() => {
                navigate("/profile");
              }}
            >
              Profile
            </Menu.Item>
          )}
          <Menu.Item
            key="order-history"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate("/OrderHistory")}
          >
            Order History
          </Menu.Item>
          <Menu.Item
            key="signout"
            icon={<SettingOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu>
      );
    } else navigate("/auth/login");
  };
  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#0fa4d6",
          padding: "0 20px",
          height: "64px",
          color: "#fff",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img
            src="/logo-capybook.png"
            alt="Capybook Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Capybook</div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="text"
            icon={
              <BellOutlined
                style={{
                  fontSize: "24px",
                  marginRight: "20px",
                  color: "#fff",
                }}
                onClick={handleNotificationClick}
              />
            }
            style={{ color: "#fff" }}
          ></Button>

          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ color: "#fff" }}
            >
              {localStorage.getItem("jwtToken")
                ? decodeJWT(localStorage.getItem("jwtToken")).sub
                : "Login"}
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ padding: "20px", backgroundColor: "#f0f2f5" }}>
        <Card
          title={
            <div>
              Shopping Cart - CapyBook{" "}
              <Text type="secondary" style={{ fontSize: "14px" }}>
                ({countValidItems()} products)
              </Text>
            </div>
          }
          style={{ width: "100%" }}
        >
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px" }}>

              <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
                Your Cart is empty{" "}
              </Text>

              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/")} // Điều hướng người dùng đến trang sách
              >
                Go to Homepage
              </Button>
            </div>
          ) : (
            <>
              <Row
                align="middle"
                style={{
                  backgroundColor: "#1E90FF",
                  padding: "10px",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "10px",
                }}
              >
                <Col span={1}>
                  <Checkbox
                    onChange={handleSelectAll}
                    checked={cartItems.every((item) => item.selected)}
                  />
                </Col>
                <Col span={6}>
                  <Text style={{ color: "#fff" }}>Select all </Text>(
                  {countValidItems()} products)
                </Col>
                <Col span={4}>
                  <Text style={{ color: "#fff" }}>Quantity</Text>
                </Col>
                <Col span={4}>
                  <Text style={{ color: "#fff" }}>Price</Text>
                </Col>
                <Col span={4}>
                  <Text style={{ color: "#fff" }}>Total</Text>
                </Col>
                <Col span={1}></Col>
              </Row>
              <Divider style={{ margin: 0 }} />
              {validItems.map((item) => (
                <Row
                  key={item.id}
                  align="middle"
                  style={{
                    padding: "15px 0",
                    borderBottom: "1px solid #e8e8e8",

                    backgroundColor:
                      item.bookStatus === 0 || item.bookQuantity === 0
                        ? "#f8d7da"
                        : "transparent",
                  }}
                >
                  <Col span={1}>
                    <Checkbox
                      checked={item.selected}
                      onChange={() => handleSelectItem(item.id)}
                      disabled={
                        item.bookStatus === 0 ||
                        item.bookQuantity === 0 ||
                        item.quantity > item.bookQuantity
                      } // Không cho chọn nếu hết hàng
                    />
                  </Col>
                  <Col
                    span={6}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <img
                      src={normalizeImageUrl(item.image)}
                      alt={item.name}
                      style={{
                        width: "40px",
                        height: "50px",
                        marginRight: "10px",

                        opacity:
                          item.bookStatus === 0 || item.bookQuantity === 0
                            ? 0.5
                            : 1, // Làm mờ nếu không khả dụng hoặc hết hàng
                      }}
                    />
                    <Text
                      delete={item.bookStatus === 0 || item.bookQuantity === 0}
                    >
                      {item.name}
                    </Text>
                  </Col>
                  <Col span={4}>
                    <InputNumber
                      min={0}
                      max={item.bookQuantity}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(value, item.id)}
                      style={{ width: "80px" }}
                      disabled={
                        item.bookStatus === 0 || item.bookQuantity === 0
                      }
                    />
                  </Col>
                  <Col span={4}>
                    <Text>{item.price.toLocaleString()} VND</Text>
                  </Col>
                  <Col span={4}>
                    <Text>{item.total.toLocaleString()} VND</Text>
                  </Col>
                  <Col span={1}>
                    <Button
                      type="text"
                      icon={
                        <DeleteOutlined
                          style={{ color: "red", fontSize: "18px" }}
                        />
                      }
                      onClick={() => handleDeleteItem(item.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </Col>

                  {item.bookQuantity === 0 && (
                    <Col span={24}>
                      <Text type="danger">This product is out of stock.</Text>
                    </Col>
                  )}
                  {item.bookStatus === 0 && (
                    <Col span={24}>
                      <Text type="danger">
                        This product is unavailable or has been removed.
                      </Text>
                    </Col>
                  )}
                  {item.quantity > item.bookQuantity && (
                    <Col span={24}>
                      <Text type="danger">
                        Quantity in cart exceeds available stock (
                        {item.bookQuantity} left).
                      </Text>
                    </Col>
                  )}
                </Row>
              ))}

              <Divider />
              <Row justify="end" style={{ marginTop: "20px" }}>
                <Col>
                  <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
                    Total amount: {calculateTotal().toLocaleString()} VND
                  </Text>
                  <Button
                    type="primary"
                    style={{ marginLeft: "20px" }}
                    onClick={async () => {
                      const selectedBooks = cartItems
                        .filter((item) => item.selected) // Lọc sách được chọn
                        .map((item) => ({
                          bookID: item.bookID,
                          bookTitle: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          total: item.total,
                          image: item.image,
                          cartID: item.id, // Lưu lại cartID để xóa sau
                        }));

                      if (selectedBooks.length === 0) {
                        alert("Please select at least one book to purchase.");
                        return;
                      }

                      try {
                        // Xóa các mục đã chọn trong giỏ hàng
                        for (const item of selectedBooks) {
                          // Gọi API xóa theo cartID
                        }

                        // Chuyển hướng sang trang OrderPage với dữ liệu sách đã chọn
                        navigate("/OrderPage", {
                          state: { bookData: selectedBooks },
                        });
                      } catch (error) {
                        console.error("Error during purchase:", error);
                        message.error(
                          "An error occurred during the purchase process."
                        );
                      }
                    }}
                  >
                    Purchase
                  </Button>
                </Col>
              </Row>
              {/* Hiển thị các mặt hàng không hợp lệ */}
              {invalidItems.length > 0 && (
                <Card
                  title="Unavailable Items"
                  style={{
                    marginTop: "20px",
                    border: "1px solid #f0f0f0",
                    backgroundColor: "#fffbe6", // Nền vàng nhạt để phân biệt
                  }}
                >
                  <Row
                    align="middle"
                    style={{
                      backgroundColor: "#ff7875",
                      padding: "10px",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    <Col span={6}>
                      <Text style={{ color: "#fff" }}>Product</Text>
                    </Col>
                    <Col span={4}>
                      <Text style={{ color: "#fff" }}>Status</Text>
                    </Col>
                    <Col span={4}>
                      <Text style={{ color: "#fff" }}>Price</Text>
                    </Col>
                    <Col span={4}>
                      <Text style={{ color: "#fff" }}>Total</Text>
                    </Col>
                    <Col span={1}></Col>
                  </Row>
                  <Divider style={{ margin: 0 }} />
                  {invalidItems.map((item) => (
                    <Row
                      key={item.id}
                      align="middle"
                      style={{
                        padding: "15px 0",
                        borderBottom: "1px solid #e8e8e8",
                        backgroundColor: "#fff5f5", // Màu nền khác để phân biệt
                      }}
                    >
                      <Col
                        span={6}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            marginRight: "10px",
                            opacity: 0.5, // Làm mờ hình ảnh
                          }}
                        />
                        <Text delete style={{ fontWeight: "bold" }}>
                          {item.name}
                        </Text>
                      </Col>
                      <Col span={4}>
                        <Text disabled>Unavailable</Text>
                      </Col>
                      <Col span={4}>
                        <Text>{item.price.toLocaleString()} VND</Text>
                      </Col>
                      <Col span={4}>
                        <Text>{item.total.toLocaleString()} VND</Text>
                      </Col>
                      <Col span={1}>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteItem(item.id)} // Nút xóa vẫn hoạt động
                          style={{
                            color: "#ff4d4f", // Đánh dấu nút xóa màu đỏ
                          }}
                        />
                      </Col>
                      <Col span={24}>
                        <Text type="danger">
                          {item.bookStatus === 0
                            ? "This product is unavailable or has been removed."
                            : "This product is out of stock."}
                        </Text>
                      </Col>
                    </Row>
                  ))}
                </Card>
              )}
            </>
          )}
        </Card>
      </Content>
      <Footer
        style={{
          textAlign: "center",
          color: "#fff",
          backgroundColor: "#343a40",
          padding: "10px 0",
          bottom: 0,
          position: "sticky",
          width: "100%",
        }}
      >
        <div>© {new Date().getFullYear()} Capybook Management System</div>
        <div>All Rights Reserved</div>
      </Footer>
    </Layout>
  );
};

export default CartDetails;
