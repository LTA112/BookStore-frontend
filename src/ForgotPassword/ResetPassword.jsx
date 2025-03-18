import React from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../config.js";
import { decodeJWT } from "../jwtConfig.jsx";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = async (values) => {
    try {
      const resetPasswordData = {
        username: localStorage.getItem("username"),
        password: values.newPassword,
      };
      const formDataToSend = new FormData();
      formDataToSend.append("password", JSON.stringify(resetPasswordData));
      console.log(values);
      const response = await resetPassword(formDataToSend);
      navigate("/auth/login");
      console.log(response);
      localStorage.setItem("jwtToken", response.data.token);
    } catch (error) {
      console.log(error);
      message.error("Login failed");
    }
  };
  return (
    <div className="login-container">
      <Form
        form={form}
        name="basic"
        layout="vertical"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Logo được thêm ở đây */}
        <img
          src="/logo-bookstore2.png"
          alt="Bookstore Logo"
          className="login-logo"
        />
        <h1>Reset Password</h1>
        <Row gutter={24} justify={"center"}>
          <Col span={24}>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your new password!",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Confirm password"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your confirm password!",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Confirm password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                },
                {
                  validator: (_, value) => {
                    console.log(
                      value,
                      " | ",
                      form.getFieldValue("newPassword")
                    );
                    if (!value || value === form.getFieldValue("newPassword")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Confirm password does not match to password!")
                    );
                  },
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ResetPassword;
