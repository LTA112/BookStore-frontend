import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccountDetail, updateAccount, logout } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { Form, Input, Button, message, Radio, Row, Col, Select } from "antd";
import {
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig.jsx";
import Footer from "../FooterForDashboard/Footer.jsx";

function Profile() {
  const [form] = Form.useForm(); // Ant Design form instance
  const [isEditing, setIsEditing] = useState(false);
  const username = decodeJWT(localStorage.getItem("jwtToken")).sub;
  const navigate = useNavigate();
  const { TextArea } = Input;
  useEffect(() => {
    if (
      !checkAdminRole() &&
      !checkSellerStaffRole() &&
      !checkWarehouseStaffRole()
    ) {
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
      navigate("/dashboard/profile");
    } catch (error) {
      console.error("Error updating account:", error);
      message.error("Failed to update account.");
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    handleSubmit();
  };

  return (
    <>
      <div
        className="dashboard-content"
        style={{ marginLeft: "250px", marginRight: "100px", marginTop: "1%" }}
      >
        <DashboardContainer />
        <h1>Profile</h1>
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
                rules={[{ required: true, message: "Please select role" }]}
                readOnly
                disabled
              >
                <Select name="role" readOnly disabled>
                  <Select.Option value="0">Admin</Select.Option>
                  <Select.Option value="1">Customer</Select.Option>
                  <Select.Option value="2">Staff</Select.Option>
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
                  type="TextArea"
                  rows={4}
                  placeholder="Address of account"
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item>
                {isEditing ? (
                  <Button type="primary" htmlType="button" onClick={handleSave}>
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
                  onClick={() => navigate("/dashboard/profile/changepassword")}
                  style={{ marginLeft: "10px" }}
                >
                  Change password
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <Footer></Footer>
    </>
  );
}

export default Profile;
