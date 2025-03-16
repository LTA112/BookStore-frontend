import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { fetchCategories, addCategory } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import TextArea from "antd/es/input/TextArea.js";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

function AddCategory() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormEmpty, setIsFormEmpty] = useState(true);

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
  }, []);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const isEmpty = !values.catName || values.catName.trim() === "";
    setIsFormEmpty(isEmpty);
  };

  const handleSubmit = async (values) => {
    try {
      if (!values.catName.trim()) {
        message.error("Category name only contains spaces");
      } else {
        const name = values.catName.trim();
        const description = values.catDescription?.trim();
        const categoryData = {
          catName: name,
          catDescription: description,
          catStatus: 1,
        };
        await addCategory(categoryData);
        message.success("Category added successfully");
        navigate("/dashboard/category");
      }

    } catch (error) {
      console.error("Error adding category:", error);
      message.error("Failed to add category");
    }
  };

  const handleResetOrBack = () => {
    if (isFormEmpty) {
      navigate("/dashboard/category");
    } else {
      form.resetFields();
      setIsFormEmpty(true);
    }
  };

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <Card className="dashboard-content" style={{ marginBottom: '50px' }}>
        <div className="titlemanagement">
          <div>Add Category</div>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          onFieldsChange={handleFormChange}
          style={{ maxWidth: "600px", margin: "auto" }}
        >
          <Form.Item
            label="Category Name"
            name="catName"
            rules={[
              {
                validator: (_, value) => {
                  const regex = /^[a-zA-Z0-9\s]+$/; // Allow only letters, numbers, and spaces
                  if (value.trim() === '' || !regex.test(value)) {
                    return Promise.reject(new Error('Please enter a valid category name (only letters, numbers, and spaces along with characters)'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            label="Category description"
            name="catDescription"
            rules={[{ required: false }]}
            style={{ maxWidth: "600px", margin: "auto" }}
          >
            <TextArea placeholder="Enter category description" />
          </Form.Item>
          <br></br>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              htmlType="button"
              onClick={handleResetOrBack}
              style={{ marginLeft: "20px" }}
            >
              {isFormEmpty ? "Back" : "Reset"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="copyright">
        <div>© Copyright {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div >
  );
}

export default AddCategory;
