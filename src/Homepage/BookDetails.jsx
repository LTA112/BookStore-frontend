import {
  Layout,
  Descriptions,
  Button,
  Image,
  Menu,
  Dropdown,
  Input,
  Tag,
  Card,
  Col,
  Row,
  Select,
  Space,
  TreeSelect,
  message,
} from "antd"; // Added Tag here
import {
  fetchBookById,
  logout,
  fetchOrders,
  fetchOrderDetail,
  fetchOrdersHomepage,
  fetchOrderDetail_homepage,
  sortBooks,
  fetchBooksByCategory,
  fetchBooks,
  searchBook,
} from "../config";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  FilterOutlined,
  SearchOutlined,
  RiseOutlined,
  FallOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
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
import { Option } from "antd/es/mentions";

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
  const [books, setBooks] = useState([]); // State for books
  const [sortOrder, setSortOrder] = useState("default"); // State for sorting
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [categories, setCategories] = useState([]); // State for categories
  const [loading, setLoading] = useState(false);

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

  const handleSortChange = async (value) => {
    try {
      setSortOrder(value);
      const [sortBy, sortOrder = "asc"] = value.split(/(?=[A-Z])/); // Phân tách `value` thành `sortBy` và `sortOrder`
      const response = await sortBooks(
        sortBy.toLowerCase(),
        sortOrder.toLowerCase()
      ); // Gọi API với đúng tham số
      let bookData = response.data.filter((book) => book.bookStatus === 1);
      if (selectedCategory != 0 && selectedCategory != null) {
        bookData = bookData.filter((book) =>
          book.bookCategories?.some(
            (bookCategory) => bookCategory.catId?.catID === selectedCategory
          )
        );
      }
      if (searchTerm.trim()) {
        bookData =
          bookData.filter((book) =>
            book?.bookTitle?.toLowerCase().includes(searchTerm)
          ) ||
          books.filter((book) =>
            book?.author?.toLowerCase().includes(searchTerm)
          );
      }
      setBooks(bookData);
    } catch (error) {
      console.error("Failed to sort books:", error);
      message.error("Failed to sort books. Please try again."); // Hiển thị thông báo lỗi
    }
  };

  // Filter books based on the search term, category, and only include those with bookStatus = 1
  const filteredBooks = async (categoryID) => {
    let bookData;
    if (categoryID != 0) {
      try {
        const response = await fetchBooksByCategory(categoryID);
        console.log(response);
        bookData = response.data.filter((book) => book.bookStatus === 1); // Chỉ lấy sách có trạng thái hợp lệ
        setSelectedCategory(categoryID);
      } catch {
        const response = await fetchBooks();
        bookData = response.data.filter((book) => book.bookStatus === 1); // Chỉ lấy sách có trạng thái hợp lệ
        setSelectedCategory(0);
        message.error("There isn's any book in this category!");
      }
    } else {
      const response = await fetchBooks();
      bookData = response.data.filter((book) => book.bookStatus === 1); // Chỉ lấy sách có trạng thái hợp lệ
      setSelectedCategory(categoryID);
    }
    if (searchTerm.trim()) {
      bookData =
        bookData.filter((book) =>
          book?.bookTitle?.toLowerCase().includes(searchTerm)
        ) ||
        books.filter((book) =>
          book?.author?.toLowerCase().includes(searchTerm)
        );
    }
    if (sortOrder !== "default") {
      switch (sortOrder) {
        case "priceAsc":
          bookData.sort((a, b) => a.bookPrice - b.bookPrice);
          break;
        case "priceDesc":
          bookData.sort((a, b) => b.bookPrice - a.bookPrice);
          break;
        case "titleAsc":
          bookData.sort((a, b) => {
            const nameA = a.bookTitle.toUpperCase();
            const nameB = b.bookTitle.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
          break;
        case "titleDesc":
          bookData.sort((a, b) => {
            const nameA = a.bookTitle.toUpperCase();
            const nameB = b.bookTitle.toUpperCase();
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          });
          break;
      }
    }
    setBooks(bookData);
  };

  // Hàm xây dựng cấu trúc treeData cho TreeSelect
  const buildTreeData = (categories) => {
    const map = {};
    const roots = [];
    roots.push(
      (map[0] = {
        title: "All",
        value: 0,
        key: 0,
      })
    );
    categories.forEach((category) => {
      map[category.catID] = {
        title: category.catName,
        value: category.catID,
        key: category.catID,
      };
      roots.push(map[category.catID]);
    });
  };

  // Handle search input
  const handleSearch = async (value) => {
    setLoading(true); // Kích hoạt trạng thái tải
    console.log(value);
    setSearchTerm(value.toLowerCase());
    let bookData;
    try {
      if (!value.trim()) {
        // Nếu searchTerm trống, hiển thị toàn bộ sách
        const response = await fetchBooks(); // Gọi API để lấy tất cả sách
        bookData = response.data.filter((book) => book.bookStatus === 1); // Lọc sách hợp lệ
        message.info("Displaying all books."); // Hiển thị thông báo
      } else {
        // Nếu có từ khóa, thực hiện tìm kiếm
        const response = await searchBook(value); // Gọi API tìm kiếm
        bookData = response.data.filter((book) => book.bookStatus === 1);
        message.success("Search completed."); // Hiển thị thông báo
      }
      if (selectedCategory != 0 && selectedCategory != null) {
        bookData = bookData.filter((book) =>
          book.bookCategories?.some(
            (bookCategory) => bookCategory.catId?.catID === selectedCategory
          )
        );
      }
      if (sortOrder !== "default") {
        switch (sortOrder) {
          case "priceAsc":
            bookData.sort((a, b) => a.bookPrice - b.bookPrice);
            break;
          case "priceDesc":
            bookData.sort((a, b) => b.bookPrice - a.bookPrice);
            break;
          case "titleAsc":
            bookData.sort((a, b) => {
              const nameA = a.bookTitle.toUpperCase();
              const nameB = b.bookTitle.toUpperCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
            break;
          case "titleDesc":
            bookData.sort((a, b) => {
              const nameA = a.bookTitle.toUpperCase();
              const nameB = b.bookTitle.toUpperCase();
              if (nameA < nameB) {
                return 1;
              }
              if (nameA > nameB) {
                return -1;
              }
              return 0;
            });
            break;
        }
      }
      setBooks(bookData);
    } catch (error) {
      console.error("Error searching books:", error);
      message.error("Failed to load books.");
    } finally {
      setLoading(false); // Tắt trạng thái tải
    }
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
          backgroundColor: "#8ebe8b",
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
            src="/logo-bookstore2.png"
            alt="Bookstore Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Bookstore</div>
        </div>

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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Image
                width={400}
                height={500}
                src={imagePreview || "logo-bookstore.jpg"}
                alt={bookData.bookTitle}
                style={{ borderRadius: "8px" }}
              />
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
                <div>Shipping to: Can tho city</div>
                <div>Estimated delivery: 2 or more days</div>
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
        <div>© {new Date().getFullYear()} Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </Footer>
    </Layout>
  );
};

export default BookDetails;
