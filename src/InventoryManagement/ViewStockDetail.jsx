import React, { useEffect, useState } from 'react';
import { Table, Button, message, Spin, Modal } from 'antd';
import { useParams } from 'react-router-dom';
import { fetchImportStockDetailsByStockId } from '../config';
import DashboardContainer from '../DashBoard/DashBoardContainer';
import {
    InfoCircleOutlined,
} from '@ant-design/icons';
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
function ViewStockDetail() {
    const { stockId } = useParams();
    const [stockDetails, setStockDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(0);


    useEffect(() => {
        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
        loadStockDetails();
    }, [stockId]);

    const loadStockDetails = async () => {
        try {
            const response = await fetchImportStockDetailsByStockId(stockId);
            setStockDetails(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                message.error(`No details found for import stock ID: ${stockId}`);
            } else {
                message.error("An error occurred while fetching stock details");
            }
            console.error('Error fetching stock details:', error);
        }
    };


    const showBookDetail = (book, quantity) => {
        setSelectedBook(book);
        setSelectedQuantity(quantity);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedBook(null);
        setSelectedQuantity(0);
    };

    const columns = [
        {
            title: 'Product ID',
            dataIndex: ['bookID', 'bookID'],
            key: 'productID',
            render: (_, record) => record.bookID?.bookID || 'N/A',
        },
        {
            title: 'Product Name',
            dataIndex: ['bookID', 'bookTitle'],
            key: 'productName',
            render: (_, record) => record.bookID?.bookTitle || 'N/A',
        },
        {
            title: 'Quantity',
            dataIndex: 'iSDQuantity', // Đúng trường từ dữ liệu trả về
            key: 'quantity',
            render: (quantity) => quantity || 'N/A',
        },
        {
            title: 'Import Price',
            dataIndex: 'importPrice',
            key: 'importPrice',
            render: (price) => (!isNaN(price) ? `${new Intl.NumberFormat('en-US').format(price)} VND` : 'N/A'),
        },
        {
            title: 'Total',
            key: 'total',
            render: (_, record) => {
                const quantity = record.iSDQuantity || 0; // Sửa thành đúng trường
                const price = parseFloat(record.importPrice) || 0;
                return `${new Intl.NumberFormat('en-US').format(quantity * price)} VND`;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => showBookDetail(record.bookID, record.iSDQuantity)}>
                    <InfoCircleOutlined title="Detail" />
                </Button>
            ),
        },
    ];


    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) return <p>Error: {error}</p>;

    return (
        <div className="main-container">
            <DashboardContainer />
            <div className="dashboard-content">
                <h1>Stock Detail - ID: {stockId}</h1>
                <Table
                    columns={columns}
                    dataSource={stockDetails}
                    rowKey="isdid"
                />

                <Button
                    type="primary"
                    style={{ marginTop: '20px' }}
                    onClick={() => window.history.back()}
                >
                    Back
                </Button>

                <Modal
                    title="Book Detail"
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Close
                        </Button>,
                    ]}
                >
                    {selectedBook && (
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <p><strong>Book ID:</strong> {selectedBook.bookID}</p>
                                <p><strong>Title:</strong> {selectedBook.bookTitle}</p>
                                <p><strong>Author:</strong> {selectedBook.author || 'N/A'}</p>
                                <p><strong>Translator:</strong> {selectedBook.translator || 'N/A'}</p>
                                <p><strong>Publisher:</strong> {selectedBook.publisher || 'N/A'}</p>
                                <p><strong>Publication Year:</strong> {selectedBook.publicationYear || 'N/A'}</p>
                                <p><strong>ISBN:</strong> {selectedBook.isbn || 'N/A'}</p>
                                <p><strong>Description:</strong> {selectedBook.bookDescription || 'N/A'}</p>
                                <p><strong>Quantity:</strong> {selectedQuantity}</p>
                                <p><strong>Price:</strong> {`${new Intl.NumberFormat('en-US').format(selectedBook.bookPrice || 0)} VND`}</p>
                            </div>
                            {selectedBook.image && (
                                <div style={{ marginLeft: '20px', maxWidth: '200px' }}>
                                    <img
                                        src={`http://localhost:6789${selectedBook.image}`}
                                        alt="Book Cover"
                                        style={{ width: '100%', borderRadius: '5px' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}

export default ViewStockDetail;
