import React from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../config.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const forgotPasswordData = {
        username: values.username,
        email: values.email,
      };
      localStorage.setItem("username", values.username);
      localStorage.setItem("email", values.email);
      const formDataToSend = new FormData();
      formDataToSend.append(
        "forgot-password",
        JSON.stringify(forgotPasswordData)
      );
      navigate("/email/verify");
      const response = await forgotPassword(formDataToSend);
    } catch (error) {
      console.log(error);
      message.error("Login failed");
    }
  };
  return (
    <div className="login-container">
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Logo được thêm ở đây */}
        <img
          src="logo-bookstore.jpg"
          alt="Bookstore Logo"
          className="login-logo"
        />
        <h1>Forgot Password</h1>
        <Row gutter={24} justify={"center"}>
          <Col span={24}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              Send
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </div>
  );
};

export default ForgotPassword;
