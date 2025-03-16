import { useNavigate } from 'react-router-dom';
import { addAccount } from '../config.js';
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import {
    Button,
    Col,
    Form,
    Input,
    Radio,
    Row,
    Select,
    message
} from 'antd';
import { checkAdminRole } from '../jwtConfig.jsx';
import Footer from '../FooterForDashboard/Footer.jsx';

const AddAccount = () => {
    const [form] = Form.useForm();  // Sử dụng Ant Design Form API
    const navigate = useNavigate();
    if (!checkAdminRole()) {
        navigate("/404");
    }
    const handleSubmit = async (values) => {
        try {
            console.log(values)
            const accountData = {
                username: values.username,
                firstName: values.firstName,
                lastName: values.lastName,
                dob: values.dob,
                email: values.email,
                phone: values.phone,
                role: values.role,
                address: values.address,
                sex: values.sex,
                // password: values.password
            };

            const formDataToSend = new FormData();
            formDataToSend.append('account', JSON.stringify(accountData)); // Thêm trường 'account'

            // Gửi yêu cầu POST với multipart/form-data
            await addAccount(formDataToSend)
            message.success('Account added successfully');
            navigate("/dashboard/accounts");
        } catch (error) {
            if (error.response) {
                console.error('Server responded with status code:', error.response.status);
                console.error('Error data:', error.response.data);
            } else {
                console.error('Error:', error.message);
            }
            message.error('Failed to add account');
        }
    }


    const handleReset = () => {
        form.resetFields();
    };

    const { TextArea } = Input;
    const { Option } = Select;

    return (
        <>
            <DashboardContainer />
            <div className="dashboard-content" style={{ marginLeft: "250px", marginRight: "100px", marginTop: '1%' }}>
                <h1 style={{ textAlign: 'center' }}>Add Account</h1>
                <Form
                    initialValues={{
                        role: 'Please select role',  // Giá trị mặc định cho trường role
                        sex: '0',   // Giá trị mặc định cho trường sex
                    }}
                    form={form} // Kết nối với Form API của Ant Design
                    layout="vertical"
                    onFinish={handleSubmit} // Thay đổi onSubmit thành onFinish để Ant Design quản lý submit
                    style={{ maxWidth: '700px', margin: 'auto' }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter username",
                                    },
                                    {
                                        pattern: /^[a-zA-Z0-9]+$/,
                                        message: "Username must be contained letters and numbers!"
                                    }
                                ]}
                            >
                                <Input placeholder="Username of account" />
                            </Form.Item>
                            <Form.Item
                                label="First Name"
                                name="firstName"
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
                                <Input placeholder="First name of account" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Date Of Birth"
                                name="dob"
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
                                <Input type="date" placeholder="Date of birth" />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
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
                                <Input placeholder="Last name of account" />
                            </Form.Item>

                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
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
                                <Input placeholder="Email of account" />
                            </Form.Item>

                            <Form.Item
                                label="Phone"
                                name="phone"
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
                                <Input type="tel" placeholder="Phone number of account" />
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
                                    }
                                ]}
                            >
                                <Select>
                                    <Option value="0">Admin</Option>
                                    <Option value="1">Customer</Option>
                                    <Option value="2">Seller staff</Option>
                                    <Option value="3">Warehouse staff</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Sex"
                                name="sex"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value) {
                                                return Promise.reject(new Error("Please select sex"))
                                            }
                                            return Promise.resolve()
                                        }
                                    }
                                ]}
                            >
                                <Radio.Group>
                                    <Radio value="0"> Female </Radio>
                                    <Radio value="1"> Male </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>

                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter address",
                                    },
                                ]}
                            >
                                <TextArea rows={4} placeholder="Address of account" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Button type="primary" htmlType="submit">Submit</Button>
                                <Button type="default" onClick={handleReset} style={{ marginLeft: 10 }}>Reset</Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

            </div>
            <Footer></Footer>
        </>
    );
}

export default AddAccount;
