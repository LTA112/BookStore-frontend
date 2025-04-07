import React, { useState, useEffect, useCallback } from "react";
import ReactHtmlParser from "html-react-parser";
import {
  Layout,
  Menu,
  Dropdown,
  Button,
  List,
  Modal,
  notification,
  Card,
} from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { fetchAccountDetail, logout, fetchNotifications } from "../config"; // Fetch books and categories from API
import {
  checkAdminRole,
  checkCustomerRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig";

const { Header, Footer, Content } = Layout;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for routing
  const [notificationDetailModal, setnotificationDetailModalOpen] =
    useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      if (
        checkAdminRole() ||
        checkCustomerRole() ||
        checkWarehouseStaffRole() ||
        checkSellerStaffRole()
      ) {
        try {
          const fetchedNotifications = await fetchNotifications();
          setNotifications(
            fetchedNotifications.data.filter(
              (notification) =>
                notification.notStatus != 0 &&
                (notification.receiver == 6 ||
                  notification.receiver == 1 ||
                  notification.receiver == 5)
            )
          );
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          setError(error.message || "An error occurred.");
          setNotifications("null");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, []); // Empty dependency array: fetch data only once on component mount
  const handleNotificationDetailClick = (item) => {
    setSelectedNotifications(item);
    setnotificationDetailModalOpen(true);
  };
  const renderItem = (item) => (
    <List.Item>
      <List.Item.Meta
        onClick={() => handleNotificationDetailClick(item)}
        title={item.notTitle} // Assuming 'title' exists in your notification data
      />
    </List.Item>
  );
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleCartClick = () => {
    navigate("/cart/ViewDetail");
  };
  const handleDashboardClick = () => {
    navigate("/dashboard/income-statistic");
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
            src="logo-bookstore2.png"
            alt="Bookstore Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Bookstore</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ShoppingCartOutlined
            onClick={handleCartClick}
            style={{ fontSize: "24px", marginRight: "20px", color: "#fff" }}
          />
          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="topCenter"
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ color: "#fff" }}
            >
              {sessionStorage.getItem("jwtToken")
                ? decodeJWT(sessionStorage.getItem("jwtToken")).sub
                : "Login"}
            </Button>
          </Dropdown>
        </div>
      </Header>

      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={renderItem}
        pagination={{ pageSize: 7 }}
        loading={isLoading} // Display loading indicator while fetching data
        locale={{ emptyText: error ? error : "No notifications yet" }} // Display custom message for loading or error states
      />

      <Modal
        title={selectedNotifications.notTitle}
        centered
        open={notificationDetailModal}
        onOk={() => setnotificationDetailModalOpen(false)}
        onCancel={() => setnotificationDetailModalOpen(false)}
        width={1000}
      >
        {ReactHtmlParser(
          selectedNotifications.notDescription || "No description available"
        )}
      </Modal>
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

export default Notifications;
