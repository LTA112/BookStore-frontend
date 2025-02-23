import {
  Layout,
  Descriptions,
  Button,
  Image,
  Menu,
  Dropdown,
  Input,
  Tag,
} from "antd"; // Added Tag here
import {
  fetchBookById,
  logout,
  fetchOrders,
  fetchOrderDetail,
  fetchOrdersHomepage,
  fetchOrderDetail_homepage,
} from "../config";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import AddBookToCart from "./AddBookToCart";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  checkAdminRole,
  checkCustomerRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig";

const { Header, Content, Footer } = Layout;
const { Search } = Input; // Correct Search import

const BookDetails = () => {
  const { bookId } = useParams(); // Get bookId from URL
  const navigate = useNavigate(); // Navigation handler
  let username;
  if (localStorage.getItem("jwtToken") !== null) {
    username = decodeJWT()?.sub;
  }

  const [bookData, setBookData] = useState({
    bookTitle: "",
    publicationYear: "",
    author: "",
    dimension: "",
    translator: "",
    hardcover: "",
    publisher: "",
    weight: "",
    bookDescription: "",
    image: null,
    bookPrice: "", // Chỉ lấy giá gốc
    isbn: "",
    quantity: 0,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [soldCount, setSoldCount] = useState(0); // Di chuyển dòng này vào đây

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookResponse = await fetchBookById(bookId);

        if (bookResponse === undefined) {
          navigate("/404");
        }

        if (bookResponse?.data) {
          const book = bookResponse.data;
          setBookData(book); // Cập nhật trực tiếp bookData từ API
          const imageFromDB = book.image;

          if (imageFromDB && imageFromDB.startsWith(`/uploads/book_`)) {
            setImagePreview(`http://localhost:6789${imageFromDB}`);
          } else {
            setImagePreview(imageFromDB);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchSoldCount = async () => {
      try {
        // Fetch danh sách đơn hàng
        const ordersResponse = await fetchOrders();
        const orders = ordersResponse.data || [];

        let count = 0;
        // Lọc và đếm các đơn hàng có chứa sách với bookId
        for (const order of orders) {
          const orderDetailsResponse = await fetchOrderDetail_homepage(
            order.orderID
          );
          const orderDetails = orderDetailsResponse?.data?.orderDetails || [];
          const containsBook = orderDetails.some(
            (detail) => detail.bookID === parseInt(bookId, 10)
          );

          if (containsBook) {
            count += 1;
          }
        }

        setSoldCount(count); // Cập nhật số đơn hàng chứa sách này
      } catch (error) {
        console.error("Error fetching sold count:", error);
      }
    };

    fetchData();
    fetchSoldCount();
  }, [bookId]);

  const handleNotificationClick = () => {
    navigate("/notifications");
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleCartClick = () => {
    navigate("/cart/ViewDetail");
  };
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };
  const userMenu = () => {
    if (localStorage.getItem("jwtToken")) {
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
    <Layout
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0fa4d6",
          padding: "0 20px",
          height: "64px",
          color: "#fff",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/")} // Navigate to homepage when clicked
        >
          <img
            src="/public/logo-book.png"
            alt="BookStore Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Capybook</div>
        </div>

        <Search
          placeholder="Search for books or orders"
          enterButton
          style={{ maxWidth: "500px" }}
        />

        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="text"
            icon={
              <BellOutlined
                style={{ fontSize: "24px", marginRight: "20px", color: "#fff" }}
              />
            }
            style={{ color: "#fff" }}
            onClick={handleNotificationClick}
          ></Button>
          <ShoppingCartOutlined
            style={{ fontSize: "24px", marginRight: "20px", color: "#fff" }}
            onClick={handleCartClick}
          />
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

      <Content
        style={{
          padding: "20px",
          backgroundColor: "#f0f2f5",
          flex: "1 0 auto",
        }}
      >
        <div
          style={{
            padding: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Left section: Image gallery */}
            <div style={{ flex: "1" }}>
              <Image
                width={300}
                src={
                  imagePreview ||
                  "public/images/z6342581065000_fd22f0bb2accb943186ca745048279cb.jpg"
                }
                alt={bookData.bookTitle}
                style={{ borderRadius: "8px" }}
              />
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <Image
                  width={60}
                  src={
                    imagePreview ||
                    "public/images/z6342581065000_fd22f0bb2accb943186ca745048279cb.jpg"
                  }
                  style={{ cursor: "pointer" }}
                />
              </div>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-start",
                  }}
                >
                  <AddBookToCart
                    username={username}
                    bookId={bookId}
                    bookData={bookData}
                  />
                </div>
              </div>
            </div>

            {/* Right section: Book details inside a box */}
            <div
              style={{
                flex: "1",
                padding: "20px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {bookData.bookTitle}
                </h1>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#FF4500",
                    marginBottom: "10px",
                  }}
                >
                  {`${bookData.bookPrice.toLocaleString("vi-VN")}`} VND
                  {bookData.discount > 0 && (
                    <>
                      {" "}
                      <span
                        style={{
                          textDecoration: "line-through",
                          fontSize: "16px",
                          color: "#999",
                        }}
                      >
                        {`${bookData.originalPrice.toLocaleString(
                          "vi-VN"
                        )} VND`}
                      </span>
                      <Tag color="volcano" style={{ marginLeft: "10px" }}>
                        {`${bookData.discount}% off`}
                      </Tag>
                    </>
                  )}
                </div>
                <Descriptions.Item label="Sold">
                  Sold: {soldCount}
                </Descriptions.Item>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  Shipping Information
                </h3>
                <div>Shipping to: Ho Chi Minh City</div>
                <div>Estimated delivery: Oct 26</div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  Stock
                </h3>
                <div style={{ fontSize: "16px", color: "#333" }}>
                  Available Stock:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {bookData.bookQuantity}
                  </span>
                </div>
              </div>
              <div>
                <h4>Description</h4>
                <Descriptions.Item label="Description" span={2}>
                  {bookData.bookDescription}
                </Descriptions.Item>
              </div>
            </div>
          </div>

          {/* Additional Book Info */}
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid #e8e8e8",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Product Details
            </h2>
            <Descriptions
              bordered
              column={2}
              labelStyle={{ fontWeight: "bold" }}
              contentStyle={{ textAlign: "left" }}
            >
              <Descriptions.Item label="Author">
                {bookData.author}
              </Descriptions.Item>
              <Descriptions.Item label="Publication Year">
                {bookData.publicationYear}
              </Descriptions.Item>
              <Descriptions.Item label="Dimensions">
                {bookData.dimension}
              </Descriptions.Item>
              <Descriptions.Item label="Publisher">
                {bookData.publisher}
              </Descriptions.Item>
              <Descriptions.Item label="ISBN">
                {bookData.isbn}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {bookData.weight} g
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
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

export default BookDetails;
