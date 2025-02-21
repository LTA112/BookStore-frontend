import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { addSupplier, fetchSuppliers } from "../config"; // Thêm API fetchSuppliers
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";

const AddSupplier = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]); // Trạng thái lưu danh sách nhà cung cấp

    useEffect(() => {
        // Fetch danh sách nhà cung cấp khi component mount
        const loadSuppliers = async () => {
            try {
                const response = await fetchSuppliers(); // Gọi API lấy danh sách nhà cung cấp
                setSuppliers(response.data || []); // Lưu danh sách vào state
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                message.error("Failed to fetch suppliers");
            }
        };

        loadSuppliers();

        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
    }, [navigate]);

    const handleSubmit = async (values) => {
        try {
            // Kiểm tra trùng lặp `supplierName`
            const isDuplicate = suppliers.some(
                (supplier) =>
                    supplier.supName === values.supplierName
            );

            if (isDuplicate) {
                message.error("A supplier with the same name already exists.");
                return; // Ngừng thực hiện nếu tên nhà cung cấp bị trùng
            }

            const supplierData = {
                supName: values.supplierName,
                supEmail: values.supplierEmail,
                supPhone: values.supplierPhone,
                supAddress: values.supplierAddress,
                supStatus: 1,
            };

            console.log("Supplier data to be sent:", supplierData);

            await addSupplier(supplierData); // Gọi API thêm nhà cung cấp
            message.success("Supplier added successfully");
            navigate("/dashboard/suppliers");
        } catch (error) {
            console.error("Error adding supplier:", error);
            message.error("Failed to add supplier");
        }
    };

    const handleReset = () => {
        form.resetFields();
    };

    return (
        <div className="main-container">
            <div className="dashboard-container">
                <DashboardContainer />
            </div>

            <div className="dashboard-content">
                <div className="titlemanagement">
                    <div>Add Supplier</div>
                </div>

                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    style={{ maxWidth: "600px", margin: "auto" }}
                >
                    <Form.Item
                        label="Supplier Name"
                        name="supplierName"
                        rules={[

                            {
                                validator: (_, value) => {
                                    if (!value || value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Supplier name cannot be empty or only spaces")
                                        );
                                    }
                                    if (!/^[A-Za-z0-9\s]+$/.test(value)) {
                                        return Promise.reject(
                                            new Error("Supplier name cannot contain special characters")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter supplier name" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Email"
                        name="supplierEmail"
                        rules={[
                            { required: true, message: 'Supplier email cannot be empty or only spaces' },
                            { type: "email", message: "Please enter a valid email address" },

                        ]}
                    >
                        <Input placeholder="Enter supplier email" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Phone"
                        name="supplierPhone"
                        rules={[

                            {
                                validator: (_, value) => {
                                    if (!value || value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Phone number cannot be empty or only spaces")
                                        );
                                    }
                                    if (!/^[0-9]{10}$/.test(value)) {
                                        return Promise.reject(
                                            new Error("Phone number must be exactly 10 digits")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter supplier phone" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Address"
                        name="supplierAddress"
                        rules={[

                            {
                                validator: (_, value) => {
                                    if (!value || value.trim() === "") {
                                        return Promise.reject(
                                            new Error("Supplier address cannot be empty or only spaces")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter supplier address" />
                    </Form.Item>


                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={handleReset} style={{ marginLeft: "20px" }}>
                            Reset
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

export default AddSupplier;
