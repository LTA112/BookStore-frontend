import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookManagement.css"; // Import CSS for styling
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { fetchBooks, updateBook, fetchBookById, searchBook } from "../config"; // Thêm searchBook
import { Space, Table, Tag, Button, Input, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
<<<<<<< HEAD
import Footer from "../FooterForDashboard/Footer.jsx";
=======
>>>>>>> c4db0e6 (Commit frontend)
const { Search } = Input;

function BookManagement() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!checkWarehouseStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    const loadBooks = async () => {
      setLoading(true);
      try {
        const response = await fetchBooks();
        console.log("Fetched books:", response.data); // Log danh sách sách nhận được
        setBooks(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to fetch books");
        message.error("Failed to fetch books");
      }
      setLoading(false);
    };

    loadBooks();
  }, []);

  const handleSearch = async (value) => {
    setIsSearching(true);
    setLoading(true);
    try {
      const response = await searchBook(value); // Gọi API searchBook
      console.log("Search results:", response.data);
      setBooks(response.data); // Cập nhật danh sách sách với kết quả tìm kiếm
      setError("");
    } catch (error) {
      console.error("Error searching books:", error);
      setError("Failed to search books");
      message.error("Failed to search books");
    }
    setLoading(false);
    setIsSearching(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this book?")) {
      try {
        const currentBookData = await fetchBookById(id);

        const updatedBookData = {
          ...currentBookData.data,
          bookStatus: 0, // Chỉ thay đổi trạng thái
          bookCategories: [], // Đảm bảo không gửi các danh sách liên kết
        };

        const formDataToSend = new FormData();
        formDataToSend.append("book", JSON.stringify(updatedBookData));

        // Không thêm `image` vào formData
        await updateBook(id, formDataToSend);
        setBooks(
          books.map((book) =>
            book.bookID === id ? { ...book, bookStatus: 0 } : book
          )
        );
        message.success("Book deactivated successfully");
      } catch (error) {
        console.error("Error deactivating book:", error);
        message.error("Failed to deactivate book");
      }
    }
  };

  const goToAddBook = () => {
    navigate("/dashboard/books/add");
  };

  const goToEditBook = (bookId) => {
    navigate(`/dashboard/books/edit/${bookId}`);
  };

  const goToBookDetail = (bookId) => {
    navigate(`/dashboard/books/detail/${bookId}`);
  };

  const columns = [
    {
      title: "Book ID",
      dataIndex: "bookID",
      key: "bookID",
    },
    {
      title: "Title",
      dataIndex: "bookTitle",
      key: "bookTitle",
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Translator",
      dataIndex: "translator",
      key: "translator",
    },
    {
      title: "Quantity",
      dataIndex: "bookQuantity",
      key: "bookQuantity",
      render: (quantity) =>
        `${new Intl.NumberFormat("en-US").format(quantity)}`,
    },
    {
      title: "Price",
      dataIndex: "bookPrice",
      key: "bookPrice",
      render: (price) => `${new Intl.NumberFormat("en-US").format(price)} VND`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => goToBookDetail(record.bookID)}>
            <InfoCircleOutlined title="Detail" />
          </Button>
          {record.bookStatus === 1 && (
            <>
              <Button
                type="link"
                onClick={() => goToEditBook(record.bookID)}
                className="yellow-button"
              >
                <EditOutlined title="Edit" />
              </Button>

              <Button
                type="link"
                danger
                onClick={() => handleDelete(record.bookID)}
              >
                <DeleteOutlined title="Delete" />
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading) return <p>Loading books...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div className="dashboard-content">
        <h1 className="titlemanagement">Book Management</h1>
        <div className="action-container">
          <Button type="primary" onClick={goToAddBook}>
            Add book
          </Button>
          <Search
            placeholder="Search by title or author"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => handleSearch(value)} // Gọi API search khi nhấn Enter
            style={{ width: 300, marginLeft: "20px" }}
            loading={isSearching} // Hiển thị trạng thái loading khi tìm kiếm
          />
        </div>
        <Table
          columns={columns}
          dataSource={books.filter((book) => book.bookStatus === 1)} // Dữ liệu từ API search hoặc tất cả sách
          rowKey={(record) => record.bookID}
        />
      </div>
<<<<<<< HEAD
      <Footer></Footer>
=======
      <div className="copyright">
        <div>© Copyright {new Date().getFullYear()}</div>
        <div>Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </div>
>>>>>>> c4db0e6 (Commit frontend)
    </div>
  );
}

export default BookManagement;
