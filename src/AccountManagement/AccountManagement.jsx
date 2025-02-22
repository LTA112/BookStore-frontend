import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Space, Table, Modal, Button, Input, message } from "antd"; // Ant Design components
import { fetchAccounts, deleteAccount, searchAccount } from "../config"; // API imports
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { checkAdminRole } from "../jwtConfig.jsx";

const { Search } = Input;

const AccountManagement = () => {
  //navigation
  const navigate = useNavigate();
  const goToAddAccount = () => {
    navigate("/dashboard/accounts/add");
  };

  const goToEditAccount = (username) => {
    navigate(`/dashboard/accounts/${username}`);
  };

  const goToAccountDetail = (username) => {
    navigate(`/dashboard/accounts/detail/${username}`);
  };

  //user state of accounts, search, loading, error
  const [accounts, setAccounts] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState();

  // Fetch accounts from the API
  useEffect(() => {
    if (!checkAdminRole()) {
      return navigate("/404");
    }
    setLoading(true);
    fetchAccounts()
      .then((response) => {
        setAccounts(response.data);
        setError("");
      })
      .catch((error) => {
        console.error("Error fetching accounts:", error);
        setError("Failed to fetch accounts");
        message.error("Failed to fetch accounts");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  //Handle Modal Delete
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const showModal = (username) => {
    setIsModalDeleteOpen(true);
    setUsername(username);
  };
  const handleOk = () => {
    setIsModalDeleteOpen(false);
    deleteAccount(username)
      .then(() => {
        setAccounts(
          accounts.filter((account) => account.username !== username)
        );
        message.success("Account deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        message.error("Failed to delete account");
      });
  };
  const handleCancel = () => {
    setIsModalDeleteOpen(false);
  };

  //Handle Search
  const handleSearch = (value) => {
    setSearchKey(value);
    if (!value) {
      fetchAccounts()
        .then((response) => {
          setAccounts(response.data);
          setError("");
        })
        .catch((error) => {
          console.error("Error fetching accounts:", error);
          setError("Failed to fetch accounts");
          message.error("Failed to fetch accounts");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(true);
      searchAccount(value)
        .then((response) => {
          setAccounts(response.data);
          setError("");
        })
        .catch((error) => {
          console.error("Error fetching accounts:", error);
          setError("Failed to fetch accounts");
          message.error("Failed to fetch accounts");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Define the columns for the Ant Design Table
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Full Name",
      key: "fullName",
      render: (record) => `${record.lastName} ${record.firstName}`,
    },
    {
      title: "Sex",
      key: "sex",
      render: (record) => (record.sex === 0 ? "Female" : "Male"),
    },
    {
      title: "Role",
      key: "role",
      render: (record) => {
        let roleName = "";
        switch (record.role) {
          case 0:
            roleName = "Admin";
            break;
          case 1:
            roleName = "Customer";
            break;
          case 2:
            roleName = "Staff";
            break;
          default:
            roleName = "Unknown";
        }
        return roleName;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => goToAccountDetail(record.username)}
          >
            <InfoCircleOutlined title="Detail" />
          </Button>
          <Button
            type="link"
            style={{ color: "orange" }}
            onClick={() => goToEditAccount(record.username)}
          >
            <EditOutlined title="Edit" />
          </Button>
          {record.role !== 0 && (
            <Button
              type="link"
              danger
              onClick={() => showModal(record.username)}
            >
              <DeleteOutlined title="Disable" />
            </Button>
          )}

          <Modal
            title="Delete Account Confirmation"
            open={isModalDeleteOpen}
            onOk={() => handleOk(record.username)}
            onCancel={handleCancel}
            maskClosable={false}
            closable={false}
            okButtonProps={{ danger: true }}
          >
            <p>Do you want to delete {username} account?</p>
          </Modal>
        </Space>
      ),
    },
  ];

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>
      <div className="dashboard-content">
        <h1>Account Management</h1>
        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <Button type="primary" onClick={goToAddAccount}>
            Add Account
          </Button>
          <Input
            placeholder="Search by username or name of account"
            value={searchKey}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="username"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <div className="copyright">
        <div>© Copyright {new Date().getFullYear()}</div>
        <div>Cabybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
};

export default AccountManagement;
