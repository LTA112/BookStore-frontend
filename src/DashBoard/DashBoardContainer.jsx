import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  BookOutlined,
  UserOutlined,
  TagsOutlined,
  BellOutlined,
  TruckOutlined,
  NotificationOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardContainer.css"; // Import CSS for the component
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
  checkWarehouseStaffRole,
} from "../jwtConfig";
import { logout } from "../config";

const DashboardContainer = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Sử dụng useLocation để lấy URL hiện tại
  const [collapsed, setCollapsed] = useState(true); // Trạng thái cho việc thu gọn
  const [current, setCurrent] = useState("1");
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    if (
      !checkWarehouseStaffRole() &&
      !checkAdminRole() &&
      !checkSellerStaffRole()
    ) {
      return navigate("/404");
    }
    // Cập nhật mục được chọn dựa trên URL
    const path = location.pathname;
    console.log(path);
    if (path.includes("income-statistic")) {
      setCurrent("1");
    } else if (path.includes("account")) {
      setCurrent("2");
    } else if (path.includes("staff")) {
      setCurrent("3");
    } else if (path.includes("book")) {
      setCurrent("4");
    } else if (path.includes("order")) {
      setCurrent("5");
    } else if (path.includes("promotion")) {
      setCurrent("6");
    } else if (path.includes("supplier")) {
      setCurrent("7");
    } else if (path.includes("category")) {
      setCurrent("8");
    } else if (path.includes("inventory")) {
      setCurrent("9");
    } else if (path.includes("notification")) {
      setCurrent("10");
    } else {
      setCurrent("1");
    }
  }, [location]); // Mỗi khi URL thay đổi, useEffect sẽ chạy

  const onClick = (e) => {
    setCurrent(e.key);
    switch (e.key) {
      case "1": // Điều hướng tới trang Income Statistic
        navigate("/dashboard/income-statistic");
        break;
      case "2":
        navigate("/dashboard/accounts");
        break;
      case "3":
        navigate("/dashboard/staffs");
        break;
      case "4":
        navigate("/dashboard/books");
        break;
      case "5":
        navigate("/dashboard/orders");
        break;
      case "6":
        navigate("/dashboard/promotions");
        break;
      case "7":
        navigate("/dashboard/suppliers");
        break;
      case "8":
        navigate("/dashboard/category");
        break;
      case "9":
        navigate("/dashboard/inventory");
        break;
      case "10":
        navigate("/dashboard/notifications/");
        break;

      default:
        break;
    }
  };

  let isAccountVisible,
    isBookVisible,
    isOrderVisible,
    isPromotionVisible,
    isSupplierVisible,
    isCategoryVisible,
    isInventoryVisible,
    isNotificationVisible,
    isStaffVisible = false;
  let scope = decodeJWT().scope;
  if (scope.includes("ADMIN")) {
    isAccountVisible =
      isBookVisible =
      isOrderVisible =
      isPromotionVisible =
      isSupplierVisible =
      isCategoryVisible =
      isInventoryVisible =
      isNotificationVisible =
      isStaffVisible =
        true;
  }
  if (scope.includes("SELLER_STAFF")) {
    isPromotionVisible =
      isOrderVisible =
      isCategoryVisible =
      isNotificationVisible =
        true;
  }
  if (scope.includes("WAREHOUSE_STAFF")) {
    isSupplierVisible = true;
    isInventoryVisible = true;
    isBookVisible = true;
    isNotificationVisible = true;
  }

  const items = [
    {
      key: "1",
      label: "Dashboard",
      icon: <AppstoreOutlined />, // Thay đổi icon nếu cần
    },
    isAccountVisible && {
      key: "2",
      label: "Account Management",
      icon: <UserOutlined />,
    },
    isStaffVisible && {
      key: "3",
      label: "Staff Management",
      icon: <UserOutlined />,
    },
    isBookVisible && {
      key: "4",
      label: "Book Management",
      icon: <BookOutlined />,
    },
    isOrderVisible && {
      key: "5",
      label: "Order Management",
      icon: <TagsOutlined />,
    },
    isPromotionVisible && {
      key: "6",
      label: "Promotion Management",
      icon: <BellOutlined />,
    },
    isSupplierVisible && {
      key: "7",
      label: "Supplier Management",
      icon: <TruckOutlined />,
    },
    isCategoryVisible && {
      key: "8",
      label: "Category Management",
      icon: <BarsOutlined />,
    },
    isInventoryVisible && {
      key: "9",
      label: "Inventory Management",
      icon: <AppstoreOutlined />,
    },
    isNotificationVisible && {
      key: "10",
      label: "Notification Management",
      icon: <NotificationOutlined />,
    },
    // Mục mới: Income Statistic
  ].filter(Boolean);

  return (
    <div
      className="dashboard-container"
      onMouseEnter={() => setCollapsed(false)} // Mở rộng menu khi di chuột vào
      onMouseLeave={() => setCollapsed(true)} // Thu gọn menu khi di chuột ra
      style={{
        width: collapsed ? "80px" : "250px",
        transition: "width 0.3s ease",
      }}
    >
      <div
        className="logo-container"
        onClick={() => navigate("/")} // Điều hướng về trang chủ "/"
        style={{ cursor: "pointer" }} // Con trỏ chỉ định có thể bấm vào
      >
        <img
          src="/logo-bookstore2.png"
          alt="Bookstore Logo"
          className="logo-image"
        />
      </div>
      <div
        className="username-container"
        style={{
          textAlign: "center",
          margin: "10px 0",
          color: "#333",
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard/profile")}
      >
        <strong>{decodeJWT().sub}</strong> {/* Hiển thị tên người dùng */}
      </div>
      <Menu
        theme="light"
        onClick={onClick}
        inlineCollapsed={collapsed} // Kiểm soát việc mở rộng hay thu gọn menu
        style={{
          width: "100%",
        }}
        selectedKeys={[current]} // Đặt mục được chọn theo giá trị của state "current"
        mode="inline"
        items={items}
      />
      <div
        className="back-logo-container"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onClick={handleLogout}
      >
        <img
          src="/back_icon.png"
          alt="Back Logo"
          style={{ height: "50px", cursor: "pointer" }}
        />{" "}
        {/* Thay đổi kích thước tùy ý */}
      </div>
    </div>
  );
};

export default DashboardContainer;
