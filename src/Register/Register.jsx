import React from "react";
import { Button, Col, Form, Input, Radio, Row, message } from "antd";
import { useNavigate } from "react-router-dom";
import { registerAccount } from "../config";
import "./Register.css"; // Import file CSS
import { values } from "@ant-design/plots/es/core/utils";

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const registerData = {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        email: values.email,
        phone: values.phone,
        address: values.address,
        sex: values.sex,
        password: values.password,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("register", JSON.stringify(registerData));

      await registerAccount(formDataToSend);
      message.success("Account has been registered successfully");
      navigate("/auth/login");
    } catch (error) {
      if (error.response) {
        console.error(
          "Server responded with status code:",
          error.response.status
        );
        console.error("Error data:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
      message.error("Failed to add account");
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div className="register-container">
      <div className="register-form">
        {/* Logo ở trên cùng */}
        <img
          src="/logo-bookstore2.png"
          alt="Bookstore Logo"
          className="register-logo"
        />
        <h1 className="register-title">Register Account</h1>
        <Form
          form={form}
          initialValues={{
            sex: "0",
          }}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please enter username" },
                  {
                    pattern: /^[a-zA-Z0-9]+$/,
                    message: "Username must be contained letters and numbers!",
                  },
                ]}
              >
                <Input placeholder="Username" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                  },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email",
                  },
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
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                label="Confirm password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Please input confirm your password!",
                  },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Confirm password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                  },
                  {
                    validator: (_, value) => {
                      if (!value || value === form.getFieldValue("password")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "Confirm password does not match to password!"
                        )
                      );
                    },
                  },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[0-9]{10,15}$/,
                    message: "Phone number must be 10-15 digits!",
                  },
                ]}
              >
                <Input placeholder="Phone Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date of birth"
                name="dob"
                rules={[
                  { required: true, message: "Please enter date of birth" },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error("Please enter date of birth")
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
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Sex"
                name="sex"
                rules={[
                  { required: true, message: "Please select your gender" },
                ]}
              >
                <Radio.Group>
                  <Radio value="0">Female</Radio>
                  <Radio value="1">Male</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input.TextArea rows={4} placeholder="Address" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
                <Button
                  type="default"
                  onClick={handleReset}
                  style={{ marginLeft: 10 }}
                >
                  Reset
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default Register;
