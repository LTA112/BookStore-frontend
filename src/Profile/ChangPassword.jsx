import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  changePassword,
  fetchAccountDetail,
  logout,
  updateAccount,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  Form,
  Input,
  Button,
  Radio,
  message,
  Select,
  Menu,
  Layout,
  Dropdown,
} from "antd";
import { checkCustomerRole, decodeJWT } from "../jwtConfig.jsx";
import Password from "antd/es/input/Password.js";
import {
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Content, Footer, Header } from "antd/es/layout/layout.js";

function ChangePassword() {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Ant Design form instance

  const goToProfile = () => {
    navigate("/profile");
  };
  if (!checkCustomerRole()) {
    return navigate("/404");
  }
  const handleSubmit = async (values) => {
    try {
      const formDataToSend = new FormData();
      let username = decodeJWT().sub;
      let currentPassword = values.currentPassword;
      let newPassword = values.newPassword;
      if (values.newPassword === values.confirmPassword) {
        // Create the book data object, explicitly setting bookStatus to 1
        const changePasswordData = {
          username,
          currentPassword,
          newPassword,
        };

        formDataToSend.append(
          "password-request",
          JSON.stringify(changePasswordData)
        );

        await changePassword(formDataToSend);
        message.success("Change password successfully");
        navigate("/profile");
      } else {
        message.error("New password and confirm password are not match!");
      }
    } catch (error) {
      console.error("Error change password:", error);
      message.error("Failed to change password.");
    }
  };
  const handleDashboardClick = () => {
    navigate("/dashboard");
  };
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
    <>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#0fa4d6",
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
              src="/public/logo-book.png"
              alt="BookStore Logo"
              style={{ height: "40px", marginRight: "20px" }}
            />
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>Capybook</div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={
                <BellOutlined
                  style={{
                    fontSize: "24px",
                    marginRight: "20px",
                    color: "#fff",
                  }}
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
          <h1 style={{ textAlign: "center" }}> Change Password</h1>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: "700px", margin: "auto" }}
          >
            <Form.Item
              label="Current password"
              name="currentPassword"
              rules={[
                { required: true, message: "Please enter current password" },
              ]}
            >
              <Input.Password placeholder="Current password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter new password" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "New password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                },
              ]}
            >
              <Input.Password placeholder="New password of account" />
            </Form.Item>

            <Form.Item
              label="Confirm password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please enter confirm password" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Confirm password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                },
                {
                  validator: (_, value) => {
                    if (!value || value === form.getFieldValue("newPassword")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "Confirm password does not match to new password!"
                      )
                    );
                  },
                },
              ]}
            >
              <Input.Password placeholder="Confirm password of account" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button
                htmlType="button"
                onClick={goToProfile}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
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
          <div>© {new Date().getFullYear()} Capybook Management System</div>
          <div>All Rights Reserved</div>
        </Footer>
      </Layout>
    </>
  );
}

export default ChangePassword;
