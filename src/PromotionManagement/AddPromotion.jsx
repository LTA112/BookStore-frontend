import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, DatePicker, InputNumber, message } from "antd";
import { addPromotion, fetchPromotions, fetchStaffByUsername } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import moment from "moment";
import {
  decodeJWT,
  checkAdminRole,
  checkSellerStaffRole,
} from "../jwtConfig.jsx";
const { RangePicker } = DatePicker;

const AddPromotion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [existingPromotions, setExistingPromotions] = useState([]);
  const [staffID, setStaffID] = useState(null);
  const username = decodeJWT(localStorage.getItem("jwtToken")).sub;

  // Fetch promotions on component mount
  useEffect(() => {
    if (!checkSellerStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    fetchPromotions()
      .then((response) => {
        const activePromotions = response.data.filter(
          (promo) => promo.proStatus === 1
        );
        setExistingPromotions(activePromotions);
      })
      .catch((error) => {
        console.error("Error fetching promotions:", error);
        message.error("Failed to fetch existing promotions.");
      });

    // Fetch staff ID by username
    fetchStaffByUsername(username)
      .then((response) => {
        setStaffID(response.data.staffID); // Lấy StaffID từ API
      })
      .catch((error) => {
        console.error("Error fetching staff:", error);
        message.error("Failed to fetch staff information.");
      });
  }, [username]);

  const handleSubmit = async (values) => {
    // Trim các giá trị input
    const trimmedValues = {
      promotionName: values.promotionName?.trim(),
      promotionCode: values.promotionCode?.trim(),
      discountPercentage: values.discountPercentage,
      quantity: values.quantity,
      dateRange: values.dateRange,
    };

    // Validate các trường input sau khi trim
    if (!trimmedValues.promotionName) {
      message.error("Promotion name cannot be empty or only spaces.");
      return;
    }

    if (!trimmedValues.promotionCode) {
      message.error("Promotion code cannot be empty or only spaces.");
      return;
    }

    // Kiểm tra StaffID
    if (!staffID) {
      message.error("Staff information not found. Please try again.");
      return;
    }

    try {
      const [startDate, endDate] = trimmedValues.dateRange;

      // Validate: Ngày bắt đầu phải nhỏ hơn ngày kết thúc
      if (startDate.isAfter(endDate)) {
        message.error("Start date cannot be after end date.");
        return;
      }

      // Validate: Tên và mã promotion không được trùng lặp
      const isNameDuplicate = existingPromotions.some(
        (promo) =>
          promo.proName.toLowerCase() ===
          trimmedValues.promotionName.toLowerCase()
      );
      const isCodeDuplicate = existingPromotions.some(
        (promo) =>
          promo.proCode.toLowerCase() ===
          trimmedValues.promotionCode.toLowerCase()
      );

      if (isNameDuplicate) {
        message.error(
          "Promotion name already exists. Please use a different name."
        );
        return;
      }

      if (isCodeDuplicate) {
        message.error(
          "Promotion code already exists. Please use a different code."
        );
        return;
      }

      // Validate: Phần trăm giảm giá phải nằm trong khoảng 1-100%
      if (
        trimmedValues.discountPercentage < 1 ||
        trimmedValues.discountPercentage > 100
      ) {
        message.error("Discount percentage must be between 1% and 100%.");
        return;
      }

      // Validate: Số lượng phải lớn hơn 0
      if (trimmedValues.quantity <= 0) {
        message.error("Quantity must be greater than 0.");
        return;
      }

      // Tạo dữ liệu gửi đi
      const promotionData = {
        proName: trimmedValues.promotionName,
        proCode: trimmedValues.promotionCode,
        quantity: trimmedValues.quantity,
        discount: trimmedValues.discountPercentage,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        proStatus: 1,
        createdBy: staffID, // Gắn StaffID vào dữ liệu
      };

      console.log("Sending promotion data:", promotionData);

      // Gửi request
      await addPromotion(promotionData, username);
      message.success("Promotion added successfully");
      navigate("/dashboard/promotions");
    } catch (error) {
      console.error("Error adding promotion:", error);
      message.error("Failed to add promotion");
    }
  };

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const isEmpty = !values.promotionName || values.promotionName.trim() === "";
    setIsFormEmpty(isEmpty);
  };

  const handleResetOrBack = () => {
    if (isFormEmpty) {
      navigate("/dashboard/promotions");
    } else {
      form.resetFields();
      setIsFormEmpty(true);
    }
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  return (
    <div className="main-container">
      <div className="dashboard-container">
        <DashboardContainer />
      </div>

      <div className="dashboard-content">
        <div className="titlemanagement">
          <div>Add Promotion</div>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          onFieldsChange={handleFormChange}
          style={{ maxWidth: "600px", margin: "auto" }}
        >
          <Form.Item
            label="Promotion Name"
            name="promotionName"
            rules={[
              { required: true, message: "Please enter the promotion name" },
              {
                pattern: /^\p{L}[\p{L}\p{N}\s-]*$/u,
                message:
                  "Promotion Name can only contain letters, numbers, Vietnamese characters, spaces, and certain special characters (.,')",
              },
              {
                max: 30,
                message: "Promotion Name cannot exceed 30 characters",
              },
            ]}
          >
            <Input placeholder="Enter promotion name" />
          </Form.Item>

          <Form.Item
            label="Promotion Code"
            name="promotionCode"
            rules={[
              { required: true, message: "Please enter the promotion code" },
              {
                pattern: /^[a-zA-Z0-9]*$/,
                message: "Promotion Code can only contain letters and numbers",
              },
            ]}
          >
            <Input
              placeholder="Enter promotion code"
              onChange={(e) => {
                const sanitizedValue = e.target.value
                  .replace(/\s+/g, "")
                  .toUpperCase();
                form.setFieldsValue({
                  promotionCode: sanitizedValue,
                });
              }}
            />
          </Form.Item>
          <Form.Item
            label="Discount %"
            name="discountPercentage"
            rules={[
              {
                required: true,
                message: "Please enter the discount percentage",
              },
              {
                type: "number",
                min: 1,
                max: 50,
                message: "Discount percentage must be between 1 and 50%",
              },
            ]}
          >
            <InputNumber
              min={1}
              max={50}
              placeholder="Enter discount percentage"
              style={{ width: "100%" }} // Đặt chiều rộng là 100% để đồng nhất với các input khác
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Please enter the quantity" }]}
          >
            <InputNumber
              min={1}
              placeholder="Enter quantity"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Date Range"
            name="dateRange"
            rules={[
              { required: true, message: "Please select the date range" },
            ]}
          >
            <RangePicker
              placeholder={["Start date", "End date"]}
              style={{ width: "100%" }}
              disabledDate={disabledDate}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              htmlType="button"
              onClick={handleResetOrBack}
              style={{ marginLeft: "20px" }}
            >
              {isFormEmpty ? "Back" : "Reset"}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="copyright">
        <div>© {new Date().getFullYear()}</div>
        <div>Capybook Management System</div>
        <div>All Rights Reserved</div>
      </div>
    </div>
  );
};

export default AddPromotion;
