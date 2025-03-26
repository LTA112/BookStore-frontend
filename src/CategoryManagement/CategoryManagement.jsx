import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Space, Table, Button, Input, message, Modal } from "antd";
import { fetchCategories, searchCategories, deleteCategory } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";
import Footer from "../FooterForDashboard/Footer.jsx";

const { Search } = Input;

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allCategories, setAllCategories] = useState([]); // Tất cả các danh mục
  const [filteredCategories, setFilteredCategories] = useState([]); // Danh mục được lọc để hiển thị trong bảng
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]); // Dữ liệu cho TreeSelect
  const [selectedCategory, setSelectedCategory] = useState(null); // Danh mục được chọn
  const [expandedKeys, setExpandedKeys] = useState([]); // Các mục mở rộng trong TreeSelect

  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    setLoading(true);
    setSelectedCategory("All");
    fetchCategories()
      .then((response) => {
        if (Array.isArray(response.data)) {
          const activeCategories = response.data.filter(
            (category) => category.catStatus === 1
          );
          setAllCategories(activeCategories);
          setFilteredCategories(activeCategories); // Ban đầu hiển thị tất cả các danh mục
        } else {
          console.error("Expected an array but got", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        message.error("Failed to fetch categories");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const handleSearch = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredCategories(allCategories);
      return;
    }

    const isNumber = !isNaN(value);
    const id = isNumber ? parseInt(value, 10) : null;
    const name = isNumber ? "" : value;

    setLoading(true);
    searchCategories(id, name)
      .then((response) => {
        if (response.data) {
          const activeCategories = response.data.filter(
            (category) => category.catStatus === 1
          );
          setFilteredCategories(activeCategories);
        } else {
          setFilteredCategories([]);
        }
      })
      .catch((error) => {
        console.error("Error searching categories:", error);
        message.error("Failed to search categories");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEditCategory = (category) => {
    navigate(`/dashboard/category/${category.catID}`);
  };

  const handleDelete = (catID) => {
    const categoryToDelete = allCategories.find(
      (category) => category.catID === catID
    );
    Modal.confirm({
      title: "Confirm Deletion",
      content: `Are you sure you want to delete category "${categoryToDelete.catName}"?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteCategory(catID);
          message.success("Category delete successfully");

          setLoading(true);
          fetchCategories()
            .then((response) => {
              if (Array.isArray(response.data)) {
                const activeCategories = response.data.filter(
                  (category) => category.catStatus === 1
                );
                setAllCategories(activeCategories);
                setFilteredCategories(activeCategories);
              } else {
                console.error("Expected an array but got", response.data);
              }
            })
            .catch((error) => {
              console.error("Error fetching categories:", error);
              message.error("Failed to fetch categories");
            })
            .finally(() => {
              setLoading(false);
            });
        } catch (error) {
          console.error("Error soft deleting category:", error);
          message.error("Failed to soft delete category");
        }
      },
    });
  };

  const goToAddCategory = () => {
    navigate("/dashboard/category/add");
  };

  const goToCategoryDetail = (catID) => {
    navigate(`/dashboard/category/detail/${catID}`);
  };

  const columns = [
    {
      title: "Category ID",
      dataIndex: "catID",
      key: "catID",
    },
    {
      title: "Category Name",
      dataIndex: "catName",
      key: "catName",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => goToCategoryDetail(record.catID)}>
            <InfoCircleOutlined />
          </Button>
          <Button type="link" onClick={() => handleEditCategory(record)}>
            <EditOutlined style={{ color: "orange" }} />
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.catID)}>
            <DeleteOutlined />
          </Button>
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
        <div className="titlemanagement">
          <h1>Category Management</h1>
        </div>

        <div
          className="action-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Button type="primary" onClick={goToAddCategory}>
            Add Category
          </Button>

          <Search
            placeholder="Search by category ID or name"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)} // Gọi `handleSearch` khi người dùng nhập
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="catID"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Footer></Footer>
    </div>
  );
};

export default CategoryManagement;
