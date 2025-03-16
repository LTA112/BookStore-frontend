import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Input, Card, message } from "antd";
import TextArea from "antd/es/input/TextArea.js";
import {
  fetchCategoryDetail,
  fetchCategories,
  updateCategory,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

const EditCategory = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { catID } = useParams();

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    const loadCategoryDetail = async () => {
      try {
        const response = await fetchCategoryDetail(catID);
        if (response.data.catStatus === 0) {
          navigate("/404")
          return;
        }
        const category = response.data;

        form.setFieldsValue({
          catName: category.catName,
          catDescription: category.catDescription,
        });
      } catch (error) {
        console.error("Error fetching category detail:", error);
        message.error("Failed to fetch category details");
      }
    };

    loadCategoryDetail();
  }, [catID, form]);

  const handleSubmit = (values) => {
    const name = values.catName.trim();
    const description = values.catDescription?.trim();
    const updatedCategory = {
      catName: name,
      catDescription: description,
      catStatus: values.catStatus || 1,
    };

    updateCategory(catID, updatedCategory)
      .then(() => {
        message.success("Category updated successfully");
        navigate("/dashboard/category");
      })
      .catch((error) => {
        console.error("Error updating category:", error);
        message.error("Failed to update category");
      });
  };

  const handleCancel = () => {
    navigate("/dashboard/category");
  };

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <Card className="dashboard-content" style={{ marginBottom: '50px' }}>
        <div className="titlemanagement">
          <div>Edit Category</div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: "800px", margin: "auto" }}
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
            <Input placeholder="Category Name" />
          </Form.Item>

          <Form.Item
            label="Category Description"
            name="catDescription"
            rules={[
              { required: false, message: "Please enter the description" },
            ]}
          >
            <TextArea placeholder="Category Description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              type="default"
              onClick={handleCancel}
              style={{ marginLeft: "20px" }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div >
  );
};

export default EditCategory;
