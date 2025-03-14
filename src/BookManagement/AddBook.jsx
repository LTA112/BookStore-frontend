import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Upload, message, Select } from 'antd';
import { addBook, fetchCategories, fetchBooks } from '../config'; // Ensure fetchCategories is imported
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
const { TextArea } = Input;
const { Option } = Select;

function AddBook() {
    const [form] = Form.useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]); // Add state for categories
    const navigate = useNavigate();
    const [fetchedBooks, setFetchedBooks] = useState([]);
    // Fetch categories when the component mounts
    useEffect(() => {
        const loadBooks = async () => {
            const response = await fetchBooks();
            setFetchedBooks(response.data); // Lưu vào state
            console.log('Fetched books:', response.data);
        }
        loadBooks();
        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
        fetchCategories()
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setCategories(response.data.filter(category => category.catStatus === 1)); // Only active categories
                }
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                message.error("Failed to fetch categories");
            });
    }, []);

    const handleImageChange = ({ fileList: newFileList }) => {
        const file = newFileList[0]?.originFileObj;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        setFileList(newFileList);
    };

    const handleSubmit = async (values) => {
        try {
            const formDataToSend = new FormData();
            const bookCategories = values.catIDs.map((catID) => ({
                catId: { catID },
            }));
            const isDuplicate = fetchedBooks.some((book) => book.isbn === values.isbn);

            if (isDuplicate) {
                message.error("A book with the same ISBN already exists.");
                return;
            }

            const bookData = {
                bookTitle: values.bookTitle,
                publicationYear: values.publicationYear,
                author: values.author,
                dimension: values.dimension,
                translator: values.translator,
                hardcover: values.hardcover,
                publisher: values.publisher,
                weight: values.weight,
                bookDescription: values.bookDescription,
                bookPrice: values.bookPrice,
                isbn: values.isbn,
                bookQuantity: values.bookQuantity,
                bookStatus: 1,
                bookCategories, // Thêm danh sách category vào đây
            };

            console.log('Book Data:', bookData); // Kiểm tra dữ liệu gửi đi

            formDataToSend.append('book', JSON.stringify(bookData));

            if (fileList.length > 0) {
                formDataToSend.append('image', fileList[0].originFileObj);
            }

            await addBook(formDataToSend); // Gọi API thêm sách
            message.success('Book added successfully');
            navigate("/dashboard/books");
        } catch (error) {
            console.error('Error adding book:', error);
            message.error('Failed to add book');
        }
    };



    const handleRemove = () => {
        setImagePreview(null);
        setFileList([]);
    };

    const handleReset = () => {
        form.resetFields();
        setImagePreview(null);
        setFileList([]);
    };

    return (
        <div className="main-container">
            <div className="dashboard-container">
                <DashboardContainer />
            </div>

            <div className="dashboard-content">
                <h1 className="titlemanagement">
                    Add Book
                </h1>

                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    style={{ maxWidth: '800px', margin: 'auto' }}
                >
                    <Form.Item
                        label="Categories"
                        name="catIDs"
                        rules={[{ required: true, message: 'Please select at least one category' }]} // Yêu cầu chọn ít nhất một category
                        style={{ width: '100%' }}
                    >
                        <Select
                            mode="multiple" // Cho phép chọn nhiều category
                            placeholder="Select categories"
                        >
                            {categories.map((category) => (
                                <Option key={category.catID} value={category.catID}>
                                    {category.catName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>


                    <Form.Item label="Title" name="bookTitle" rules={[{ required: true, message: 'Please enter the title' }]}>
                        <Input placeholder="Title of the book" />
                    </Form.Item>

                    <Form.Item
                        label="Publication Year"
                        name="publicationYear"
                        rules={[
                            { required: true, message: 'Please enter the publication year' },
                            {
                                type: 'number',
                                min: 1000,
                                max: new Date().getFullYear(),
                                message: 'Please enter a valid year',
                            },
                        ]}
                    >
                        <InputNumber placeholder="1999..." style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Author"
                        name="author"
                        rules={[
                            { required: true, message: 'Please enter the author' },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: 'Author name must contain letters, numbers, and cannot be only spaces',
                            },
                        ]}
                    >
                        <Input placeholder="Nhut Anh 123" />
                    </Form.Item>



                    <Form.Item
                        label="Dimensions"
                        name="dimension"
                        rules={[
                            { required: true, message: 'Please enter the dimensions' },
                            {
                                pattern: /^\d+(\.\d+)?(x\d+(\.\d+)?){1,2}$/,
                                message: 'Dimensions must be in the format "number x number" (e.g., 25.5x26.3x27.1)',
                            },
                        ]}
                    >
                        <Input placeholder="Dimensions (e.g., 25.5x26.3x27.1)" />
                    </Form.Item>



                    <Form.Item
                        label="Price"
                        name="bookPrice"
                        rules={[
                            { required: true, message: 'Please enter the price' },
                            {
                                validator: (_, value) => {
                                    if (!value || Number(value) <= 100000000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Price must not exceed 100,000,000'));
                                },
                            },
                        ]}
                    >
                        <Input placeholder="5000000" type="number" />
                    </Form.Item>


                    <Form.Item label="Translator"
                        name="translator"
                        rules={[
                            { required: false, message: 'Please enter the translator' },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: 'Translator name must contain letters, numbers, and cannot be only spaces',
                            },
                        ]}>
                        <Input placeholder="Cong Khanh 123" />

                    </Form.Item>

                    <Form.Item
                        label="Hardcover"
                        name="hardcover"
                        rules={[
                            { required: true, message: 'Please enter the hardcover' },
                            {
                                validator: (_, value) => {
                                    if (!value || value <= 10000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hardcover must not exceed 10,000'));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            min={1} // Giá trị tối thiểu là 1
                            max={10000} // Giới hạn tối đa cho InputNumber
                            step={1} // Bước nhảy là 1
                            placeholder="Hardcover"
                            style={{ width: '20%' }}
                        />
                    </Form.Item>


                    <Form.Item label="Publisher" name="publisher" rules={[
                        { required: true, message: 'Please enter the publisher' },
                        {
                            pattern: /^\p{L}+(\s\p{L}+)*$/u,
                            message: 'Publisher name must contain letters, numbers, and cannot be only spaces',
                        },
                    ]}>
                        <Input placeholder="Publisher of the book" />
                    </Form.Item>

                    <Form.Item
                        label="Weight"
                        name="weight"
                        rules={[
                            { required: true, message: 'Please enter the weight' },
                            {
                                validator: (_, value) => {
                                    if (!value || Number(value) <= 100000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Weight must not exceed 100,000 gram'));
                                },
                            },
                        ]}
                    >
                        <Input placeholder="100 gram" type="number" />
                    </Form.Item>

                    <Form.Item
                        label="ISBN"
                        name="isbn"
                        rules={[
                            { required: true, message: 'Please enter the ISBN' },
                            {
                                validator: (_, value) => {
                                    if (!value || !/^\d+$/.test(value)) {
                                        return Promise.reject('ISBN must contain only numbers');
                                    }
                                    if (value.length > 13) {
                                        return Promise.reject('ISBN must not exceed 13 digits');
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        getValueFromEvent={(event) => event.target.value.replace(/\s+/g, '')}
                    >
                        <Input
                            placeholder="International Standard Book Number"
                            style={{ width: '100%' }}
                            maxLength={13} // Giới hạn tối đa 13 ký tự
                        />
                    </Form.Item>

                    <Form.Item
                        label="Quantity"
                        name="bookQuantity"
                        rules={[{ required: true, message: 'Please enter the quantity' }]}
                    >
                        <InputNumber min={1} step={1} placeholder="Quantity" style={{ width: '20%' }} />
                    </Form.Item>

                    {/* Image Upload Section */}
                    <Form.Item label="Image" name="image">
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            onRemove={handleRemove}
                        >
                            {fileList.length < 1 && (
                                <>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </>
                            )}
                        </Upload>
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '200px', marginTop: '-100px' }} />}
                    </Form.Item>

                    <Form.Item label="Description" name="bookDescription" rules={[{ required: true, message: 'Please enter a description' }]}>
                        <TextArea rows={4} placeholder="Description of the book" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Submit</Button>
                        <Button htmlType="button" onClick={handleReset} style={{ marginLeft: '40px' }}>Reset</Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="copyright">
                <div>© Copyright {new Date().getFullYear()}</div>
                <div>Cabybook Management System </div>
                <div>All Rights Reserved</div>
            </div>
        </div>
    );
}

export default AddBook;
