import React from "react";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { verifyEmail } from "../config.js";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const loginData = {
        username: localStorage.getItem("username"),
        code: values.code,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("code", JSON.stringify(loginData));
      const response = await verifyEmail(formDataToSend);
      navigate("/password/reset");

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
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Logo được thêm ở đây */}
        <img
          src="public/images/z6342581065000_fd22f0bb2accb943186ca745048279cb.jpg"
          alt="BookStore Logo"
          className="login-logo"
        />
        <h1>Verify Email</h1>
        <p>
          OTP code has been sent to email{" "}
          <strong>{localStorage.getItem("email")}</strong>. Please access your
          email to enter the OTP code.{" "}
        </p>
        <Row justify={"center"}>
          <Col span={24}>
            <Form.Item
              label="OTP Code"
              name="code"
              rules={[
                {
                  required: true,
                  message: "Please input your code!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Verify
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default VerifyEmail;
