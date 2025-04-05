import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Card,
  Descriptions,
  Table,
  Typography,
  message,
  Input,
  Modal,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { decodeJWT } from "../jwtConfig";
import {
  fetchOrders,
  fetchOrderDetail,
  fetchBookDetail,
  logout,
  fetchPromotionDetail,
  fetchAccountDetail,
} from "../config";

const { Header, Footer, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // Thêm state này
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Kết nối với thanh tìm kiếm
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Fetch all orders and initialize filteredOrders
  useEffect(() => {
    const fetchAllOrders = async () => {
      setLoading(true);
      try {
        const username = decodeJWT(localStorage.getItem("jwtToken")).sub;

        // Fetch orders
        const ordersResponse = await fetchOrders();
        const ordersData = ordersResponse.data || [];

        // Lấy thông tin số điện thoại và tên đầy đủ của khách hàng
        let customerInfo = { fullName: "N/A", phone: "N/A" };
        try {
          const accountResponse = await fetchAccountDetail(username);
          customerInfo = {
            fullName: `${accountResponse.data.firstName} ${accountResponse.data.lastName}`,
            phone: accountResponse.data.phone || "N/A",
          };
        } catch (error) {
          console.error("Failed to fetch account details:", error);
        }

        // Lọc các orders của user hiện tại và sắp xếp giảm dần theo orderID
        const userOrders = ordersData
          .filter(
            (order) => order.customerName && order.customerName === username
          )
          .sort((a, b) => b.orderID - a.orderID);

        setOrders(userOrders);
        setFilteredOrders(userOrders);

        // Fetch chi tiết từng order
        const detailsMap = {};

        for (const order of userOrders) {
          const orderDetailsResponse = await fetchOrderDetail(order.orderID);
          const orderDetails = orderDetailsResponse?.data?.orderDetails || [];
          const proID = orderDetailsResponse?.data?.order?.proID;

          // Fetch book details
          const books = await Promise.all(
            orderDetails.map((detail) => fetchBookDetail(detail.bookID))
          );
          const updatedDetails = orderDetails.map((detail, index) => ({
            ...detail,
            book: books[index]?.data || {},
          }));

          // Fetch promotion details
          let promotion = null;
          if (proID) {
            try {
              const promotionResponse = await fetchPromotionDetail(proID);
              promotion = promotionResponse?.data || {};
            } catch (error) {
              console.error(
                `Failed to fetch promotion for proID: ${proID}`,
                error
              );
            }
          }

          // Lưu thông tin vào detailsMap
          detailsMap[order.orderID] = {
            details: updatedDetails,
            promotionDiscount: promotion?.discount || 0,
            customerFullName: customerInfo.fullName, // Dùng tên đầy đủ
            customerPhone: customerInfo.phone, // Thêm số điện thoại
            orderAddress:
              orderDetailsResponse?.data?.order?.orderAddress || "N/A",
          };
        }

        setOrderDetailsMap(detailsMap);
      } catch (error) {
        message.error("Failed to fetch orders or details.");
        console.error("Error in fetchAllOrders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const handleViewOrderDetails = (orderID) => {
    const selectedOrder = orderDetailsMap[orderID];
    if (selectedOrder) {
      setSelectedOrderDetails({
        ...selectedOrder,
        orderID,
        orderDate: orders.find((order) => order.orderID === orderID)?.orderDate,
        orderStatus: orders.find((order) => order.orderID === orderID)
          ?.orderStatus,
      });
      setModalVisible(true);
    } else {
      message.error("Order details not found.");
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.orderID.toString().includes(lowerCaseTerm) || // Tìm theo Order ID
        (orderDetailsMap[order.orderID]?.details || []).some(
          (detail) =>
            detail.book?.bookTitle?.toLowerCase().includes(lowerCaseTerm) // Tìm theo Book Title
        )
    );
    setFilteredOrders(filtered); // Cập nhật danh sách đã lọc
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
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

  const renderOrderDetailsTable = (orderID) => {
    const orderData = orderDetailsMap[orderID];

    // Kiểm tra nếu dữ liệu không hợp lệ hoặc không phải mảng
    if (!orderData || !Array.isArray(orderData.details)) {
      console.error(`Invalid details for orderID: ${orderID}`, orderData);
      return <div>No details available</div>;
    }

    const details = orderData.details;

    const columns = [
      {
        title: "Image",
        dataIndex: ["book", "image"],
        key: "image",
        render: (image) =>
          image ? (
            <img
              src={normalizeImageUrl(image)} // Sử dụng hàm chuẩn hóa
              alt="Book"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
            />
          ) : (
            "N/A"
          ),
      },
      {
        title: "Title",
        dataIndex: ["book", "bookTitle"],
        key: "bookTitle",
      },
      {
        title: "Author",
        dataIndex: ["book", "author"],
        key: "author",
      },
      {
        title: "ISBN",
        dataIndex: ["book", "isbn"],
        key: "isbn",
      },
      {
        title: "Unit Price",
        dataIndex: ["book", "bookPrice"],
        key: "bookPrice",
        render: (price) => `${formatPrice(price || 0)} VNĐ`,
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Final Price",
        key: "finalPrice",
        render: (_, record) =>
          `${formatPrice(record.quantity * (record.book?.bookPrice || 0))} VNĐ`,
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={details}
        rowKey={(record) => record.book?.bookID || record.ODID}
        pagination={false}
        size="small"
        onRow={(record) => ({
          onClick: () => {
            navigate(`/detail/${record.book.bookID}`); // Điều hướng tới trang chi tiết sách
          },
        })}
      />
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleNotificationClick = () => {
    navigate("/notifications");
  };
  const handleCartClick = () => {
    navigate("/cart/ViewDetail");
  };
  const userMenu = () => {
    if (decodeJWT()) {
      return (
        <Menu>
          {decodeJWT().scope !== "CUSTOMER" ? (
            <Menu.Item
              key="dashboard"
              icon={<AppstoreOutlined />}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Menu.Item>
          ) : (
            <Menu.Item
              key="profile"
              icon={<AppstoreOutlined />}
              onClick={() => navigate("/profile")}
            >
              Profile
            </Menu.Item>
          )}
          <Menu.Item
            key="signout"
            icon={<SettingOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu>
      );
    } else {
      navigate("/auth/login");
    }
  };

  const renderOrderDetailsModal = () => {
    if (!selectedOrderDetails) return null;

    const {
      details,
      orderID,
      orderDate,
      orderStatus,
      orderAddress,
      promotionDiscount,
      customerFullName, // Thêm fullname của user
    } = selectedOrderDetails;

    const columns = [
      {
        title: "Image",
        dataIndex: ["book", "image"],
        key: "image",
        render: (image) =>
          image ? (
            <img
              src={normalizeImageUrl(image)}
              alt="Book"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          ) : (
            "No Image"
          ),
      },
      {
        title: "Title",
        dataIndex: ["book", "bookTitle"],
        key: "bookTitle",
      },
      {
        title: "Author",
        dataIndex: ["book", "author"],
        key: "author",
      },
      {
        title: "ISBN",
        dataIndex: ["book", "isbn"],
        key: "isbn",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
      },
      {
        title: "Unit Price",
        dataIndex: ["book", "bookPrice"],
        key: "bookPrice",
        render: (price) => `${formatPrice(price || 0)} VNĐ`,
      },
      {
        title: "Total Price",
        key: "totalPrice",
        render: (_, record) =>
          `${formatPrice(record.quantity * (record.book?.bookPrice || 0))} VNĐ`,
      },
    ];

    return (
      <Modal
        title={`Order Details - Order ID: ${orderID}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="User Fullname">
            {customerFullName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Order Date">{orderDate}</Descriptions.Item>
          <Descriptions.Item label="Order Status">
            {orderStatus === 0
              ? "Processing"
              : orderStatus === 1
              ? "Cancelled"
              : orderStatus === 2
              ? "Delivering"
              : orderStatus === 3
              ? "Delivered"
              : orderStatus === 4
              ? "Returned"
              : "Unknown"}
          </Descriptions.Item>
          <Descriptions.Item label="Order Address">
            {orderAddress || "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <Table
          columns={columns}
          dataSource={details}
          rowKey={(record) => record.book?.bookID || record.ODID}
          pagination={false}
          style={{ marginTop: "20px" }}
        />

        <Descriptions
          title="Order Summary"
          bordered
          column={1}
          style={{ marginTop: "20px" }}
        >
          <Descriptions.Item label="Total Books Price">
            {formatPrice(
              details.reduce(
                (acc, item) =>
                  acc + item.quantity * (item.book?.bookPrice || 0),
                0
              )
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Promotion Discount">
            {promotionDiscount || 0}%
          </Descriptions.Item>
          <Descriptions.Item label="Final Price">
            {formatPrice(
              details.reduce(
                (acc, item) =>
                  acc + item.quantity * (item.book?.bookPrice || 0),
                0
              ) *
                (1 - promotionDiscount / 100)
            )}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    );
  };

  return (
    <Layout>
      {/* Header */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
<<<<<<< HEAD
          backgroundColor: "#8ebe8b",
=======
          backgroundColor: "#0fa4d6",
>>>>>>> c4db0e6 (Commit frontend)
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
<<<<<<< HEAD
            src="/logo-bookstore2.png"
=======
            src="logo-bookstore.jpg"
>>>>>>> c4db0e6 (Commit frontend)
            alt="Bookstore Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Bookstore</div>
        </div>
        <Search
          placeholder="Search by Order ID or Book Title"
          value={searchTerm} // Kết nối với state `searchTerm`
          onChange={(e) => {
            setSearchTerm(e.target.value); // Cập nhật giá trị tìm kiếm
            handleSearch(e.target.value); // Gọi hàm lọc danh sách
          }}
          style={{ width: "400px", marginRight: "20px" }}
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

      <Content style={{ padding: "20px", minHeight: "600px" }}>
        <Title level={2} style={{ textAlign: "center" }}>
          Order History
        </Title>
        {loading ? (
          <div>Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: "18px", color: "#555" }}>
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const details = orderDetailsMap[order.orderID]?.details || [];
            const firstBook = details[0]; // Lấy cuốn sách đầu tiên
            const finalPrice =
              details.reduce(
                (acc, item) =>
                  acc + item.quantity * (item.book?.bookPrice || 0),
                0
              ) *
              (1 -
                (orderDetailsMap[order.orderID]?.promotionDiscount || 0) / 100); // Tính tổng tiền cuối cùng

            return (
              <Card
                key={order.orderID}
                title={`Order ID: ${order.orderID}`}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
                onClick={() => handleViewOrderDetails(order.orderID)}
              >
                <p>Order Date: {order.orderDate}</p>
                <p>
                  Status:{" "}
                  {order.orderStatus === 0
                    ? "Processing"
                    : order.orderStatus === 1
                    ? "Cancelled"
                    : order.orderStatus === 2
                    ? "Delivering"
                    : order.orderStatus === 3
                    ? "Delivered"
                    : order.orderStatus === 4
                    ? "Returned"
                    : "Unknown"}
                </p>

                {/* Hiển thị danh sách sách dưới dạng bảng */}
                {details.length > 0 && (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "10px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "left",
                          }}
                        >
                          Title
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "right",
                          }}
                        >
                          Total Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((item, index) => (
                        <tr key={index}>
                          <td
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {item.book?.bookTitle || "Unknown Title"}
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "right",
                            }}
                          >
                            {formatPrice(
                              item.quantity * (item.book?.bookPrice || 0)
                            )}{" "}
                            VNĐ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Hiển thị tổng tiền cuối */}
                <p>
                  Final Price: <strong>{formatPrice(finalPrice)} VNĐ</strong>
                </p>
              </Card>
            );
          })
        )}
        {renderOrderDetailsModal()}
      </Content>

      {/* Footer */}
      <Footer
        style={{
          textAlign: "center",
          color: "#fff",
          backgroundColor: "#343a40",
          padding: "10px 0",
          bottom: 0,
          position: "fixed",
          width: "100%",
        }}
      >
        <div>© {new Date().getFullYear()} Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </Footer>
    </Layout>
  );
};

export default OrderHistory;
