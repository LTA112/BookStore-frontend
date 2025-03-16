import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Input, message } from "antd";
import { fetchPromotionDetail, fetchStaffDetail } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";

const PromotionDetail = () => {
  const { proID } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [createdByUsername, setCreatedByUsername] = useState("N/A");
  const [approvedByUsername, setApprovedByUsername] = useState("N/A");

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    // Fetch promotion details
    fetchPromotionDetail(proID)
      .then(async (response) => {
        console.log("Fetched promotion data:", response.data);
        setFormData(response.data);

        // Fetch createdBy username if available
        if (response.data.createdBy) {
          const createdByResponse = await fetchStaffDetail(
            response.data.createdBy
          );
          setCreatedByUsername(createdByResponse.data.username);
        }

        // Fetch approvedBy username if available
        if (response.data.approvedBy) {
          const approvedByResponse = await fetchStaffDetail(
            response.data.approvedBy
          );
          setApprovedByUsername(approvedByResponse.data.username);
        }
      })
      .catch((error) => {
        console.error("Error fetching promotion details:", error);
        message.error("Failed to fetch promotion details");
      });
  }, [proID]);

  const goToPromotionManagement = () => {
    navigate("/dashboard/promotions");
  };

  return (
    <div className="main-container">
      <DashboardContainer />
      <div className="dashboard-content">
        <Card
          title={`Promotion Detail - ${formData.proName || "N/A"}`}
          bordered={false}
          style={{ width: "100%", margin: "auto", maxWidth: "800px" }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label>Promotion ID</label>
            <Input value={formData.proID || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Promotion Name</label>
            <Input value={formData.proName || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Promotion Code</label>
            <Input value={formData.proCode || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Start Date</label>
            <Input value={formData.startDate || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>End Date</label>
            <Input value={formData.endDate || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Discount</label>
            <Input value={formData.discount || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Quantity</label>
            <Input value={formData.quantity || "N/A"} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Created By</label>
            <Input value={createdByUsername} disabled />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Approved By</label>
            <Input value={approvedByUsername} disabled />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button type="primary" onClick={goToPromotionManagement}>
              Back
            </Button>
          </div>
        </Card>
      </div>

      <div className="copyright">
        <div>© Copyright {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
};

export default PromotionDetail;
