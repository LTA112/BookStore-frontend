import React, { useEffect, useState } from "react";
import { Spin, message, Table, Modal, Button } from "antd";
import { LineChart } from "@mui/x-charts/LineChart";

import {
  fetchImportStockDetailsByStockId,
  fetchImportStocks,
  fetchOrderDetail,
  fetchOrders,
  fetchBookDetail,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer";
import moment from "moment";
import {
  checkAdminRole,
  checkWarehouseStaffRole,
  checkSellerStaffRole,
} from "../jwtConfig";
<<<<<<< HEAD
import Footer from "../FooterForDashboard/Footer";
import { Container } from "react-bootstrap";
=======



>>>>>>> c4db0e6 (Commit frontend)

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [booksData, setBooksData] = useState([]);
  const [importedBooksData, setImportedBooksData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị Modal
  const [selectedBook, setSelectedBook] = useState(null); // Dữ liệu sách được chọn
  const [selectedQuantity, setSelectedQuantity] = useState(null); // Số lượng sách nhập

  const showModal = (record) => {
    const book = {
      bookID: record.bookID || "N/A",
      bookTitle: record.bookTitle || "N/A",
      author: record.author || "N/A",
      translator: record.translator || "N/A",
      publisher: record.publisher || "N/A",
      publicationYear: record.publicationYear || "N/A",
      isbn: record.isbn || "N/A",
      bookDescription: record.bookDescription || "N/A",
      bookPrice: record.bookPrice,
<<<<<<< HEAD
      image: record.image || "N/A",
=======
      image: record.image || "",
>>>>>>> c4db0e6 (Commit frontend)
    };
    console.log("Record: ", record);
    setSelectedBook(book);
    setSelectedQuantity(record.iSDQuantity || "N/A");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
    setSelectedQuantity(null);
  };

  useEffect(() => {
    if (
      !checkWarehouseStaffRole() &&
      !checkSellerStaffRole() &&
      !checkAdminRole()
    ) {
      return navigate("/404");
    }
    const loadData = async () => {
      try {
        setLoading(true);
        const [importResponse, ordersResponse] = await Promise.all([
          fetchImportStocks(),
          fetchOrders(),
        ]);
        console.log(ordersResponse);

        // Xử lý dữ liệu nhập kho
        const imports = await Promise.all(
          importResponse.data.map(async (item) => {
            const detailsResponse = await fetchImportStockDetailsByStockId(
              item.isid
            );
            console.log("Chi tiết Import Stock: ", detailsResponse);
            const totalPrice = detailsResponse.data.reduce(
              (sum, detail) =>
                sum +
                (detail.iSDQuantity || 0) *
<<<<<<< HEAD
                  (parseFloat(detail.importPrice) || 0),
=======
                (parseFloat(detail.importPrice) || 0),
>>>>>>> c4db0e6 (Commit frontend)
              0
            );
            return {
              date: item.importDate,
              type: "Import",
              value: totalPrice || 0,
            };
          })
        );

        // Xử lý dữ liệu xuất kho
        const exports = await Promise.all(
          ordersResponse.data.map(async (order) => {
            try {
              // Fetch chi tiết đơn hàng
              const detailsResponse = await fetchOrderDetail(order.orderID);
              if (!detailsResponse || !detailsResponse.data) {
                console.error(
                  `Chi tiết đơn hàng ID ${order.orderID} không có dữ liệu.`
                );
                return { date: order.orderDate, type: "Export", value: 0 };
              }

              console.log(
                `Chi tiết đơn hàng ID ${order.orderID}:`,
                detailsResponse.data
              );

              // Tính tổng giá trị sách trong đơn hàng
              const orderDetails = detailsResponse.data.orderDetails || [];
              const totalBooksPrice = orderDetails.reduce(
                (sum, detail) => sum + (detail.totalPrice || 0), // Sử dụng trực tiếp totalPrice
                0
              );

              console.log(
                `Tổng giá trị sách cho đơn hàng ID ${order.orderID}:`,
                totalBooksPrice
              );

              // Tính tổng giá trị đơn hàng (bao gồm giảm giá)
              const totalPrice = totalBooksPrice;

              console.log(
                `Tổng giá trị đơn hàng ID ${order.orderID}:`,
                totalPrice
              );

              return {
                date: order.orderDate,
                type: "Export",
                value: totalPrice || 0,
              };
            } catch (error) {
              console.error(
                `Lỗi khi xử lý đơn hàng ID ${order.orderID}:`,
                error
              );

              // Trả về giá trị mặc định nếu gặp lỗi
              return { date: order.orderDate, type: "Export", value: 0 };
            }
          })
        );

        // Gộp dữ liệu và tính Revenue
        const allData = [...imports, ...exports];
        const groupedData = {};

        allData.forEach((item) => {
          const dateKey = moment(item.date).format("YYYY-MM-DD");
          if (!groupedData[dateKey]) {
            groupedData[dateKey] = { date: dateKey, Import: 0, Export: 0 };
          }
          groupedData[dateKey][item.type] += item.value;
        });

        const formattedData = Object.values(groupedData).map((item) => ({
          ...item,
          Revenue: item.Export - item.Import,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Không thể tải dữ liệu báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const loadBooksData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách đơn hàng trong tháng hiện tại
        const ordersResponse = await fetchOrders();
        const filteredOrders = ordersResponse.data.filter((order) =>
          moment(order.orderDate).isBetween(
            moment().startOf("month"),
            moment().endOf("month"),
            "day",
            "[]"
          )
        );

        // Fetch chi tiết từng đơn hàng và tính số lượng sách
        const bookMap = {}; // Để lưu trữ tổng số lượng sách được bán theo bookID

        for (const order of filteredOrders) {
          const detailsResponse = await fetchOrderDetail(order.orderID);
          const orderDetails = detailsResponse.data.orderDetails || [];

          for (const detail of orderDetails) {
            const bookId = detail.bookID;
            const quantity = detail.quantity || 0;

            if (!bookMap[bookId]) {
              bookMap[bookId] = { bookId, quantity: 0 };
            }
            bookMap[bookId].quantity += quantity;
          }
        }

        // Fetch thông tin chi tiết từng sách
        const bookDetails = await Promise.all(
          Object.keys(bookMap).map(async (bookId) => {
            try {
              const response = await fetchBookDetail(bookId);
              const bookData = response.data;
              const imageFromDB = bookData.image;
              const imagePreview =
                imageFromDB && imageFromDB.startsWith(`/uploads/book_`)
                  ? `http://localhost:6789${imageFromDB}`
                  : imageFromDB;

              return {
                ...bookMap[bookId],
                title: bookData.bookTitle,
                author: bookData.author,
                publisher: bookData.publisher,
                price: bookData.bookPrice,
                image: imagePreview,
              };
            } catch (error) {
              console.error(`Lỗi khi fetch sách ID ${bookId}:`, error);
              return null;
            }
          })
        );

        // Lọc ra các sách hợp lệ
        setBooksData(bookDetails.filter((book) => book !== null));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sách:", error);
        message.error("Không thể tải dữ liệu sách đã bán");
      } finally {
        setLoading(false);
      }
    };

    loadBooksData();

    const loadImportedBooksData = async () => {
      try {
        const importResponse = await fetchImportStocks();
        const importedData = await Promise.all(
          importResponse.data.map(async (item) => {
            const detailsResponse = await fetchImportStockDetailsByStockId(
              item.isid
            );
            console.log("Chi tiết sách: ", detailsResponse.data);

            // Sử dụng trực tiếp dữ liệu từ detailsResponse.data
            return detailsResponse.data.map((detail) => ({
              isdid: detail.isdid, // ID nhập kho
              bookID: detail.bookID.bookID, // ID sách
              bookTitle: detail.bookID.bookTitle, // Tên sách
              author: detail.bookID.author || "N/A", // Tác giả
              translator: detail.bookID.translator || "N/A", // Dịch giả
              publisher: detail.bookID.publisher || "N/A", // Nhà xuất bản
              publicationYear: detail.bookID.publicationYear || "N/A", // Năm xuất bản
              isbn: detail.bookID.isbn || "N/A", // Mã ISBN
              bookDescription: detail.bookID.bookDescription || "N/A", // Mô tả sách
<<<<<<< HEAD
              image: detail.bookID.image
                ? `http://localhost:6789${detail.bookID.image}`
                : "N/A",
              // Hình ảnh
=======
              image: detail.bookID.image || "", // Hình ảnh
>>>>>>> c4db0e6 (Commit frontend)
              iSDQuantity: detail.iSDQuantity || 0, // Số lượng nhập
              bookPrice: detail.bookID.bookPrice || 0,
              importPrice: detail.importPrice || 0, // Giá nhập
              totalPrice: (detail.iSDQuantity || 0) * (detail.importPrice || 0), // Tổng giá trị
            }));
          })
        );

        setImportedBooksData(importedData.flat()); // Làm phẳng dữ liệu để phù hợp với bảng
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sách nhập:", error);
        message.error("Không thể tải dữ liệu sách nhập");
      }
    };

    loadImportedBooksData();
  }, []);

  const filteredData = chartData.filter((item) =>
    moment(item.date).isBetween(
      moment().startOf("month"),
      moment().endOf("month"),
      "day",
      "[]"
    )
  );
<<<<<<< HEAD
  const sortedData = filteredData.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
=======
  const sortedData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
>>>>>>> c4db0e6 (Commit frontend)

  console.log("Dữ liệu cho biểu đồ:", filteredData);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={image}
          alt="Book"
          style={{ width: 50, height: 75, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Title Book",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Publisher",
      dataIndex: "publisher",
      key: "publisher",
    },
    {
      title: "Sold",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`, // Hiển thị giá với định dạng tiền tệ
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.price || 0); // Tính tổng giá
        return `${total.toLocaleString()} VND`; // Hiển thị tổng giá với định dạng tiền tệ
      },
    },
  ];

  const importedColumns = [
    {
      title: "Image (Detail)",
      dataIndex: "image",
      key: "image",
      render: (image, record) => (
        <img
          src={image}
          alt="Book"
          style={{
            width: 75,
            height: 75,
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => showModal(record)} // Gắn sự kiện click
        />
      ),
    },
    {
      title: "Book Title",
      dataIndex: "bookTitle",
      key: "bookTitle",
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Publisher",
      dataIndex: "publisher",
      key: "publisher",
    },
    {
      title: "Quantity Imported",
      dataIndex: "iSDQuantity",
      key: "quantity",
    },
    {
      title: "Import Price",
      dataIndex: "importPrice",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`, // Định dạng giá nhập
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `${totalPrice.toLocaleString()} VND`, // Hiển thị tổng giá trị
    },
  ];

  return (
<<<<<<< HEAD
    <>
      <div
        className="main-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
          gap: "30px", // Tạo khoảng cách đều giữa các phần
        }}
      >
        <DashboardContainer />

        <div
          className="dashboard-content"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr", // Sắp xếp theo chiều dọc
            justifyItems: "center",
            width: "90%", // Giới hạn chiều rộng
            maxWidth: "1200px", // Không để quá rộng
          }}
        >
          {/* Biểu đồ doanh thu */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <h1>Revenue Report This Month</h1>
            <div style={{ overflowX: "auto" }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: sortedData.map((item) => item.date),
                    label: "Dates",
                  },
                ]}
                series={[
                  {
                    data: filteredData.map((item) => item.Import),
                    label: "Import (VND)",
                    color: "#8884d8",
                  },
                  {
                    data: filteredData.map((item) => item.Export),
                    label: "Export (VND)",
                    color: "#82ca9d",
                  },
                  {
                    data: filteredData.map((item) => item.Revenue),
                    label: "Revenue (VND)",
                    color: "#ff7300",
                    lineStyle: { strokeWidth: 2 },
                  },
                ]}
                width={900} // Giảm chiều rộng
                height={400}
              />
            </div>
          </div>

          {/* Bảng sách đã bán */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <h2>Books Sold</h2>
            <Table
              dataSource={booksData}
              columns={columns}
              rowKey="bookId"
              bordered
              pagination={{ pageSize: 10 }}
              style={{ width: "100%" }}
            />
          </div>

          {/* Bảng sách đã nhập */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <h2>Books Imported Of All Time</h2>
            <Table
              dataSource={importedBooksData}
              columns={importedColumns}
              rowKey="isdid"
              bordered
              pagination={{ pageSize: 10 }}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <Modal
          title="Book Detail"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>,
          ]}
        >
          {selectedBook && (
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <p>
                  <strong>Book ID:</strong> {selectedBook.bookID || "N/A"}
                </p>
                <p>
                  <strong>Title:</strong> {selectedBook.bookTitle || "N/A"}
                </p>
                <p>
                  <strong>Author:</strong> {selectedBook.author || "N/A"}
                </p>
                <p>
                  <strong>Translator:</strong>{" "}
                  {selectedBook.translator || "N/A"}
                </p>
                <p>
                  <strong>Publisher:</strong> {selectedBook.publisher || "N/A"}
                </p>
                <p>
                  <strong>Publication Year:</strong>{" "}
                  {selectedBook.publicationYear || "N/A"}
                </p>
                <p>
                  <strong>ISBN:</strong> {selectedBook.isbn || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedBook.bookDescription || "N/A"}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedQuantity || "N/A"}
                </p>
                <p>
                  <strong>Price:</strong>{" "}
                  {selectedBook.bookPrice
                    ? `${new Intl.NumberFormat("en-US").format(
                        selectedBook.bookPrice
                      )} VND`
                    : "N/A"}
                </p>
              </div>
              {selectedBook.image ? (
                <div style={{ width: "200px" }}>
                  <img
                    src={
                      selectedBook.image.startsWith("http")
                        ? selectedBook.image
                        : `http://localhost:6789${selectedBook.image}`
                    }
                    alt="Book Cover"
                    style={{ width: "100%", borderRadius: "5px" }}
                  />
                </div>
              ) : (
                <p>No Image Available</p>
              )}
            </div>
          )}
        </Modal>

        <Footer />
      </div>
    </>
