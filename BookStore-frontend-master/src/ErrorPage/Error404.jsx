import React from "react";
import { Layout, Button, Input, Dropdown, Menu } from "antd";
import {
  BellOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./PageNotFound.css"; // Import CSS cho phần hình nền
import { decodeJWT } from "../jwtConfig";
import { logout } from "../config";
const { Header, Footer, Content } = Layout;
<<<<<<< HEAD
=======
const { Search } = Input;
>>>>>>> c4db0e6 (Commit frontend)

const PageNotFound = () => {
  const navigate = useNavigate(); // Dùng để điều hướng về trang chủ

  const handleBackToHome = () => {
    navigate("/"); // Điều hướng về trang chủ
  };

  const handleSearch = (value) => {
    console.log("Search term:", value);
    // Thực hiện chức năng tìm kiếm ở đây hoặc điều hướng người dùng
  };
  const handleDashboardClick = () => {
    navigate("/dashboard/income-statistic");
  };
  const handleNotificationClick = () => {
    navigate("/notifications");
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
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <Layout>
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
          onClick={() => navigate("/")} // Navigate to homepage when clicked
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

      <Content className="not-found-content"></Content>

      <Footer
        style={{
          textAlign: "center",
          color: "#fff",
          backgroundColor: "#343a40",
          padding: "10px 0",
        }}
      >
        <div>© {new Date().getFullYear()} Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </Footer>
    </Layout>
  );
};

export default PageNotFound;
