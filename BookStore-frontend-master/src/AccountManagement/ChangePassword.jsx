import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { changePassword, fetchAccountDetail, updateAccount } from '../config';
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { Form, Input, Button, Radio, message, Select } from 'antd';
import { checkSellerStaffRole, checkWarehouseStaffRole, decodeJWT, checkAdminRole } from '../jwtConfig.jsx';
import Password from 'antd/es/input/Password.js';
import Footer from '../FooterForDashboard/Footer.jsx';

function ChangePassword() {

    const navigate = useNavigate();
    const [form] = Form.useForm(); // Ant Design form instance

    const goToProfile = () => {
        navigate("/dashboard/profile");
    };
    if (!checkAdminRole() && !checkSellerStaffRole() && !checkWarehouseStaffRole()) {
        return navigate("/404");
    }
    const handleSubmit = async (values) => {
        try {
            const formDataToSend = new FormData();
            let username = decodeJWT().sub
            let currentPassword = values.currentPassword
            let newPassword = values.newPassword
            if (values.newPassword === values.confirmPassword) {
                // Create the book data object, explicitly setting bookStatus to 1
                const changePasswordData = {
                    username, currentPassword, newPassword
                };

                formDataToSend.append('password-request', JSON.stringify(changePasswordData));

                await changePassword(formDataToSend);
                message.success('Change password successfully');
                navigate("/dashboard/profile");
            } else {
                message.error('New password and confirm password are not match!');
            }
        } catch (error) {
            console.error('Error change password:', error);
            message.error('Failed to change password.');
        }
    };

    return (
        <>
            <div className="dashboard-content" style={{ marginLeft: "250px", marginRight: "100px", marginTop: '1%' }} >
                <DashboardContainer />
                <h1 style={{ textAlign: 'center' }}> Change Password</h1>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ maxWidth: '700px', margin: 'auto' }}
                >
                    <Form.Item
                        label="Current password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Please enter current password' }]}
                    >
                        <Input.Password placeholder="Current password" />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Please enter new password' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "New password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                            }
                        ]}
                    >
                        <Input.Password placeholder="New password of account" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm password"
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Please enter confirm password' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Confirm password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces.",
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || value === form.getFieldValue('newPassword')) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(
                                        new Error('Confirm password does not match to new password!')
                                    )
                                }
                            }
                        ]}
                    >
                        <Input.Password placeholder="Confirm password of account" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                        <Button
                            htmlType="button"
                            onClick={goToProfile}
                            style={{ marginLeft: '10px' }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <Footer></Footer>
        </>
    );
}

export default ChangePassword;
