import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStaffDetail, updateStaff } from '../config';
import DashboardContainer from '../DashBoard/DashBoardContainer';
import {
    Button,
    Col,
    Form,
    Input,
    message,
    Radio,
    Row,
    Select
} from 'antd';
import Footer from '../FooterForDashboard/Footer';
const { TextArea } = Input;
const EditStaff = () => {
    const { staffID } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const goToStaffManagement = () => {
        navigate("/dashboard/staffs");
    };

    const handleSubmit = async (values) => {
        try {
            const formDataToSend = new FormData();

            // Create the book data object, explicitly setting bookStatus to 1
            const updatedStaffData = {
                ...values,
            };

            formDataToSend.append('staff', JSON.stringify(updatedStaffData));

            await updateStaff(formDataToSend);
            message.success('Staff updated successfully');
            navigate("/dashboard/staffs");
        } catch (error) {
            console.error('Error updating account:', error);
            message.error('Failed to update account.');
        }
    };

    useEffect(() => {
        fetchStaffDetail(staffID)
            .then(response => {
                form.setFieldsValue({
                    ...response.data,
                    role: response.data.role.toString(),
                    sex: response.data.sex.toString()
                })
                console.log("data", response.data)
            })
            .catch(error => {
                console.error('Error fetching staff details:', error);
            });
    }, [staffID, form]);
    return (
        <>
            <div className="dashboard-content" style={{ marginLeft: "250px", marginRight: "100px" }}>
                <DashboardContainer />
                <h1 style={{ textAlign: 'center' }}>Edit Staff</h1>
                {/* <DashboardContainer /> */}
                <Form
                    layout="vertical"
                    style={{ maxWidth: '700px', margin: 'auto' }}
                    form={form}
                    onFinish={handleSubmit}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label="Staff ID" name="staffID">
                                <Input
                                    placeholder="Staff ID of account " readOnly disabled />
                            </Form.Item>
                            <Form.Item label="Fist Name" name="firstName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter First Name",
                                    },
                                    {
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: "First name must be contained letters"
                                    }
                                ]}
                            >
                                <Input type="text"
                                    placeholder="First name of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Username" name="username">
                                <Input
                                    placeholder="Username of account " readOnly disabled />
                            </Form.Item>

                            <Form.Item label="Last Name" name="lastName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter Last Name",
                                    },
                                    {
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: "Last name must be contained letters"
                                    }
                                ]}
                            >
                                <Input type="text"
                                    placeholder="Last name of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Date Of Birth" name="dob"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value) {
                                                return Promise.reject(new Error("Please enter Date of birth"))
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
                                <Input type='date'
                                    placeholder="Date of birth" />
                            </Form.Item>
                            <Form.Item label="Phone" name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter phone",
                                    },
                                    {
                                        pattern: /^[0-9]{10,15}$/,
                                        message: "Phone number must be 10-15 digits!"
                                    }
                                ]}
                            >
                                <Input type='tel'
                                    placeholder="Phone number of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email" name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter Email",
                                        type: 'email',
                                    },
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
                                <Input type='email'
                                    placeholder="Email of staff" />
                            </Form.Item>

                            <Form.Item label="Sex" name="sex"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select sex",
                                    },
                                ]}
                            >
                                <Radio.Group name='sex'>
                                    <Radio value="0" > Female </Radio>
                                    <Radio value="1" > Male </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Role" name="role" rules={[
                                {
                                    validator: (_, value) => {
                                        if (value === 'Please select role') {
                                            return Promise.reject(new Error("Please select role"))
                                        }
                                        return Promise.resolve()
                                    }
                                }
                            ]}>
                                <Select name="role">
                                    <Select.Option value="0" >Admin</Select.Option>
                                    <Select.Option value="2" >Seller staff</Select.Option>
                                    <Select.Option value="3" >Warehouse staff</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Address" name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter address",
                                    },
                                ]}>
                                <TextArea rows={4} type="text"
                                    placeholder="Address of staff" />
                            </Form.Item></Col>
                        <Col span={24}>
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Button type="primary" htmlType="submit">
                                    Save
                                </Button>
                                <Button type='default' onClick={goToStaffManagement} style={{ marginLeft: 10 }}>Cancel</Button>
                            </Form.Item></Col>
                    </Row>

                </Form >
            </div>
            <Footer></Footer>
        </>
    );
}

export default EditStaff;
