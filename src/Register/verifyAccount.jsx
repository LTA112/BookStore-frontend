import React from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { verifyAccount } from "../config.js";
import {
  checkAdminRole,
  checkCustomerRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig.jsx";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const loginData = {
        username: decodeJWT().sub,
        code: values.code,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("code", JSON.stringify(loginData));
      const response = await verifyAccount(formDataToSend);
      if (decodeJWT().status === 2) {
        if (
          checkAdminRole() ||
          checkSellerStaffRole() ||
          checkWarehouseStaffRole()
        ) {
          navigate("/dashboard");
          return;
        }
        navigate("/");
        console.log(response);
      } else {
        navigate("/password/set");
      }
    } catch (error) {
      console.log(error);
      message.error("Login failed");
    }
  };
  return (
    <div className="login-container">
      <Form
        name="basic"
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
        <h1>Verify Account</h1>
        <p>
          OTP code has been sent to email <strong>{decodeJWT().email}</strong>.
          Please access your email to enter the OTP code.{" "}
        </p>
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

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Verify
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VerifyEmail;
