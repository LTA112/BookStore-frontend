import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill"; // Import ReactQuill
import "react-quill/dist/quill.snow.css"; // Import ReactQuill styles
import { useNavigate } from "react-router-dom";
import { addNotification, fetchStaffByUsername } from "../config.js";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
  decodeJWT,
} from "../jwtConfig";
import { Button, Card, Form, Input, Select, message } from "antd";

function AddNotification() {
  const navigate = useNavigate();
  useEffect(() => {
    if (
      !checkSellerStaffRole() &&
      !checkAdminRole() &&
      !checkWarehouseStaffRole()
    ) {
      return navigate("/404");
    }
  });
  const [form] = Form.useForm();
  const quillRef = useRef(); // Create a ref for ReactQuill
  const [text, setText] = useState("");

  const handleSubmit = async (values) => {
    try {
      const response = await fetchStaffByUsername(decodeJWT().sub);
      console.log(response);
      const NotificationData = {
        staffID: response.data,
        notTitle: values.notTitle.trim(),
        receiver: values.receiver,
        notDescription: text.trim(), // Set description from ReactQuill content
        notStatus: "1",
      };
      const formDataToSend = new FormData();
      formDataToSend.append("notification", JSON.stringify(NotificationData)); // Append form data

      await addNotification(formDataToSend); // Send POST request
      message.success("Notification added successfully");
      navigate("/dashboard/notifications");
    } catch (error) {
      console.error("Error:", error.message);
      message.error("Failed to add notification");
    }
  };

  const handleReset = () => {
    form.resetFields(); // Reset form fields
    setText(""); // Reset Quill text
  };

  const { Option } = Select;

  return (
    <>
      <DashboardContainer />
      <br></br>
      <br></br>
      <br></br>
      <Card style={{ marginLeft: "200px" }} className="dashboard-content">
        <h1 style={{ textAlign: "center" }}>Add Notification</h1>
        <Form
          initialValues={{
            role: "Please select role",
            sex: "0",
          }}
          form={form}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout="horizontal"
          onFinish={handleSubmit}
          style={{ maxWidth: 1200 }}
        >
          <Form.Item
            label="Title"
            name="notTitle"
            rules={[
              {
                validator: (_, value) => {
                  if (value.trim() === "") {
                    return Promise.reject("Please enter the title!");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Title of notification" />
          </Form.Item>

          <Form.Item
            label="Receiver"
            name="receiver"
            rules={[{ required: true, message: "Please select receiver" }]}
          >
            <Select>
              <Option value="1">Customer</Option>
              <Option value="2">Seller staff</Option>
              <Option value="3">Warehouse staff</Option>
              <Option value="4">Seller and Warehouse</Option>
              <Option value="5">Seller, Warehouse, and Customer</Option>
              <Option value="6">All</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="notDescription"
            rules={[{ required: true, message: "Please input description" }]}
          >
            <ReactQuill
              theme="snow"
              ref={quillRef}
              value={text}
              onChange={setText}
              style={{ backgroundColor: "white" }}
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                marginLeft: 400,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button
                type="default"
                onClick={handleReset}
                style={{ marginLeft: 10 }}
              >
                Reset
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
      <br></br>
      <br></br>
      <br></br>

      <div
        className="copyright"
        style={{
          position: "absolute",
          width: "89%",
          marginLeft: "140px",
          bottom: "0%",
        }}
      >
        <div>© {new Date().getFullYear()}</div>
        <div>Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </>
  );
}

export default AddNotification;
