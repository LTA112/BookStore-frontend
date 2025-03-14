import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById, updateBook, fetchCategories, fetchBooks } from '../config';
import DashboardContainer from "../DashBoard/DashBoardContainer.jsx";
import { Form, Input, Button, InputNumber, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
const { Option } = Select;

function EditBook() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [imagePreview, setImagePreview] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [fetchedBooks, setFetchedBooks] = useState([]);
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
        if (bookId) {
            fetchBookById(bookId)
                .then(response => {
                    const bookData = response.data;
                    if (response === undefined) {
                        navigate("/404");
                    }
                    // Map bookCategories to an array of catIDs
                    const catIDs = bookData.bookCategories?.map(category => category.catId.catID) || [];

                    form.setFieldsValue({
                        ...bookData,
                        publicationYear: bookData.publicationYear.toString(),
                        catIDs, // Set catIDs for multiple select
                    });

                    if (bookData.image && bookData.image.startsWith(`/uploads/book_`)) {
                        setImagePreview(`http://localhost:6789${bookData.image}`);
                    } else {
                        setImagePreview(bookData.image);
                    }
                })
                .catch(error => {
                    console.error('Error fetching book details:', error);
                    message.error('Failed to fetch book details.');
                    navigate("/404");
                });
            fetchCategories()
                .then((response) => {
                    console.log("Categories fetched:", response.data); // Log dữ liệu trả về
                    if (Array.isArray(response.data)) {
                        setCategories(response.data.filter(category => category.catStatus === 1)); // Chỉ lấy category có `catStatus` là 1
                    }
                })
                .catch((error) => {
                    console.error("Error fetching categories:", error);
                    message.error("Failed to fetch categories");
                });
        }
    }, [bookId, form]);


    const handleImageChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if (newFileList.length > 0) {
            const file = newFileList[0].originFileObj;
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const formDataToSend = new FormData();

            // Map catIDs to bookCategories
            const bookCategories = values.catIDs.map(catID => ({
                catId: { catID }, // Backend yêu cầu catId là một object chứa catID
            }));
            console.log("Current Book ID:", bookId); // Debug `bookId`
            console.log("Fetched Books:", fetchedBooks); // Debug `fetchedBooks`

            // Kiểm tra trùng ISBN nhưng bỏ qua sách đang chỉnh sửa
            const isDuplicate = fetchedBooks.some((book) => {
                console.log(`Comparing with Book ID: ${book.bookID}`); // Debug từng sách
                return book.isbn === values.isbn && String(book.bookID) !== String(bookId); // So sánh `bookId`
            });

            if (isDuplicate) {
                message.error("A book with the same ISBN already exists.");
                return; // Dừng thực hiện nếu ISBN trùng
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
                bookCategories, // Gửi lên danh sách các category
            };
            console.log("Sách khi gửi: ", bookData)
            formDataToSend.append('book', JSON.stringify(bookData));

            // Attach the image file if it exists
            if (fileList.length > 0) {
                formDataToSend.append('image', fileList[0].originFileObj);
            }
            console.log("FormData prepared for submission:");
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ": " + pair[1]); // Log nội dung FormData
            }

            await updateBook(bookId, formDataToSend);
            message.success('Book updated successfully');
            navigate("/dashboard/books");
        } catch (error) {
            console.error('Error updating book:', error);
            message.error('Failed to update book.');
        }
    };


    const handleRemove = () => {
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
                    Edit Book
                </h1>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ maxWidth: '700px', margin: 'auto' }}
                >
                    <Form.Item
                        label="Categories"
                        name="catIDs"
                        rules={[{ required: true, message: 'Please select at least one category' }]}
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


                    <Form.Item
                        label="Title"
                        name="bookTitle"
                        rules={[{ required: true, message: 'Please enter the title' }]}
                    >
                        <Input placeholder="Title of the book" />
                    </Form.Item>

                    <Form.Item
                        label="Publication Year"
                        name="publicationYear"
                        rules={[
                            { required: true, message: 'Please enter the publication year' },
                            {
                                validator: (_, value) => {
                                    const currentYear = new Date().getFullYear();
                                    if (!value) {
                                        return Promise.reject('Please enter the publication year');
                                    }
                                    if (value < 1000 || value > currentYear) {
                                        return Promise.reject('Please enter a valid year');
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber placeholder="Publication year (e.g., 1999)" style={{ width: '100%' }} />
                    </Form.Item>


                    <Form.Item
                        label="Author"
                        name="author"
                        rules={[
                            { required: true, message: 'Please enter the author' },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: 'Author name must contain valid characters and cannot be empty',
                            },
                        ]}
                    >
                        <Input placeholder="Author of the book" />
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
                        <InputNumber style={{ width: '100%' }} placeholder="Price of the book" />
                    </Form.Item>

                    <Form.Item
                        label="Translator"
                        name="translator"
                        rules={[
                            { required: false, message: 'Please enter the translator' },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: 'Translator name must contain valid characters and cannot be empty',
                            },
                        ]}
                    >
                        <Input placeholder="Translator of the book" />
                    </Form.Item>

                    <Form.Item
                        label="Hardcover"
                        name="hardcover"
                        rules={[
                            { required: true, message: 'Please enter the hardcover details' },
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
                            min={1}
                            max={10000}
                            step={1}
                            placeholder="Hardcover of the book"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Publisher"
                        name="publisher"
                        rules={[
                            { required: true, message: 'Please enter the publisher' },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: 'Publisher name must contain letters, numbers, and cannot be only spaces',
                            },
                        ]}
                    >
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
                                    return Promise.reject(new Error('Weight must not exceed 100,000 grams'));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={100000}
                            step={1}
                            placeholder="Weight of the book (grams)"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="isbn"
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
                        //readOnly
                        />
                    </Form.Item>



                    <Form.Item
                        label="Quantity"
                        name="bookQuantity"
                        rules={[
                            { required: true, message: 'Please enter the quantity' },
                            {
                                type: 'number',
                                min: 1,
                                message: 'Quantity must be at least 1',
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            step={1}
                            placeholder="Quantity"
                            style={{ width: '20%' }}
                        />
                    </Form.Item>


                    <Form.Item label="Image" name="image">
                        <Upload
                            listType="picture"
                            fileList={fileList}
                            onChange={handleImageChange}
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>Upload Image</Button>
                        </Upload>
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Book Preview"
                                style={{ width: '100px', marginTop: '10px' }}
                            />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="bookDescription"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Description of the book" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button
                            htmlType="button"
                            onClick={() => navigate("/dashboard/books")}
                            style={{ marginLeft: '10px' }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default EditBook;
