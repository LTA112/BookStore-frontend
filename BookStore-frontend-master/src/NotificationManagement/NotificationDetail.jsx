import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, message } from "antd";
import { fetchNotificationDetail } from "../config";
import UnderlineOutlined from "@ant-design/icons";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import ReactHtmlParser from "html-react-parser";
import {
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
} from "../jwtConfig.jsx";

function NotificationDetail() {
  const [notificationyData, setNotificationData] = useState(null);
  const navigate = useNavigate();
  const { notID } = useParams(); // Get the Notification ID from the route

  useEffect(() => {
    if (
      !checkSellerStaffRole() &&
      !checkAdminRole() &&
      !checkWarehouseStaffRole()
    ) {
      return navigate("/404");
    }
    const loadNotificationDetail = async () => {
      try {
        console.log("notID: " + notID);
        // Fetch the current category details
        const response = await fetchNotificationDetail(notID);
        console.log(response);
        if (response === undefined) {
          navigate("/404");
          return;
        }
        if (response.data.notStatus === 0) {
          navigate("/404");
          return;
        }

        setNotificationData(response.data);
      } catch (error) {
        console.error("Error fetching notification detail:", error);
        message.error("Failed to fetch notification details");
      }
    };
    loadNotificationDetail();
  }, [notID]);
  const handleBack = () => {
    navigate("/dashboard/notification");
  };
  if (!notificationyData) {
    return <p>Loading notification details...</p>;
  }
  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div className="dashboard-content">
        <div className="titlemanagement" style={{ textAlign: "center" }}>
          <div>Notification Details</div>
        </div>
        <Card
          title={notificationyData.notTitle}
          style={{ marginBottom: "30px", padding: "20px" }}
          headStyle={{ fontSize: "20px", textAlign: "center" }}
        >
          {ReactHtmlParser(notificationyData.notDescription)}
        </Card>
      </div>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
}
export default NotificationDetail;
