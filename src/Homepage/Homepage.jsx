import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Menu,
  Card,
  Input,
  Row,
  Col,
  Tag,
  Typography,
  Dropdown,
  Button,
  Select,
  Divider,
  TreeSelect,
  Modal,
  message,
  notification,
  Space,
  Table,
  Badge,
} from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  LeftOutlined,
  RightOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  RiseOutlined,
  FallOutlined,
  FilterFilled,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import {
  fetchBooks,
  fetchAccountDetail,
  fetchCategories,
  logout,
  sortBooks,
  fetchNotifications,
  fetchBooksByCategory,
  searchBook,
  viewCart,
  fetchPromotions,
} from "../config"; // Fetch books and categories from API
import { decodeJWT } from "../jwtConfig";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const { Header, Footer, Content } = Layout;
const { Search } = Input;
const { Title } = Typography;
const { Option } = Select;

const Homepage = () => {
  const [books, setBooks] = useState([]); // State for books
  const [categories, setCategories] = useState([]); // State for categories
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
  const [sortOrder, setSortOrder] = useState("default"); // State for sorting
  const [currentPage, setCurrentPage] = useState({}); // Track the current page for each category
  const [isTransitioning, setIsTransitioning] = useState(false); // Track animation state
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const [modalBooks, setModalBooks] = useState([]); // Books to display in the modal
  const [modalCategory, setModalCategory] = useState(null); // The selected category for the modal
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate for routing
  const [applicablePromotions, setApplicablePromotions] = useState([]);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);

  // Fetch books and categories when the component mounts
  useEffect(() => {
    fetchBooks()
      .then((response) => {
        console.log(response);
        setBooks(response.data.filter((book) => book.bookStatus === 1));
      })
      .catch((error) => {
        console.error("Failed to fetch books:", error);
      });

    fetchCategories()
      .then((response) => {
        setCategories(
          response.data.filter((category) => category.catStatus != 0)
        );
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, []);
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

    return roots;
  };
  useEffect(() => {
    const fetchApplicablePromotions = async () => {
      try {
        const response = await fetchPromotions();
        const today = new Date();

        const applicable = response.data.filter(
          (promo) =>
            new Date(promo.startDate) <= today &&
            new Date(promo.endDate) >= today &&
            promo.quantity > 0 &&
            promo.proStatus === 1
        );

        setApplicablePromotions(applicable); // Lưu khuyến mãi hợp lệ vào state
      } catch (error) {
        console.error("Error fetching promotions:", error);
        Modal.error({
          title: "Error",
          content: "Failed to fetch promotions. Please try again later.",
        });
      }
    };

    fetchApplicablePromotions(); // Gọi hàm fetch promotions
  }, []); // Chỉ gọi một lần khi component mount

  const handleFetchPromotions = async () => {
    try {
      const response = await fetchPromotions();
      const today = new Date();

      const applicable = response.data.filter(
        (promo) =>
          new Date(promo.startDate) <= today &&
          new Date(promo.endDate) >= today &&
          promo.quantity > 0 &&
          promo.proStatus === 1
      );

      setApplicablePromotions(applicable);
      setIsPromotionModalVisible(true);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      Modal.error({
        title: "Error",
        content: "Failed to fetch promotions. Please try again later.",
      });
    }
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

  // Handle sorting
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

  // Paginate books for each category (6 books per page)
  const paginateBooks = (books, pageSize) => {
    const pages = [];
    for (let i = 0; i < books.length; i += pageSize) {
      pages.push(books.slice(i, i + pageSize));
    }
    return pages;
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

  // Sort books based on selected criteria
  const sortedBooks = books.length > 0 ? [...books] : [...books];

  const handleNotificationClick = () => {
    navigate("/notifications");
  };
  const handleCartClick = () => {
    navigate("/cart/ViewDetail");
  };
  const handleDashboardClick = () => {
    navigate("/dashboard/income-statistic");
  };

  const handleBookClick = (bookId) => {
    navigate(`/detail/${bookId}`); // Adjust this route based on your router configuration
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const showModal = (category, books) => {
    console.log("Opening modal with:", category, books); // Log modal state
    if (!books || books.length === 0) {
      console.error("No books to show in modal");
      return;
    }
    setModalCategory(category);
    setModalBooks(books);
    setIsModalVisible(true); // This should trigger modal to show
  };

  const closeModal = () => {
    setIsModalVisible(false); // Close modal
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

  // Group books by category and paginate them
  const booksByCategory = categories
    ?.map((category) => {
      const booksInCategory = sortedBooks.filter((book) =>
        book.bookCategories?.some(
          (bookCategory) => bookCategory.catId?.catID === category.catID
        )
      );
      if (booksInCategory.length === 0) {
        return null; // Loại bỏ danh mục nếu không có sách
      }
      const pages = paginateBooks(booksInCategory, 6); // 6 books per page
      return { category, pages };
    })
    .filter((item) => item !== null); // Loại bỏ các giá trị null

  // Initialize current page for each category
  useEffect(() => {
    const initialPages = {};
    booksByCategory?.forEach(({ category }) => {
      initialPages[category.catID] = 0;
    });
    setCurrentPage(initialPages);
  }, [booksByCategory]);

  const normalizeImageUrl = (imageUrl) => {
    if (imageUrl && imageUrl.startsWith("/uploads/book_")) {
      return `http://localhost:6789${imageUrl}`; // Add base URL if needed
    }
    return imageUrl || "/logo-bookstore2.jpg"; // Default image
  };

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#91c090",
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
            src="/logo-bookstore2.jpg"
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
          />
          <Button
            type="text"
            style={{ marginRight: "10px", color: "#fff" }}
            onClick={handleFetchPromotions}
          >
            <Badge
              count={applicablePromotions.length} // Số lượng khuyến mãi
              overflowCount={99} // Giới hạn số hiển thị
              style={{ backgroundColor: "#f5222d" }} // Màu sắc của badge
            >
              <FallOutlined style={{ fontSize: "24px", color: "#fff" }} />
            </Badge>
          </Button>

          <Modal
            title="Applicable Promotions"
            visible={isPromotionModalVisible}
            onCancel={() => setIsPromotionModalVisible(false)}
            footer={[
              <Button
                key="close"
                onClick={() => setIsPromotionModalVisible(false)}
              >
                Close
              </Button>,
            ]}
            width={800}
          >
            <Table
              dataSource={applicablePromotions}
              rowKey={(record) => record.proCode}
              columns={[
                {
                  title: "Promotion Name",
                  dataIndex: "proName",
                  key: "proName",
                },
                {
                  title: "Code",
                  dataIndex: "proCode",
                  key: "proCode",
                },
                {
                  title: "Discount (%)",
                  dataIndex: "discount",
                  key: "discount",
                },
                {
                  title: "Start Date",
                  dataIndex: "startDate",
                  key: "startDate",
                },
                {
                  title: "End Date",
                  dataIndex: "endDate",
                  key: "endDate",
                },
              ]}
            />
          </Modal>

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
          minHeight: "600px",
          padding: "20px",
          backgroundColor: "#b8c0c2",
        }}
      >
        <Card>
          <Col>
            <Row gutter={[8, 8]}>
              <Col span={5}>
                Sort by: &nbsp;
                <Select
                  onChange={handleSortChange}
                  style={{ width: 200, border: "#080203" }}
                  defaultValue="default"
                >
                  <Option value="default">Default</Option>
                  <Option value="priceAsc">
                    <RiseOutlined /> Price (Low to High)
                  </Option>
                  <Option value="priceDesc">
                    <FallOutlined /> Price (High to Low)
                  </Option>
                  <Option value="titleAsc">
                    <SortAscendingOutlined /> Title (A-Z)
                  </Option>
                  <Option value="titleDesc">
                    <SortDescendingOutlined /> Title (Z-A)
                  </Option>
                </Select>
              </Col>
              <Space style={{ margin: "10px" }}></Space>
              <Col span={8}>
                <FilterOutlined /> Filter: &nbsp;
                <TreeSelect
                  placeholder="Filter by Category"
                  onChange={(value) => filteredBooks(value)} // Gán `catID` vào `selectedCategory`
                  defaultValue={0}
                  treeData={buildTreeData(categories)}
                  style={{ width: 200, border: "#080203" }}
                />
              </Col>
              <Col span={10}>
                <SearchOutlined
                  style={{ fontSize: "19px", marginTop: "5px" }}
                />
                &nbsp;&nbsp;&nbsp;
                <Search
                  placeholder="Search books with title or author"
                  enterButton
                  style={{ maxWidth: "500px" }}
                  onSearch={(value) => handleSearch(value)} // Gọi hàm tìm kiếm khi nhấn Enter
                />
              </Col>
            </Row>
          </Col>
        </Card>
        <br></br>
        <Carousel className="c">
          <Carousel.Item interval={3000}>
            <img
              className="d-block w-100"
              src="/images-slides/slide1.jpg"
              alt="First slide"
            />
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <img
              className="d-block w-100"
              src="/images-slides/slide2.jpg"
              alt="Second slide"
            />
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <img
              className="d-block w-100"
              src="/images-slides/slide3.png"
              alt="Third slide"
            />
          </Carousel.Item>
        </Carousel>

        {selectedCategory ? (
          <Card>
            <Row gutter={[16, 16]}>
              {sortedBooks.map((book) => (
                <Col key={book.bookID} xs={24} sm={12} md={8} lg={4} xl={4}>
                  <Card
                    hoverable
                    className="book-card"
                    onClick={() => handleBookClick(book.bookID)}
                    cover={
                      <div className="image-container">
                        <img
                          alt={book.bookTitle}
                          src={normalizeImageUrl(book.image)}
                          className="book-image"
                          style={{ height: "200px", objectFit: "contain" }}
                        />
                      </div>
                    }
                  >
                    <Title level={4} className="book-title">
                      {book.bookTitle}
                    </Title>
                    <Title level={5} type="secondary" className="book-price">
                      Author: {book.author}
                    </Title>
                    <Title level={5} type="danger" className="book-price">
                      {`${book.bookPrice.toLocaleString("vi-VN")} đ`}{" "}
                    </Title>
                    {book.discount && (
                      <Tag
                        color="volcano"
                        className="book-discount"
                      >{`${book.discount}% off`}</Tag>
                    )}
                    <Title level={5} type="danger">
                      Quantity: {book.bookQuantity}
                    </Title>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ) : (
          <>
            <br></br>
            <Card>
              <Divider
                orientation="center"
                style={{
                  fontSize: "24px",
                  color: "#080203",
                  borderColor: "#c72a4c",
                  marginBottom: "20px",
                }}
              >
                All Books
              </Divider>
              <Row gutter={[16, 16]}>
                {sortedBooks.map((book, index) => (
                  <Col
                    key={book.bookID || index}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={4}
                    xl={4}
                  >
                    <Card
                      hoverable
                      onClick={() => handleBookClick(book.bookID)}
                      className="book-card"
                      cover={
                        <div className="image-container">
                          <img
                            alt={book.bookTitle}
                            src={normalizeImageUrl(book.image)}
                            className="book-image"
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      }
                    >
                      <Title level={4} className="book-title">
                        {book.bookTitle}
                      </Title>
                      <Title level={5} type="secondary" className="book-price">
                        Author: {book.author}
                      </Title>
                      <Title level={5} type="danger" className="book-price">
                        {`${book.bookPrice.toLocaleString("vi-VN")} đ`}{" "}
                      </Title>
                      {book.discount && (
                        <Tag
                          color="volcano"
                          className="book-discount"
                        >{`${book.discount}% off`}</Tag>
                      )}
                      <Title level={5} type="danger">
                        Quantity: {book.bookQuantity}
                      </Title>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </>
        )}
      </Content>
      <Modal
        title={modalCategory?.catName || "Books"}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={900}
      >
        {/* Render các sách từ modalBooks */}
        <Row gutter={[16, 16]}>
          {modalBooks.map((book) => (
            <Col key={book.bookID} xs={24} sm={12} md={8} lg={6} xl={6}>
              <Card
                hoverable
                onClick={() => handleBookClick(book.bookID)}
                cover={
                  <img
                    alt={book.bookTitle}
                    src={normalizeImageUrl(book.image)}
                    style={{ height: "200px", objectFit: "contain" }}
                  />
                }
              >
                <Title level={5}>{book.bookTitle}</Title>
                <Title
                  level={4}
                  type="danger"
                >{`${book.bookPrice.toLocaleString("vi-VN")} đ`}</Title>
                {book.discount && (
                  <Tag color="volcano">{`${book.discount}% off`}</Tag>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

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

export default Homepage;
