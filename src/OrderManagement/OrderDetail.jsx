import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Descriptions, Button, Table, message, Card } from "antd";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  fetchOrderDetail,
  fetchAccountDetail,
  fetchBookDetail,
  fetchPromotionDetail,
  fetchStaffDetail,
} from "../config";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [customer, setCustomer] = useState({}); // Lưu thông tin khách hàng
  const [discount, setDiscount] = useState(0);
  const [processedByUsername, setProcessedByUsername] = useState("N/A"); // Thêm state cho Processed By

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    const fetchData = async () => {
      if (id) {
        try {
          // Fetch order details
          const orderData = await fetchOrderDetail(id);
          setOrder(orderData.data);

          // Fetch customer information
          const username = orderData?.data?.order?.username;
          if (username) {
            const accountData = await fetchAccountDetail(username);
            setCustomer({
              name: `${accountData.data.firstName} ${accountData.data.lastName}`,
              phone: accountData.data.phone || "N/A",
            });
          }

          // Fetch processedBy staff information
          const staffID = orderData?.data?.order?.processedBy;
          if (staffID) {
            const staffData = await fetchStaffDetail(staffID);
            setProcessedByUsername(staffData.data.username); // Lưu username vào state
          }

          // Fetch order details and books
          const orderDetailsData = orderData.data.orderDetails;
          const bookIDs = orderDetailsData.map((item) => item.bookID);
          const bookPromises = bookIDs.map((bookID) => fetchBookDetail(bookID));
          const bookResponses = await Promise.all(bookPromises);
          const books = bookResponses.map((res) => res.data);

          const updatedOrderDetails = orderDetailsData.map((item) => {
            const book = books.find((book) => book.bookID === item.bookID);
            return {
              ...item,
              book: book || {},
            };
          });
          setOrderDetails(updatedOrderDetails);

          // Fetch promotion details if applicable
          const proID = orderData.data.order?.proID;
          if (proID) {
            const promotionData = await fetchPromotionDetail(proID);
            setDiscount(promotionData.data.discount || 0);
          }
        } catch (error) {
          message.error("Failed to fetch data");
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [id]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const columns = [
    {
      title: "Book ID",
      dataIndex: "bookID",
      key: "bookID",
      render: (text, record) => record.bookID || "N/A",
    },
    {
      title: "Title",
      dataIndex: ["book", "bookTitle"],
      key: "bookTitle",
      render: (text, record) => (record.book ? record.book.bookTitle : "N/A"),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      key: "unitPrice",
      render: (_, record) => {
        const unitPrice =
          record.totalPrice && record.quantity
            ? (record.totalPrice / record.quantity).toFixed(2)
            : "N/A";
        return `${formatPrice(unitPrice)} VNĐ`;
      },
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${formatPrice(price || 0)} VNĐ`,
    },
  ];

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div
        className="dashboard-content"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <Card
          title="View Order Detail"
          style={{ marginBottom: "30px", padding: "20px" }}
        >
          <Descriptions bordered column={1} style={{ marginBottom: "20px" }}>
            <Descriptions.Item label="Customer Name">
              {customer.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {customer.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {order.order.orderAddress || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Processed By">
              {processedByUsername || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Table
            columns={columns}
            dataSource={orderDetails}
            rowKey={(record) => record.book?.bookID || record.ODID}
            pagination={false}
            style={{ marginTop: "20px" }}
          />

          <Descriptions title="Summary" bordered style={{ marginTop: "20px" }}>
            <Descriptions.Item label="Total Books Price" span={3}>
              {formatPrice(
                orderDetails.reduce(
                  (acc, item) => acc + (item.totalPrice || 0),
                  0
                )
              )}{" "}
              VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Discount (%)" span={3}>
              {discount || 0}%
            </Descriptions.Item>
            <Descriptions.Item label="Total Price" span={3}>
              {formatPrice(
                orderDetails.reduce(
                  (acc, item) => acc + (item.totalPrice || 0),
                  0
                ) *
                  (1 - discount / 100)
              )}{" "}
              VNĐ
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <Button type="primary" onClick={() => navigate(-1)}>
              Back to Order Management
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
