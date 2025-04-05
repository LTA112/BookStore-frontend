import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Space,
  Table,
  Button,
  Input,
  Select,
  message,
  Tag,
  Modal,
  Timeline,
  Pagination,
} from "antd";
import {
  fetchPromotions,
  searchPromotions,
  deletePromotion,
  updatePromotion,
  fetchPromotionLogs,
  fetchStaffByUsername,
  fetchStaffDetail,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import moment from "moment";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
<<<<<<< HEAD
import Footer from "../FooterForDashboard/Footer.jsx";
=======
>>>>>>> c4db0e6 (Commit frontend)

const { Option } = Select;

const PromotionManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [logModalVisible, setLogModalVisible] = useState(false);
  const username = decodeJWT(localStorage.getItem("jwtToken")).sub;
  const [staffID, setStaffID] = useState(null); // Lưu staffID
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [filterActivity, setFilterActivity] = useState("all");

  // Fetch staffID khi component mount
  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    const fetchStaffID = async () => {
      try {
        const response = await fetchStaffByUsername(username); // Lấy thông tin staff bằng username
        setStaffID(response.data.staffID);
      } catch (error) {
        console.error("Error fetching staff:", error);
        message.error("Failed to fetch staff information.");
      }
    };
    fetchStaffID();
    fetchPromotionsData();
  }, [username, filterStatus]);

  // Fetch promotions data
  const fetchPromotionsData = () => {
    setLoading(true);
    fetchPromotions()
      .then((response) => {
        if (Array.isArray(response.data)) {
          const activePromotions = response.data.filter(
            (promo) => promo.proStatus === 1
          );

          const today = moment();
          const filteredPromotions = activePromotions.filter((promo) => {
            const startDate = moment(promo.startDate);
            const endDate = moment(promo.endDate);

            if (filterStatus === "active") {
              return (
                today.isBetween(startDate, endDate, "day", "[]") &&
                promo.quantity > 0
              );
            }
            if (filterStatus === "inactive") {
              return (
                !today.isBetween(startDate, endDate, "day", "[]") ||
                promo.quantity === 0
              );
            }
            return true;
          });

          const sortedPromotions = filteredPromotions.sort(
            (a, b) => b.proID - a.proID
          );
          setPromotions(sortedPromotions);
        }
      })
      .catch((error) => {
        console.error("Error fetching promotions:", error);
        message.error("Failed to fetch promotions.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      fetchPromotionsData(); // Reset to full data if search term is empty
    } else {
      const isNumber = !isNaN(value);
      const id = isNumber ? parseInt(value, 10) : null;
      const term = isNumber ? "" : value;

      setLoading(true);
      searchPromotions(id, term)
        .then((response) => {
          if (Array.isArray(response.data)) {
            const activePromotions = response.data.filter(
              (promo) => promo.proStatus === 1
            );

            const today = moment();
            const filteredPromotions = activePromotions.filter((promo) => {
              const startDate = moment(promo.startDate);
              const endDate = moment(promo.endDate);

              if (filterStatus === "active") {
                return today.isBetween(startDate, endDate, "day", "[]");
              }
              if (filterStatus === "inactive") {
                return !today.isBetween(startDate, endDate, "day", "[]");
              }
              return true;
            });
            setPromotions(filteredPromotions);
          } else {
            console.error("Expected an array but got", response.data);
          }
        })
        .catch((error) => {
          console.error("Error searching promotions:", error);
          message.error("Failed to search promotions");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = (proID) => {
    const promotionToDelete = promotions.find((promo) => promo.proID === proID);

    if (!promotionToDelete) {
      message.error("Promotion not found.");
      return;
    }

    Modal.confirm({
      title: "Confirm Deletion",
      content: `Are you sure you want to delete promotion "${promotionToDelete.proName}"?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Gửi yêu cầu DELETE với staffID
          await deletePromotion(proID, staffID);
          message.success("Promotion deleted successfully");
          fetchPromotionsData(); // Cập nhật lại danh sách promotions
        } catch (error) {
          console.error(
            "Error deleting promotion:",
            error.response?.data || error.message
          );
          message.error(
            `Failed to delete promotion: ${
              error.response?.data || "Unknown error"
            }`
          );
        }
      },
    });
  };

  const handleLogClick = async (activity = null) => {
    setLogLoading(true); // Bật trạng thái loading
    try {
      const activityParam = activity === "all" ? null : activity;
      const response = await fetchPromotionLogs(activityParam);
      const logsData = response.data || [];

      // Dùng Promise.all để lấy cả username và proName
      const logsWithDetails = await Promise.all(
        logsData.map(async (log) => {
          try {
            // Fetch staff information
            const staffResponse = await fetchStaffDetail(log.staffId);
            const username = staffResponse.data.username || "Unknown";

            // Fetch promotion details
            const promotionResponse = await fetchPromotions();
            const promotion = promotionResponse.data.find(
              (promo) => promo.proID === log.proId
            );
            const proName = promotion ? promotion.proName : "Unknown Promotion";

            return { ...log, username, proName }; // Gắn thêm `proName` vào log
          } catch (error) {
            console.error(
              `Error fetching details for log ID ${log.proLogId}:`,
              error
            );
            return {
              ...log,
              username: "Unknown",
              proName: "Unknown Promotion",
            };
          }
        })
      );

      // Sắp xếp logs theo ID từ cao đến thấp
      logsWithDetails.sort((a, b) => b.proLogId - a.proLogId);

      setLogs(logsWithDetails); // Cập nhật logs với thông tin mới
      setLogModalVisible(true); // Hiển thị modal logs
    } catch (error) {
      console.error("Error fetching promotion logs:", error);
      message.error("Unable to load promotion logs.");
    } finally {
      setLogLoading(false); // Tắt trạng thái loading
    }
  };

  const handleFilterActivity = async (value) => {
    setFilterActivity(value); // Cập nhật trạng thái bộ lọc
    setLogLoading(true);

    try {
      const activityParam = value === "all" ? null : value;

      // Fetch logs từ API
      const logResponse = await fetchPromotionLogs(activityParam);
      const logsData = logResponse.data || [];

      // Fetch danh sách promotions
      const promotionResponse = await fetchPromotions();
      const promotions = promotionResponse.data || [];

      // Dùng Promise.all để fetch thông tin staff và tìm promotion tương ứng
      const logsWithDetails = await Promise.all(
        logsData.map(async (log) => {
          try {
            // Fetch staff thông tin
            const staffResponse = await fetchStaffDetail(log.staffId);
            const username = staffResponse.data.username || "Unknown";

            // Tìm promotion dựa trên proId
            const promotion = promotions.find(
              (promo) => `${promo.proID}` === `${log.proId}` // So sánh kiểu chuỗi
            );
            const proName = promotion ? promotion.proName : "Unknown Promotion";

            return { ...log, username, proName }; // Gắn thêm `proName` vào log
          } catch (error) {
            console.error(
              `Error fetching details for log ID ${log.proLogId}:`,
              error
            );
            return {
              ...log,
              username: "Unknown",
              proName: "Unknown Promotion",
            };
          }
        })
      );
      logsWithDetails.sort((a, b) => b.proLogId - a.proLogId);
      setLogs(logsWithDetails); // Cập nhật logs với thông tin mới
    } catch (error) {
      console.error("Error fetching promotion logs:", error);
      message.error("Unable to load promotion logs.");
    } finally {
      setLogLoading(false); // Tắt trạng thái loading
    }
  };

  const handleDecline = (record) => {
    if (!staffID) {
      message.error("Unable to perform action. Staff ID not found.");
      return;
    }

    if (!checkAdminRole()) {
      message.error("You do not have permission to decline promotions.");
      return;
    }

    Modal.confirm({
      title: "Decline Promotion",
      content: `Are you sure you want to decline promotion "${record.proName}"?`,
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk: async () => {
        try {
          await updatePromotion(record.proID, {
            actionId: 3, // Decline action
            staffID: staffID, // Pass staffID
          });
          message.success(
            `Promotion "${record.proName}" declined successfully.`
          );
          fetchPromotionsData(); // Refresh promotions data
        } catch (error) {
          console.error("Error declining promotion:", error);
          message.error("Failed to decline promotion.");
        }
      },
    });
  };

  const handleApprove = (record) => {
    if (!staffID) {
      message.error("Unable to perform action. Staff ID not found.");
      return;
    }

    if (!checkAdminRole()) {
      message.error("You do not have permission to approve promotions.");
      return;
    }

    Modal.confirm({
      title: "Approve Promotion",
      content: `Are you sure you want to approve promotion "${record.proName}"?`,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await updatePromotion(record.proID, {
            actionId: 2, // Approve action
            staffID: staffID, // Pass staffID
          });
          message.success(
            `Promotion "${record.proName}" approved successfully.`
          );
          fetchPromotionsData(); // Refresh promotions data
        } catch (error) {
          console.error("Error approving promotion:", error);
          message.error("Failed to approve promotion.");
        }
      },
    });
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  const columns = [
    {
      title: "Promotion ID",
      dataIndex: "proID",
      key: "proID",
    },
    {
      title: "Promotion Name",
      dataIndex: "proName",
      key: "proName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => quantity || 0,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        // Nếu approvedBy === null, hiển thị trạng thái Inactive
        const active =
          record.approvedBy !== null &&
          record.quantity > 0 &&
          moment().isBetween(
            moment(record.startDate),
            moment(record.endDate),
            "day",
            "[]"
          );

        return (
          <Tag color={active ? "green" : "red"}>
            {active ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.approvedBy === null) {
          // Chỉ hiện nút `Approve` và `Decline` nếu là Admin
          if (checkAdminRole()) {
            return (
              <Space size="middle">
                <Button
                  type="link"
                  onClick={() => navigate(`/dashboard/detail/${record.proID}`)}
                >
                  <InfoCircleOutlined />
                </Button>
                <Button
                  type="link"
                  style={{ color: "green" }}
                  onClick={() => handleApprove(record)}
                >
                  Approve
                </Button>
                <Button
                  type="link"
                  style={{ color: "red" }}
                  onClick={() => handleDecline(record)}
                >
                  Decline
                </Button>
              </Space>
            );
          }

          // Nếu không phải Admin, hiển thị trạng thái "Chờ duyệt"
          return <Tag color="blue">Pending Approval</Tag>;
        }

        // Khi đã được phê duyệt
        return (
          <Space size="middle">
            <Button
              type="link"
              onClick={() => navigate(`/dashboard/detail/${record.proID}`)}
            >
              <InfoCircleOutlined />
            </Button>
            <Button
              type="link"
              onClick={() => navigate(`/dashboard/edit/${record.proID}`)}
            >
              <EditOutlined style={{ color: "orange" }} />
            </Button>

            {record.approvedBy !== null && (
              <Button
                type="link"
                danger
                onClick={() => handleDelete(record.proID)}
              >
                <DeleteOutlined />
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div className="dashboard-content">
        <div
          className="titlemanagement"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <h1>Promotion Management</h1>
        </div>

        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="primary" onClick={() => navigate("/dashboard/add")}>
              Add Promotion
            </Button>
            <Button
              style={{ backgroundColor: "#1890ff", color: "#fff" }}
              onClick={handleLogClick} // Gắn hàm này
            >
              Log
            </Button>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Select
              defaultValue="all"
              value={filterStatus}
              onChange={handleFilterChange}
              style={{ width: 150 }}
            >
              <Option value="all">All</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

            <Input
              placeholder="Search by promotion ID, name, or code"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="proID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        {/* Modal for Log */}
        <Modal
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Select
                defaultValue="all"
                value={filterActivity}
                onChange={handleFilterActivity}
                style={{ width: "200px" }}
              >
                <Option value="all">All Activities</Option>
                <Option value="create">Created</Option>
                <Option value="approve">Approved</Option>
                <Option value="reject">Rejected</Option>
                <Option value="delete">Deleted</Option>{" "}
                {/* Thêm filter Delete */}
              </Select>
            </div>
          }
          visible={logModalVisible}
          onCancel={() => setLogModalVisible(false)}
          footer={null}
          width={400}
        >
          {logLoading ? (
            <p>Loading...</p>
          ) : logs.length > 0 ? (
            <>
              <Timeline>
                {paginatedLogs.map((log) => (
                  <Timeline.Item
                    key={log.proLogId}
                    color={
                      log.proAction === 3
                        ? "red"
                        : log.proAction === 2
                        ? "green"
                        : log.proAction === 4
                        ? "red" // Màu cho Delete
                        : "blue"
                    }
                  >
                    <p>
                      {log.proAction === 1
                        ? `${log.username || "Unknown"} created promotion "${
                            log.proName || "Unknown Promotion"
                          }"`
                        : log.proAction === 2
                        ? `${log.username || "Unknown"} approved promotion "${
                            log.proName || "Unknown Promotion"
                          }"`
                        : log.proAction === 3
                        ? `${log.username || "Unknown"} rejected promotion "${
                            log.proName || "Unknown Promotion"
                          }"`
                        : log.proAction === 4
                        ? `${log.username || "Unknown"} deleted promotion "${
                            log.proName || "Unknown Promotion"
                          }"`
                        : ""}
                    </p>
                    <small>
                      {log.proLogDate
                        ? moment(log.proLogDate).format("DD/MM/YYYY")
                        : "Unknown Date"}
                    </small>
                  </Timeline.Item>
                ))}
              </Timeline>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={logs.length}
                onChange={handlePageChange}
              />
            </>
          ) : (
            <p>No activity recorded.</p>
          )}
        </Modal>
      </div>

<<<<<<< HEAD
      <Footer></Footer>
=======
      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
>>>>>>> c4db0e6 (Commit frontend)
    </div>
  );
};

export default PromotionManagement;
