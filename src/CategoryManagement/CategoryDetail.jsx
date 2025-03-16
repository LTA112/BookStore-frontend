import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Form, Input, message } from "antd";
import { fetchCategoryDetail } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import TextArea from "antd/es/input/TextArea.js";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

function CategoryDetail() {
  const [categoryData, setCategoryData] = useState(null);
  const navigate = useNavigate();
  const { catID } = useParams(); // Get the category ID from the route

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    const loadCategoryDetail = async () => {
      try {
        // Fetch the current category details
        const response = await fetchCategoryDetail(catID);

        if (response === undefined) {
          navigate("/404")
          return;
        }
        if (response.data.catStatus === 0) {
          navigate("/404")
          return;
        }
        const category = response.data;
        setCategoryData(category);
      } catch (error) {
        console.error("Error fetching category detail:", error);
        message.error("Failed to fetch category details");
      }
    };

    loadCategoryDetail();
  }, [catID]);

  const handleBack = () => {
    navigate("/dashboard/category");
  };

  if (!categoryData) {
    return <p>Loading category details...</p>;
  }

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <Card className="dashboard-content" style={{ marginBottom: '50px' }}>
        <div className="titlemanagement">
          <div>Category Details</div>
        </div>

        <Form layout="vertical" style={{ maxWidth: "800px", margin: "auto" }}>
          <Form.Item label="Category Name">
            <Input value={categoryData.catName} readOnly />
          </Form.Item>

          <Form.Item>
            <TextArea value={categoryData.catDescription} readOnly />
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              onClick={handleBack}
              style={{
                backgroundColor: "black",
                color: "white",
                display: "block",
                margin: "0 auto",
              }}
            >
              Back
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
}

export default CategoryDetail;
