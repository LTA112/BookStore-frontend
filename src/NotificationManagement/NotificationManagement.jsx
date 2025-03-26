import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Space, Table, Modal, Button, Input, message } from "antd"; // Ant Design components
import {
  fetchNotifications,
  deleteNotification,
  fetchAccountDetail,
  fetchStaffByUsername,
} from "../config"; // API imports
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig.jsx";
import Footer from "../FooterForDashboard/Footer.jsx";

const { Search } = Input;

const NotificationManagement = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch accounts from the API
  useEffect(() => {
    if (
      !checkSellerStaffRole() &&
      !checkAdminRole() &&
      !checkWarehouseStaffRole()
    ) {
      return navigate("/404");
    }
    setLoading(true);
    fetchNotifications()
      .then((response) => {
        console.log(response);
        setNotification(
          response.data.filter((notification) => notification.notStatus !== 0)
        );
        setError("");
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setError("Failed to fetch notifications");
        message.error("Failed to fetch notifications");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = (notID) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: `Are you sure you want to delete notification "${
        notification.find((notification) => notification.notID === notID)
          .notTitle
      }"?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        deleteNotification(notID)
          .then(() => {
            setLoading(true);
            fetchNotifications()
              .then((response) => {
                setNotification(
                  response.data.filter(
                    (notification) => notification.notStatus !== 0
                  )
                );
                setError("");
              })
              .catch((error) => {
                console.error("Error fetching notifications:", error);
                setError("Failed to fetch notifications");
                message.error("Failed to fetch notifications");
              })
              .finally(() => {
                setLoading(false);
              });
            message.success("Notification deleted successfully");
          })
          .catch((error) => {
            console.error("Error deleting notification:", error);
            message.error("Failed to delete notification");
          });
      },
    });
  };

  const goToAddNotification = () => {
    navigate("/dashboard/notifications/add");
  };
  const goToNotificationDetail = (notID) => {
    navigate(`/dashboard/notifications/detail/${notID}`);
  };

  // Define the columns for the Ant Design Table
  const columns = [
    {
      title: "ID",
      dataIndex: "notID",
      key: "notID",
    },
    {
      title: "Title",
      key: "notTitle",
      render: (record) => `${record.notTitle}`,
    },
    {
      title: "Receiver",
      key: "receiver",
      render: (record) => {
        let receiver = "";
        switch (record.receiver) {
          case 0:
            receiver = "Admin";
            break;
          case 1:
            receiver = "Customer";
            break;
          case 2:
            receiver = "Seller staff";
            break;
          case 3:
            receiver = "Warehouse staff";
            break;
          case 4:
            receiver = "Seller and Warehouse";
            break;
          case 5:
            receiver = "Seller, Warehouse and Customer";
            break;
          case 6:
            receiver = "All";
            break;
        }
        return receiver;
      },
    },

    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => goToNotificationDetail(record.notID)}
          >
            <InfoCircleOutlined />
          </Button>
          <Button
            Button
            type="link"
            danger
            onClick={() => handleDelete(record.notID)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const filteredNotifications = notification.filter(
    (notification) =>
      notification.notTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${notification.notTitle}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>
      <div className="dashboard-content">
        <div className="title-management">
          <h1>Notification Management</h1>
        </div>
        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Button type="primary" onClick={goToAddNotification}>
            Add Notification
          </Button>
          <Search
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredNotifications}
          rowKey="notID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <Footer></Footer>
    </div>
  );
};

export default NotificationManagement;
