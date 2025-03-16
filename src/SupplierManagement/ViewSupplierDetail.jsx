import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Descriptions, message } from "antd"; // Import Ant Design components
import { fetchSupplierDetail } from "../config"; // API to fetch supplier details
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx"; // Dashboard layout
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
const ViewSupplierDetail = () => {
    const { supID } = useParams(); // Get supID from URL
    const navigate = useNavigate(); // Navigation between pages
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
        // Fetch supplier data when component mounts
        fetchSupplierDetail(supID)
            .then((response) => {
                console.log("Fetched supplier data:", response.data); // Log fetched data
                setFormData(response.data); // Update form data with supplier info
            })
            .catch((error) => {
                console.error("Error fetching supplier details:", error);
                message.error("Failed to fetch supplier details");
            });
    }, [supID]); // Re-run when supID changes

    const goToSupplierManagement = () => {
        navigate("/dashboard/suppliers"); // Navigate back to Supplier Management
    };

    return (
        <div className="main-container">
            <DashboardContainer />

            <div className="dashboard-content">
                <Card
                    title={`Supplier Detail - ${formData.supName || "N/A"}`}
                    bordered={false}
                    style={{ width: "100%", margin: "auto", maxWidth: "800px" }}
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Supplier ID">
                            {formData.supID || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Supplier Name">
                            {formData.supName || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Supplier Email">
                            {formData.supEmail || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Supplier Phone">
                            {formData.supPhone || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Supplier Address">
                            {formData.supAddress || "N/A"}
                        </Descriptions.Item>
                    </Descriptions>

                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Button type="primary" onClick={goToSupplierManagement}>
                            Back
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="copyright">
                <div>© {new Date().getFullYear()}</div>
                <div>Capybook Management System</div>
                <div>All Rights Reserved</div>
            </div>
        </div>
    );
};

export default ViewSupplierDetail;
