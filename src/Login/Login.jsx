import React from 'react';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Đường dẫn tới file CSS
import { login, forgotPassword } from '../config.js';
import { decodeJWT } from '../jwtConfig.jsx';

const Login = () => {
    const navigate = useNavigate();
    const onFinish = async (values) => {
        try {
            const loginData = {
                username: values.username,
                password: values.password
            }
            const formDataToSend = new FormData()
            formDataToSend.append('login', JSON.stringify(loginData))
            const response = await login(formDataToSend)
            console.log(response)

            if (!response.data) {
                message.error('Username or password is incorrect! Please enter again')
            } else if (response.data.accountDTO) {
                localStorage.setItem("jwtToken", response.data.token)
                message.success('Login successfully')
                if (decodeJWT().status === 2 || decodeJWT().status === 4) {
                    const verifyAccountData = {
                        username: response.data.accountDTO.username,
                        email: response.data.accountDTO.email
                    }
                    const formVerifyAccountDataToSend = new FormData()
                    formVerifyAccountDataToSend.append('forgot-password', JSON.stringify(verifyAccountData))
                    navigate("/account/verify")
                    await forgotPassword(formVerifyAccountDataToSend)

                } else {
                    if (response.data.accountDTO.role === 0 || response.data.accountDTO.role === 2 || response.data.accountDTO.role === 3) {
                        navigate("/dashboard/income-statistic");
                    } else {
                        navigate("/");
                    }
                }

            }
        } catch (error) {
            console.log(error)
            message.error('Login failed')
        }

    };
    return (
        <div className="login-container">
            <Form
                name="basic"
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                autoComplete="off"
            >
                {/* Logo được thêm ở đây */}
                <img
                    src="/logo-capybook.png"
                    alt="Capybook Logo"
                    className="login-logo"
                />
                <h1>LOGIN</h1>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your username!',
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}> <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item></Col>
                    <Col span={24} style={{ marginLeft: '120px', marginBottom: '10px' }}> <Link to="/password/forgot">
                        Forgot password
                    </Link></Col>
                    <Col span={24}>
                        <Form.Item style={{ textAlign: 'center' }}>
                            <Button type="primary" htmlType="submit">
                                Login
                            </Button>
                            <Button
                                type="default"
                                style={{ marginLeft: '10px' }}
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </Button>
                        </Form.Item></Col>

                </Row>

            </Form>
        </div>
    );
};

export default Login;
