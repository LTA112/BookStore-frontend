import React from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { login, forgotPassword } from "../config.js";
import { decodeJWT } from "../jwtConfig.jsx";

const Login = () => {
  const navigate = useNavigate();

  const buildFormData = (key, data) => {
    const formData = new FormData();
    formData.append(key, JSON.stringify(data));
    return formData;
  };

  const handleRedirectByRole = (role) => {
    const isStaff = [0, 2, 3].includes(role);
    navigate(isStaff ? "/dashboard/income-statistic" : "/");
  };

  const handleVerificationIfNeeded = async (accountDTO) => {
    const decoded = decodeJWT();
    if ([2, 4].includes(decoded.status)) {
      const verifyData = {
        username: accountDTO.username,
        email: accountDTO.email,
      };
      await forgotPassword(buildFormData("forgot-password", verifyData));
      navigate("/account/verify");
      return true;
    }
    return false;
  };

  const onFinish = async (values) => {
    const loginData = {
      username: values.username,
      password: values.password,
    };

    try {
      const response = await login(buildFormData("login", loginData));

      if (!response.data) {
        return message.error(
          "Username or password is incorrect! Please enter again"
        );
      }

      const { accountDTO, token } = response.data;

      if (!accountDTO) return;

      localStorage.setItem("jwtToken", token);
      message.success("Login successfully");

      const verified = await handleVerificationIfNeeded(accountDTO);
      if (!verified) {
        handleRedirectByRole(accountDTO.role);
      }
    } catch (error) {
      console.error(error);
      message.error("Login failed");
    }
  };

  return (
    <div className="login-container">
      <Form
        name="basic"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <img
          src="/public/logo-book.png"
          alt="BookStore Logo"
          className="login-logo"
        />
        <h1>LOGIN</h1>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>

          <Col span={24} style={{ textAlign: "center", marginBottom: "10px" }}>
            <Link to="/password/forgot">Forgot password</Link>
          </Col>

          <Col span={24}>
            <Form.Item style={{ textAlign: "center" }}>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
              <Button
                type="default"
                style={{ marginLeft: "10px" }}
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Login;
