import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAccountDetail } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import Footer from "../FooterForDashboard/Footer.jsx";

import { Button, Col, Form, Input, Radio, Row, Select } from "antd";
const { TextArea } = Input;
const AccountDetail = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const goToAccountManagement = () => {
    navigate("/dashboard/accounts");
  };

  const [formData, setFormData] = useState({
    //Khai báo bằng useState để lưu trữ thông tin người dùng.
    username: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    sex: "",
    staffDTOCollection: "",
  });

  useEffect(() => {
    // là một hook trong react để thực hiện các tác vụ phụ: gọi API, update DOM hoặc thiết lập WebSocket
    fetchAccountDetail(username) // lấy thông tin tài khoản từ server
      .then((response) => {
        setFormData(response.data); //dữ liệu sẽ được gán vào để trả về khi dl trả về thành công
        console.log("data", response.data); // in ra dữ liệu
      })
      .catch((error) => {
        console.error("Error fetching book details:", error);
      });
  }, [username]);
  return (
    <>
      {/* <DashboardContainer /> */}
      <DashboardContainer />
      <div
        className="dashboard-content"
        style={{ marginLeft: "250px", marginRight: "100px", marginTop: "1%" }}
      >
        <h1 style={{ textAlign: "center" }}>View Account Detail</h1>
        <Form layout="vertical" style={{ maxWidth: "700px", margin: "auto" }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Username">
                <Input
                  name="username"
                  value={formData.username || ""}
                  placeholder="Username of account "
                  readOnly
                  disabled
                />
              </Form.Item>
              <Form.Item label="Fist Name">
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  placeholder="First name of account"
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Date Of Birth">
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  placeholder="Date of birth"
                  readOnly
                />
              </Form.Item>
              <Form.Item label="Last Name">
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  placeholder="Last name of account"
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  placeholder="Email of account"
                  readOnly
                />
              </Form.Item>
              <Form.Item label="Phone">
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  placeholder="Phone number of account"
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Role">
                <Select
                  name="role"
                  value={String(formData.role)}
                  readOnly
                  disabled
                >
                  <Select.Option value="0">Admin</Select.Option>
                  <Select.Option value="1">Customer</Select.Option>
                  <Select.Option value="2">Staff</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Sex" readOnly>
                <Radio.Group name="sex" value={String(formData.sex)} readOnly>
                  <Radio value="0"> Female </Radio>
                  <Radio value="1"> Male </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Address" readOnly>
                <TextArea
                  rows={4}
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  placeholder="Address of account"
                />
              </Form.Item>
              <Form.Item>
                <Button type="default" onClick={goToAccountManagement}>
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
};

export default AccountDetail;
