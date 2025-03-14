import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { fetchSupplierById, updateSupplier } from '../config'; // Import API functions
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
const EditSupplier = () => {
    const { supID } = useParams(); // Get supID from URL
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Ant Design form instance
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
        // Fetch supplier details when component loads
        if (supID) {
            fetchSupplierById(supID)
                .then((response) => {
                    const supplierData = response.data;
                    form.setFieldsValue(supplierData); // Set form fields with fetched data
                })
                .catch((error) => {
                    console.error('Error fetching supplier details:', error);
                    message.error('Failed to fetch supplier details.');
                });
        }
    }, [supID, form]);

    const handleSubmit = async (values) => {
        setLoading(true); // Set loading state while updating
        try {

            await updateSupplier(supID, values);
            message.success('Supplier updated successfully');
            navigate("/dashboard/suppliers"); // Navigate back to supplier management after update
        } catch (error) {
            console.error('Error updating supplier:', error);
            message.error('Failed to update supplier.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="main-container">
            <DashboardContainer />
            <div className="dashboard-content">
                <div className="titlemanagement">
                    <h1>Edit Supplier</h1>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ maxWidth: '800px', margin: 'auto' }}
                >
                    <Form.Item
                        label="Supplier Name"
                        name="supName"
                        rules={[
                            { required: true, message: "Please enter the supplier name" },
                            {
                                pattern: /^[A-Za-z0-9\s]+$/,
                                message: "Supplier name cannot contain special characters",
                            },
                        ]}
                    >
                        <Input placeholder="Supplier Name" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Phone"
                        name="supPhone"
                        rules={[{ required: true, message: 'Please enter the supplier phone' }]}
                    >
                        <Input placeholder="Supplier Phone" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Email"
                        name="supEmail"
                        rules={[
                            { required: true, message: 'Please enter the supplier email' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input placeholder="Supplier Email" />
                    </Form.Item>

                    <Form.Item
                        label="Supplier Address"
                        name="supAddress"
                        rules={[{ required: true, message: 'Please enter the supplier address' }]}
                    >
                        <Input placeholder="Supplier Address" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Save
                        </Button>
                        <Button
                            type="default"
                            onClick={() => navigate("/dashboard/suppliers")} // Handle cancel
                            style={{ marginLeft: '20px' }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="copyright">
                <div>© {new Date().getFullYear()}</div>
                <div>Cabybook Management System</div>
                <div>All Rights Reserved</div>
            </div>
        </div>
    );
};

export default EditSupplier;
