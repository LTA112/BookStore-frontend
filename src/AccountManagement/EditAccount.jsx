import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAccountDetail, updateAccount } from '../config';
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { Form, Input, Button, Radio, message, Select, Row, Col } from 'antd';
import { checkAdminRole } from '../jwtConfig.jsx';
import Footer from '../FooterForDashboard/Footer.jsx';

function EditAccount() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Ant Design form instance

    const { TextArea } = Input;
    const goToAccountManagement = () => {
        navigate("/dashboard/accounts");
    };
    useEffect(() => {
        if (!checkAdminRole()) {
            return navigate("/404");
        }
        if (username) {
            fetchAccountDetail(username)
                .then(response => {
                    const formData = response.data;
                    form.setFieldsValue({
                        ...formData,
                        role: formData.role.toString(),
                        sex: formData.sex.toString()
                    });
                })
                .catch(error => {
                    console.error('Error fetching account details:', error);
                    message.error('Failed to fetch account details.');
                });
        }
    }, [username, form]);

    const handleSubmit = async (values) => {
        try {
            const formDataToSend = new FormData();

            // Create the book data object, explicitly setting bookStatus to 1
            const updatedAccountData = {
                ...values,
            };

            formDataToSend.append('account', JSON.stringify(updatedAccountData));

            await updateAccount(username, formDataToSend);
            message.success('Account updated successfully');
            navigate("/dashboard/accounts");
        } catch (error) {
            console.error('Error updating account:', error);
            message.error('Failed to update account.');
        }
    };

    return (
        <>
            <DashboardContainer />
            <div className='dashboard-content' style={{ marginLeft: "250px", marginRight: "100px", marginTop: '1%' }}>
                <h1 style={{ textAlign: 'center' }}>Edit Account</h1>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ maxWidth: '700px', margin: 'auto' }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[{ required: true, message: 'Please enter username' },
                                {
                                    pattern: /^[a-zA-Z0-9]+$/,
                                    message: "Username must be contained letters and numbers!"
                                }
                                ]}
                            >
                                <Input placeholder="Username of account" disabled />
                            </Form.Item>
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[
                                    { required: true, message: 'Please enter first name' },
                                    {
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: "First name must be contained letters"
                                    }
                                ]}
                            >
                                <Input placeholder="First name of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Date of birth"
                                name="dob"
                                rules={[{ required: true, message: 'Please enter the date of birth' },
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.reject(new Error("Please enter the date of birth"))
                                        }
                                        const selectedDate = new Date(value)
                                        const currentDate = new Date()
                                        const minDate = new Date('1900-01-01')

                                        if (selectedDate > currentDate) {
                                            return Promise.reject(new Error("Date cannot be in the future"))
                                        }

                                        if (selectedDate < minDate) {
                                            return Promise.reject(new Error("Date cannot be before 1900-01-01"))
                                        }
                                        return Promise.resolve()
                                    }
                                }
                                ]}
                            >
                                <Input type='date' placeholder="Date of birth of account" />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[
                                    { required: true, message: 'Please enter last name' },
                                    {
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: "Last name must be contained letters"
                                    }
                                ]}
                            >
                                <Input placeholder="Last name of account" />
                            </Form.Item>

                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    {
                                        validator: (_, value) => {
                                            if (!value || !/\s/.test(value)) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(new Error("Email must not contain spaces"))
                                        }
                                    }
                                ]}
                            >
                                <Input type='email' placeholder='Email of account' />
                            </Form.Item>
                            <Form.Item
                                label="Phone"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Please enter phone' },
                                    {
                                        pattern: /^[0-9]{10,15}$/,
                                        message: "Phone number must be 10-15 digits!"
                                    }
                                ]}
                            >
                                <Input placeholder="Phone of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Role"
                                name="role"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (value === 'Please select role') {
                                                return Promise.reject(new Error("Please select role"))
                                            }
                                            return Promise.resolve()
                                        }
                                    }]}
                            >
                                <Select name="role" readOnly>
                                    <Select.Option value="0" >Admin</Select.Option>
                                    <Select.Option value="1" >Customer</Select.Option>
                                    <Select.Option value="2" >Seller staff</Select.Option>
                                    <Select.Option value="3" >Warehouse staff</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Sex"
                                name="sex"
                                rules={[
                                    { required: true, message: 'Please enter the sex' },
                                ]}
                            >
                                <Radio.Group name='sex' readOnly>
                                    <Radio value="0"  > Female </Radio>
                                    <Radio value="1" > Male </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: 'Please enter the address' }]}
                            >
                                <TextArea rows={4} placeholder="Address of account" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                <Button
                                    htmlType="button"
                                    onClick={goToAccountManagement}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Cancel
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Footer></Footer>
        </>
    );
}

export default EditAccount;