=======
    <div
      className="main-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh", // Đổi từ height sang minHeight để cho phép cuộn
        padding: "20px", // Thêm padding để tránh nội dung chạm sát mép
        overflow: "auto", // Cho phép cuộn khi nội dung vượt quá
      }}
    >
      <DashboardContainer />
      <div
        className="dashboard-content"
        style={{
          textAlign: "center",
          width: "80%",
          marginLeft: "150px",
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ textAlign: "center", margin: "20px 0" }}>
            Revenue Report This Month
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LineChart
              xAxis={[
                {
                  scaleType: "band",
                  data: sortedData.map((item) => item.date),
                  label: "Dates",
                },
              ]}
              series={[
                {
                  data: filteredData.map((item) => item.Import),
                  label: "Import (VND)",
                  color: "#8884d8",
                },
                {
                  data: filteredData.map((item) => item.Export),
                  label: "Export (VND)",
                  color: "#82ca9d",
                },
                {
                  data: filteredData.map((item) => item.Revenue),
                  label: "Revenue (VND)",
                  color: "#ff7300",
                  lineStyle: { strokeWidth: 2 },
                },
              ]}
              width={2000}
              height={400}
              tooltip={(value) => `${value.toLocaleString()} VND`} // Hiển thị giá trị qua tooltip
            />

          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ textAlign: "center", margin: "20px 0" }}>Books Sold</h2>
          <Table
            dataSource={booksData}
            columns={columns}
            rowKey="bookId"
            bordered
            pagination={{ pageSize: 10 }}
            style={{ margin: "0 auto" }}
          />
        </div>

        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ textAlign: "center", margin: "20px 0" }}>
            Books Imported Of All Time
          </h2>
          <Table
            dataSource={importedBooksData} // Dữ liệu đã xử lý
            columns={importedColumns} // Cột hiển thị
            rowKey="isdid" // Khóa duy nhất cho từng hàng (cột isdid trong dữ liệu)
            bordered
            pagination={{ pageSize: 10 }}
            style={{ margin: "20px 0" }}
          />
        </div>
      </div>
      <Modal
        title="Book Detail"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
        ]}
      >
        {selectedBook && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p>
                <strong>Book ID:</strong> {selectedBook.bookID || "N/A"}
              </p>
              <p>
                <strong>Title:</strong> {selectedBook.bookTitle || "N/A"}
              </p>
              <p>
                <strong>Author:</strong> {selectedBook.author || "N/A"}
              </p>
              <p>
                <strong>Translator:</strong> {selectedBook.translator || "N/A"}
              </p>
              <p>
                <strong>Publisher:</strong> {selectedBook.publisher || "N/A"}
              </p>
              <p>
                <strong>Publication Year:</strong>{" "}
                {selectedBook.publicationYear || "N/A"}
              </p>
              <p>
                <strong>ISBN:</strong> {selectedBook.isbn || "N/A"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedBook.bookDescription || "N/A"}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedQuantity || "N/A"}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                {selectedBook.bookPrice
                  ? `${new Intl.NumberFormat("en-US").format(
                    selectedBook.bookPrice
                  )} VND`
                  : "N/A"}
              </p>
            </div>
            {console.log("Sách đang được chọn: ", selectedBook)}
            {selectedBook.image ? (
              <div style={{ marginLeft: "20px", maxWidth: "200px" }}>
                <img
                  src={
                    selectedBook.image.startsWith("http")
                      ? selectedBook.image
                      : `http://localhost:6789${selectedBook.image}`
                  }
                  alt="Book Cover"
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              </div>
            ) : (
              <p>No Image Available</p>
            )}
          </div>
        )}
      </Modal>
    </div>
>>>>>>> c4db0e6 (Commit frontend)
  );
};

export default RevenueReport;
