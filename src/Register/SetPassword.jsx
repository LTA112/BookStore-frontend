import React from "react";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../config.js";
import {
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig.jsx";

const SetPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = async (values) => {
    try {
      const resetPasswordData = {
        username: decodeJWT().sub,
        password: values.password,
      };
      const formDataToSend = new FormData();
      formDataToSend.append("password", JSON.stringify(resetPasswordData));
      console.log(values);
      const response = await resetPassword(formDataToSend);
      navigate("/");
      if (
        checkAdminRole() ||
        checkSellerStaffRole() ||
        checkWarehouseStaffRole()
      ) {
        navigate("/dashboard");
        return;
      }
      navigate("/");
    } catch (error) {
      console.log(error);
      message.error("Set password failed");
    }
  };
  return (
    <div className="login-container">
      <Form
        form={form}
        name="basic"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Logo được thêm ở đây */}
        <img
          src="public/images/z6342581065000_fd22f0bb2accb943186ca745048279cb.jpg"
          alt="BookStore Logo"
          className="login-logo"
        />
        <h1>Set Password</h1>
        <Form.Item
          label="Password"
          name="password"
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

        <Form.Item
          label="Confirm password"
          name="confirmPassword"
          dependencies={["password"]}
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
                if (!value || value === form.getFieldValue("password")) {
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

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SetPassword;
