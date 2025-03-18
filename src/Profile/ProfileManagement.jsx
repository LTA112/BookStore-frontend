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
  Modal,
  Radio,
  Form,
  message,
} from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../Homepage/Homepage.css";
import {
  fetchAccountDetail,
  fetchBooks,
  fetchCategories,
  logout,
  updateAccount,
} from "../config"; // Fetch books and categories from API
import { checkCustomerRole, decodeJWT } from "../jwtConfig";

const { TextArea } = Input;
const { Header, Footer, Content } = Layout;

const ProfileManagement = () => {
  const [form] = Form.useForm(); // Ant Design form instance
  const [isEditing, setIsEditing] = useState(false);
  const username = decodeJWT().sub;

  useEffect(() => {
    if (!checkCustomerRole()) {
      return navigate("/404");
    }
    if (username) {
      fetchAccountDetail(username)
        .then((response) => {
          const formData = response.data;
          form.setFieldsValue({
            ...formData,
            role: formData.role.toString(),
            sex: formData.sex.toString(),
          });
        })
        .catch((error) => {
          message.error("Failed to fetch profile");
        });
    }
  }, [username, form]);

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      const updatedAccountData = {
        ...form.getFieldsValue(),
      };

      formDataToSend.append("account", JSON.stringify(updatedAccountData));

      await updateAccount(username, formDataToSend);
      message.success("Profile is updated successfully");
    } catch (error) {
      console.error("Error updating account:", error);
      message.error("Failed to update account.");
    }
  };
  const navigate = useNavigate(); // Initialize navigate for routing

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

  const goToChangePassword = () => {
    navigate("/profile/changepassword");
  };

  const handleSave = () => {
    setIsEditing(false);
    handleSubmit();
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
            src="/logo-bookstore2.png"
            alt="Bookstorebook Logo"
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
        <h1 style={{ textAlign: "center" }}>Profile</h1>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: "700px", margin: "auto" }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input placeholder="Username of account" disabled />
              </Form.Item>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    pattern: /^\p{L}+(\s\p{L}+)*$/u,
                    message: "First name must be contained letters",
                  },
                ]}
              >
                <Input
                  placeholder="First name of account"
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date of birth"
                name="dob"
                rules={[
                  { required: true, message: "Please enter the dimensions" },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      const selectedDate = new Date(value);
                      const currentDate = new Date();
                      const minDate = new Date("1900-01-01");

                      if (selectedDate > currentDate) {
                        return Promise.reject(
                          new Error("Date cannot be in the future")
                        );
                      }

                      if (selectedDate < minDate) {
                        return Promise.reject(
                          new Error("Date cannot be before 1900-01-01")
                        );
                      }
                    },
                  },
                ]}
              >
                <Input
                  type="date"
                  placeholder="Date of birth of account"
                  disabled={!isEditing}
                />
              </Form.Item>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    pattern: /^\p{L}+(\s\p{L}+)*$/u,
                    message: "Last name must be contained letters",
                  },
                ]}
              >
                <Input
                  placeholder="Last name of account"
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  {
                    validator: (_, value) => {
                      if (!value || !/\s/.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Email must not contain spaces")
                      );
                    },
                  },
                ]}
              >
                <Input
                  type="email"
                  placeholder="Email of account"
                  disabled={!isEditing}
                />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone" },
                  {
                    pattern: /^[0-9]{10,15}$/,
                    message: "Phone number must be 10-15 digits!",
                  },
                ]}
              >
                <Input placeholder="Phone of account" disabled={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[
                  { required: true, message: "Please select role" },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error("Please enter the date of birth")
                        );
                      }
                      const selectedDate = new Date(value);
                      const currentDate = new Date();
                      const minDate = new Date("1900-01-01");

                      if (selectedDate > currentDate) {
                        return Promise.reject(
                          new Error("Date cannot be in the future")
                        );
                      }

                      if (selectedDate < minDate) {
                        return Promise.reject(
                          new Error("Date cannot be before 1900-01-01")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                readOnly
                disabled
              >
                <Select name="role" readOnly disabled>
                  <Select.Option value="0">Admin</Select.Option>
                  <Select.Option value="1">Customer</Select.Option>
                  <Select.Option value="2">Seller staff</Select.Option>
                  <Select.Option value="3">Warehouse staff</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Sex"
                name="sex"
                rules={[{ required: true, message: "Please enter the sex" }]}
              >
                <Radio.Group name="sex" disabled={!isEditing}>
                  <Radio value="0"> Female </Radio>
                  <Radio value="1"> Male </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: "Please enter the address" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Address of account"
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item style={{ textAlign: "center" }}>
                {isEditing ? (
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                ) : (
                  <Button
                    type="default"
                    onClick={() => setIsEditing(true)}
                    htmlType="submit"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  type="default"
                  onClick={() => goToChangePassword()}
                  htmlType="submit"
                  style={{ marginLeft: "10px" }}
                >
                  Change Password
                </Button>
              </Form.Item>
            </Col>
          </Row>
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
        <div>© {new Date().getFullYear()} Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </Footer>
    </Layout>
  );
};

export default ProfileManagement;
