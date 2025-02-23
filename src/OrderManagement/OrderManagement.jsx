import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Space,
  Table,
  Button,
  Input,
  Modal,
  message,
  Tag,
  Select,
  DatePicker,
} from "antd";
import {
  fetchOrders,
  searchOrders,
  updateOrder,
  fetchAccountDetail,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";
import { fetchStaffByUsername } from "../config"; // Import hàm API lấy staffID

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [error, setError] = useState("");
  const [staffID, setStaffID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    loadOrders();
    const fetchStaff = async () => {
      try {
        const username = decodeJWT(localStorage.getItem("jwtToken")).sub;
        const response = await fetchStaffByUsername(username); // Lấy thông tin staff dựa theo username
        setStaffID(response.data.staffID);
      } catch (error) {
        console.error("Error fetching staff:", error);
        message.error("Failed to fetch staff information.");
      }
    };

    fetchStaff();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrders();
      if (Array.isArray(response.data)) {
        const ordersWithFullName = await Promise.all(
          response.data.map(async (order) => {
            if (!order.customerName) {
              return { ...order, fullName: "Unknown" }; // Nếu thiếu username
            }
            try {
              const accountResponse = await fetchAccountDetail(
                order.customerName
              ); // Sử dụng customerName
              const accountData = accountResponse.data;
              return {
                ...order,
                fullName: `${accountData.firstName || ""} ${accountData.lastName || ""
                  }`.trim(), // Gắn thông tin đầy đủ
              };
            } catch (error) {
              console.error(
                `Error fetching account for ${order.customerName}:`,
                error
              );
              return { ...order, fullName: "Unknown" }; // Giá trị mặc định nếu API thất bại
            }
          })
        );

        // Sắp xếp danh sách đơn hàng theo `orderID` từ lớn đến bé
        const sortedOrders = ordersWithFullName.sort(
          (a, b) => b.orderID - a.orderID
        );

        setOrders(sortedOrders); // Cập nhật danh sách orders đã được sắp xếp
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchKey(value);
    setLoading(true);

    if (!value) {
      loadOrders();
    } else {
      searchOrders(value)
        .then((response) => {
          if (Array.isArray(response.data)) {
            const sortedOrders = response.data.sort(
              (a, b) => b.orderID - a.orderID
            );
            applyDateRangeFilter(sortedOrders);
          } else {
            setError("Failed to search orders");
          }
        })
        .catch(() => {
          setError("Failed to search orders");
          message.error("Failed to search orders");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      applyDateRangeFilter(orders, dates);
    } else {
      loadOrders();
    }
  };

  const applyDateRangeFilter = (data, dates = dateRange) => {
    if (dates) {
      const [start, end] = dates;
      const filteredOrders = data.filter((order) =>
        moment(order.orderDate).isBetween(start, end, "day", "[]")
      );
      setOrders(filteredOrders);
    } else {
      setOrders(data);
    }
  };

  const handleEditStatus = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.orderStatus); // Hiển thị trạng thái hiện tại
    setIsModalVisible(true);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const getNextStatuses = (currentStatus) => {
    const statuses = [
      { value: 0, label: "Processing" },
      { value: 1, label: "Cancelled" },
      { value: 2, label: "Delivering" },
      { value: 3, label: "Delivered" },
      { value: 4, label: "Returned" },
    ];

    return statuses
      .map((status) => ({
        ...status,
        disabled: status.value === currentStatus, // Disable trạng thái hiện tại
      }))
      .filter(
        (status) =>
          status.value === currentStatus ||
          (currentStatus === 0 && (status.value === 1 || status.value === 2)) || // Processing -> Cancelled hoặc Delivering
          (currentStatus === 2 && (status.value === 3 || status.value === 4)) // Delivering -> Delivered hoặc Returned
      );
  };

  const handleUpdate = async () => {
    if (!selectedOrder || selectedStatus === null || !staffID) {
      message.error("Missing data for updating order.");
      return;
    }

    const updatedOrder = {
      orderStatus: selectedStatus,
      staffID, // Gửi staffID từ frontend
    };

    try {
      await updateOrder(selectedOrder.orderID, updatedOrder); // Gửi API cập nhật
      message.success("Order updated successfully.");

      // Cập nhật trạng thái đơn hàng trong bảng
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === selectedOrder.orderID
            ? { ...order, orderStatus: selectedStatus }
            : order
        )
      );
      setIsModalVisible(false); // Ẩn modal
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Failed to update order.");
    }
  };

  const goToAddOrder = () => {
    navigate("/dashboard/orders/add");
  };

  const goToOrderDetail = (id) => {
    navigate(`/dashboard/orders/detail/${id}`);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderID",
      key: "orderID",
    },
    {
      title: "Full Name", // Tiêu đề cột
      dataIndex: "fullName", // Sử dụng trường fullName
      key: "fullName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        let color = "blue";
        let text = "Processing";
        switch (record.orderStatus) {
          case 0:
            color = "blue";
            text = "Processing";
            break;
          case 1:
            color = "red";
            text = "Cancelled";
            break;
          case 2:
            color = "yellow";
            text = "Delivering";
            break;
          case 3:
            color = "green";
            text = "Delivered";
            break;
          case 4:
            color = "orange";
            text = "Returned";
            break;
          default:
            color = "gray";
            text = "Unknown";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Button type="link" onClick={() => goToOrderDetail(record.orderID)}>
            <InfoCircleOutlined title="Detail" />
          </Button>
          {record.orderStatus !== 3 &&
            record.orderStatus !== 1 &&
            record.orderStatus !== 4 && ( // Không hiển thị nút Edit nếu trạng thái là Delivered hoặc Returned
              <Button
                type="link"
                style={{ color: "orange" }}
                onClick={() => handleEditStatus(record)}
              >
                <EditOutlined title="Edit" />
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>
      <div className="dashboard-content">
        <h1>Order Management</h1>
        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* <Button type="primary" onClick={goToAddOrder}>
            Add Order
          </Button> */}
          <div
            style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
          >
            <RangePicker onChange={handleDateRangeChange} />
            <Input
              placeholder="Search by Order ID"
              value={searchKey}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderID"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: orders.length, // Tổng số phần tử
            showSizeChanger: true, // Hiển thị tùy chọn thay đổi số lượng phần tử
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size); // Cập nhật số phần tử trên mỗi trang
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`, // Hiển thị tổng số phần tử
          }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        <Modal
          title="Edit Order Status"
          open={isModalVisible}
          onOk={handleUpdate}
          onCancel={() => setIsModalVisible(false)}
        >
          <p>Select new status:</p>
          <Select
            value={selectedStatus} // Giá trị hiện tại
            style={{ width: "100%" }}
            onChange={handleStatusChange}
          >
            {getNextStatuses(selectedOrder?.orderStatus).map((status) => (
              <Option
                key={status.value}
                value={status.value}
                disabled={status.disabled}
              >
                {status.label}
              </Option>
            ))}
          </Select>
        </Modal>
      </div>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>BookStore Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
};

export default OrderManagement;
