import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Space, Table, Button, Input, message } from "antd"; // Ant Design components
import { fetchSuppliers, updateSupplier, fetchSupplierById } from "../config"; // Adjusted import path
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"; // Import Ant Design icons

import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
<<<<<<< HEAD
import Footer from "../FooterForDashboard/Footer.jsx";
=======
>>>>>>> c4db0e6 (Commit frontend)

const { Search } = Input;

function SupplierManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch suppliers from API
  useEffect(() => {
    if (!checkWarehouseStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    setLoading(true);
    fetchSuppliers()
      .then((response) => {
        setSuppliers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching supplier:", error);
        message.error("Failed to fetch suppliers");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this supplier?")) {
      try {
        const response = await fetchSupplierById(id);
        const currentSupplierData = response.data;

        const updatedSupplierData = {
          ...currentSupplierData,
          supStatus: 0,
        };

        const formDataToSend = new FormData();
        formDataToSend.append("supplier", JSON.stringify(updatedSupplierData));

        await updateSupplier(id, formDataToSend);

        setSuppliers(
          suppliers.map((supplier) =>
            supplier.supID === id ? { ...supplier, supStatus: 0 } : supplier
          )
        );
        message.success("Supplier deactivated successfully");
      } catch (error) {
        console.error("Error deactivating supplier:", error);
        message.error("Failed to deactivate supplier");
      }
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.supStatus === 1 &&
      ((supplier.supName &&
        supplier.supName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.supEmail &&
          supplier.supEmail.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const goToAddSupplier = () => {
    navigate("/dashboard/suppliers/add");
  };

  const goToEditSupplier = (supID) => {
    navigate(`/dashboard/suppliers/edit/${supID}`);
  };

  const gotoViewSupplierDetail = (supID) => {
    navigate(`/dashboard/supplier/${supID}`);
  };

  const columns = [
    {
      title: "Supplier ID",
      dataIndex: "supID",
      key: "supID",
    },
    {
      title: "Supplier Name",
      dataIndex: "supName",
      key: "supName",
    },
    {
      title: "Supplier Email",
      dataIndex: "supEmail",
      key: "supEmail",
    },
    {
      title: "Supplier Phone",
      dataIndex: "supPhone",
      key: "supPhone",
    },
    {
      title: "Supplier Address",
      dataIndex: "supAddress",
      key: "supAddress",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => gotoViewSupplierDetail(record.supID)}
          >
            <InfoCircleOutlined title="Detail" />
          </Button>
          {record.supStatus === 1 && (
            <>
              <Button
                type="link"
                onClick={() => goToEditSupplier(record.supID)}
                className="yellow-button"
              >
                <EditOutlined title="Edit" />
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleDelete(record.supID)}
              >
                <DeleteOutlined title="Delete" />
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="main-container">
      <DashboardContainer />
      <div className="dashboard-content">
        <div className="titlemanagement">
          <h1>Supplier Management</h1>
        </div>
        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Button type="primary" onClick={goToAddSupplier}>
            Add Supplier
          </Button>
          <Search
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="supID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
<<<<<<< HEAD
      <Footer></Footer>
=======
      <div className="copyright">
        <div>© Copyright {new Date().getFullYear()}</div>
        <div>Bookstore Management System</div>
        <div>All Rights Reserved</div>
      </div>
>>>>>>> c4db0e6 (Commit frontend)
    </div>
  );
}

export default SupplierManagement;
