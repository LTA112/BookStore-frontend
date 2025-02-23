import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, DatePicker, InputNumber, message, Modal, Table, Upload, TreeSelect } from "antd";
import { fetchStaffs, createImportStock, fetchBooks, addImportStockDetail, addBook, fetchCategories, updateBook } from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
const { Option } = Select;
const { TextArea } = Input;

function AddStock() {
    const [addStockForm] = Form.useForm();
    const [addBookForm] = Form.useForm();

    const [staff, setStaff] = useState([]);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([{ bookID: "", quantity: 1, price: 0 }]);
    const [temporaryBooks, setTemporaryBooks] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddBookModalVisible, setIsAddBookModalVisible] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalKey, setModalKey] = useState(0);
    const navigate = useNavigate();
    const [categoryTreeData, setCategoryTreeData] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);
    useEffect(() => {
        if (!checkWarehouseStaffRole() && !checkAdminRole()) {
            return navigate("/404");
        }
        const fetchData = async () => {
            try {


                const staffResponse = await fetchStaffs();
                setStaff(staffResponse.data || []);

                const bookResponse = await fetchBooks();
                setBooks(bookResponse.data || []);

                const categoryResponse = await fetchCategories();
                setCategories(categoryResponse.data.filter(category => category.catStatus === 1) || []);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                message.error("Failed to load data. Please try again later.");
            }
        };

        fetchData();
        fetchCategories()
            .then((response) => {
                if (Array.isArray(response.data)) {
                    const activeCategories = response.data.filter(
                        (category) => category.catStatus === 1
                    );
                    const buildTreeData = (categories) => {
                        const map = {};
                        const roots = [];
                        categories.forEach((cat) => {
                            map[cat.catID] = {
                                title: cat.catName,
                                value: cat.catID,
                                key: cat.catID,
                                children: [],
                            };
                        });
                        categories.forEach((cat) => {
                            if (cat.parentCatID && map[cat.parentCatID]) {
                                map[cat.parentCatID].children.push(map[cat.catID]);
                            } else {
                                roots.push(map[cat.catID]);
                            }
                        });
                        return roots;
                    };
                    setCategoryTreeData(buildTreeData(activeCategories));
                }
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                message.error("Failed to fetch categories");
            });
    }, []);

    const addItemRow = () => setItems([...items, { bookID: "", quantity: 1, price: 0 }]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Đồng bộ với `temporaryBooks` nếu `bookID` là null (tức là sách vừa thêm)
        if (field === "quantity" && !newItems[index].bookID) {
            const tempBookIndex = temporaryBooks.findIndex((book) => book.bookTitle === newItems[index].bookTitle);
            if (tempBookIndex !== -1) {
                const updatedTemporaryBooks = [...temporaryBooks];
                updatedTemporaryBooks[tempBookIndex].bookQuantity = value; // Cập nhật bookQuantity
                setTemporaryBooks(updatedTemporaryBooks);
            }
        }

        setItems(newItems);
    };


    const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));

    const showBookModal = (index) => {
        setSelectedRowIndex(index);
        setIsModalVisible(true);
    };


    const checkISBNExists = async (isbn) => {
        try {
            const response = await fetchBooks();
            return response.ok && response.data.exists; // `exists` trả về true/false từ backend
        } catch (error) {
            console.error("Error checking ISBN:", error);
            return false; // Nếu có lỗi, coi như ISBN chưa tồn tại
        }
    };




    const handleSelectBook = (record) => {
        if (record.bookTitle === "+ Add a new book") {
            setModalKey((prevKey) => prevKey + 1); // Tăng modalKey để tạo modal mới
            setIsModalVisible(false); // Đóng modal chọn sách
            setIsAddBookModalVisible(true); // Hiển thị modal thêm sách mới
        } else {
            const newItems = [...items];
            // Kiểm tra nếu mục hiện tại chưa được điền thông tin
            if (selectedRowIndex !== null) {
                newItems[selectedRowIndex] = {
                    ...newItems[selectedRowIndex],
                    bookID: record.bookID,
                    bookTitle: record.bookTitle,
                };
            } else {
                newItems.push({
                    bookID: record.bookID,
                    bookTitle: record.bookTitle,
                    quantity: 1,
                    price: 0,
                });
            }
            setItems(newItems);
            setIsModalVisible(false);
        }
    };




    const handleImageChange = ({ fileList: newFileList }) => {
        console.log("New File List:", newFileList);
        const file = newFileList[0]?.originFileObj;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
        setFileList(newFileList);
    };


    const handleAddBookSubmit = async (values) => {
        try {
            const isISBNInDatabase = await checkISBNExists(values.isbn);
            if (isISBNInDatabase) {
                message.error(`Book with ISBN "${values.isbn}" already exists in the database!`);
                return;
            }

            // Kiểm tra sách trùng lặp
            const duplicateBookInTemp = temporaryBooks.find((book) => book.isbn === values.isbn);
            const duplicateBookInItems = items.find((item) => {
                const book = books.find((book) => book.bookID === item.bookID);
                return book?.isbn === values.isbn;
            });

            if (duplicateBookInTemp || duplicateBookInItems) {
                message.warning(`Book with ISBN "${values.isbn}" already exists! Quantity will be updated.`);
                const newItems = [...items];
                const index = newItems.findIndex((item) => {
                    const book = books.find((book) => book.bookID === item.bookID);
                    return book?.isbn === values.isbn;
                });

                if (index !== -1) {
                    newItems[index].quantity += values.bookQuantity || 1;
                    setItems(newItems);
                }
                setIsAddBookModalVisible(false);
                return;
            }

            // Thêm sách mới
            const bookCategories = values.catIDs.map((catID) => ({ catId: { catID } }));
            const newBook = {
                ...values,
                bookID: null,
                bookStatus: 1,
                image: fileList[0]?.originFileObj || null,
                bookCategories,
            };

            const newItem = {
                bookID: null,
                bookTitle: values.bookTitle,
                quantity: values.bookQuantity || 1,
                price: 0,
            };

            // Xóa trường trống trước khi thêm
            const updatedItems = [...items];
            if (
                updatedItems.length > 0 &&
                !updatedItems[updatedItems.length - 1].bookTitle &&
                !updatedItems[updatedItems.length - 1].bookID
            ) {
                updatedItems.pop();
            }
            updatedItems.push(newItem);

            setTemporaryBooks([...temporaryBooks, newBook]);
            setItems(updatedItems);

            // Reset modal
            setFileList([]);
            setIsAddBookModalVisible(false);
            addBookForm.resetFields();
            message.success(`Book "${values.bookTitle}" added successfully.`);
        } catch (error) {
            console.error("Error adding book:", error);
            message.error("Failed to add book.");
        }
    };




    const handleSubmit = async (values) => {
        console.log("Form Values:", values); // Debug dữ liệu từ form
        console.log("Items to Submit:", items);
        console.log("Submitting stock with items:", items);
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const createdBooks = await Promise.all(
                temporaryBooks.map(async (book) => {
                    const formData = new FormData();

                    const bookData = {
                        bookTitle: book.bookTitle,
                        publicationYear: book.publicationYear,
                        author: book.author,
                        dimension: book.dimension,
                        translator: book.translator,
                        hardcover: book.hardcover,
                        publisher: book.publisher,
                        weight: book.weight,
                        bookDescription: book.bookDescription,
                        bookPrice: book.bookPrice,
                        isbn: book.isbn,
                        bookQuantity: book.bookQuantity,
                        bookStatus: 1,
                        bookCategories: book.bookCategories.map((cat) => ({
                            catId: { catID: cat.catId.catID }, // Chuyển đổi category giống EditBook
                        })),
                    };

                    formData.append("book", JSON.stringify(bookData));

                    if (book.image) {
                        formData.append("image", book.image);
                    }

                    const response = await addBook(formData);
                    return response.data;
                })
            );

            const updatedItems = items.map((item) => {
                if (!item.bookID) {
                    const createdBook = createdBooks.find((book) => book.bookTitle === item.bookTitle);
                    if (createdBook) {
                        return { ...item, bookID: createdBook.bookID, quantity: item.quantity };
                    }
                }
                return item;
            });

            const stockData = {
                importDate: values.importDate.format("YYYY-MM-DD"),
                staffID: { staffID: values.staffID },
                ISStatus: 1,
            };
            const stockResponse = await createImportStock(stockData);
            const savedStockId = stockResponse.data.isid;
            console.log("Stock ID Saving: ", savedStockId)
            const detailsData = updatedItems.map((item) => ({
                bookID: { bookID: item.bookID },
                iSDQuantity: item.quantity,
                importPrice: item.price,
            }));
            console.log("Details Data Sent to addImportStockDetail:", detailsData);

            await addImportStockDetail(savedStockId, detailsData);

            for (const item of updatedItems) {
                const existingBook = books.find((book) => book.bookID === item.bookID);
                if (existingBook) {
                    const updatedBookData = {
                        ...existingBook,
                        bookQuantity: existingBook.bookQuantity + item.quantity,
                    };
                    const formData = new FormData();
                    formData.append("book", JSON.stringify(updatedBookData));

                    if (fileList.length > 0) {
                        formData.append("image", fileList[0].originFileObj); // Chỉ thêm hình ảnh nếu có
                    }

                    try {
                        await updateBook(existingBook.bookID, formData);
                    } catch (error) {
                        console.error(`Failed to update book with ID: ${existingBook.bookID}`, error);
                    }

                }
            }

            message.success("Stock added successfully.");
            setTemporaryBooks([]);
            setItems([]);
            navigate("/dashboard/inventory");
        } catch (error) {
            console.error("Error during stock submission:", error);
            message.error("Failed to submit stock.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const calculateTotalPrice = (quantity, price) => quantity * price;

    const bookColumns = [
        { title: "Book ID", dataIndex: "bookID", key: "bookID" },
        { title: "Title", dataIndex: "bookTitle", key: "bookTitle" },
        { title: "Author", dataIndex: "author", key: "author" },
        { title: "Price", dataIndex: "bookPrice", key: "bookPrice" },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button type="link" onClick={() => handleSelectBook(record)}>
                    Select
                </Button>
            ),
        },
    ];

    return (
        <div className="main-container">
            <DashboardContainer />
            <div className="dashboard-content">
                <h1>Add Stock</h1>
                <Form form={addStockForm} onFinish={(values) => {
                    console.log("Form submitted:", values);
                    handleSubmit(values);
                }} onFinishFailed={(errorInfo) => {
                    console.log("Im faking here")
                    console.error("Validation failed:", errorInfo);
                    message.error("Validation failed. Please check the form.");
                }} layout="vertical" style={{ maxWidth: "800px", margin: "auto" }}>


                    <Form.Item label="Import Date" name="importDate" rules={[{ required: true, message: "Please select an import date" }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item label="Staff" name="staffID" rules={[{ required: true, message: "Please select a staff member" }]}>
                        <Select placeholder="Select Staff">
                            {staff.map(member => (
                                <Option key={member.staffID} value={member.staffID}>
                                    {`${member.username?.firstName} ${member.username?.lastName}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <h2>Stock Items</h2>
                    {items.map((item, index) => (
                        <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <Input
                                placeholder="Book Title"
                                value={item.bookTitle}
                                readOnly
                                onClick={() => showBookModal(index)}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>Quantity: </span>
                                <InputNumber
                                    min={1}
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(value) => handleItemChange(index, "quantity", value)}
                                />
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>Import Price: </span>
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    placeholder="Import Price"
                                    value={item.price}
                                    onChange={(value) => handleItemChange(index, "price", value)}
                                />
                            </div>

                            {items.length > 1 && (
                                <Button type="link" danger onClick={() => removeItemRow(index)}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}


                    <Button type="dashed" onClick={addItemRow} style={{ width: "100%" }}>
                        Add Item
                    </Button>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <Modal title="Select a Book" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
                <Table
                    columns={bookColumns}
                    dataSource={[...books, { bookID: "", bookTitle: "+ Add a new book" }]}
                    rowKey="bookID"
                    pagination={{ pageSize: 5 }}
                />
            </Modal>
            <Modal
                title="Add a New Book"
                visible={isAddBookModalVisible}
                key={modalKey} // Tạo modal mới dựa trên modalKey
                forceRender
                onCancel={() => {
                    setIsAddBookModalVisible(false);
                    setFileList([]); // Xóa file list
                    setImagePreview(null); // Xóa preview
                    addBookForm.resetFields(); // Xóa các giá trị trong form
                }}
                footer={null}
            >
                <Form
                    form={addBookForm}
                    layout="vertical"
                    onFinish={handleAddBookSubmit}
                    style={{ maxWidth: '800px', margin: 'auto' }}
                >
                    <Form.Item
                        label="Categories"
                        name="catIDs"
                        rules={[{ required: true, message: 'Please select at least one category' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select categories"
                            allowClear
                        >
                            {categories.map(category => (
                                <Option key={category.catID} value={category.catID}>
                                    {category.catName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Title" name="bookTitle" rules={[{ required: true, message: "Please enter the title" }]}>
                        <Input placeholder="Title" />
                    </Form.Item>

                    <Form.Item
                        label="Publication Year"
                        name="publicationYear"
                        rules={[
                            { required: true, message: "Please enter the publication year" },
                            {
                                type: "number",
                                min: 1900,
                                max: new Date().getFullYear(),
                                message: "Enter a valid year",
                            },
                        ]}
                    >
                        <InputNumber placeholder="Publication Year" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Author"
                        name="author"
                        rules={[
                            { required: true, message: "Please enter the author" },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: "Author name must contain valid characters and cannot be only spaces",
                            },
                        ]}
                    >
                        <Input placeholder="Author" />
                    </Form.Item>

                    <Form.Item
                        label="Price"
                        name="bookPrice"
                        rules={[
                            { required: true, message: "Please enter the price" },
                            {
                                validator: (_, value) => {
                                    if (!value || value <= 100000000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Price must not exceed 100,000,000"));
                                },
                            },
                        ]}
                    >
                        <InputNumber placeholder="Price" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Quantity"
                        name="bookQuantity"
                        rules={[
                            { required: true, message: "Please enter the quantity" },
                            {
                                validator: (_, value) => {
                                    if (!value || (value >= 1 && value < 10001)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Quantity must be between 1 and 10,000"));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            min={1} // Giá trị tối thiểu là 1
                            max={10000} // Giá trị tối đa là 10,000
                            placeholder="Quantity"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>


                    <Form.Item
                        label="Translator"
                        name="translator"
                        rules={[
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: "Translator name must contain valid characters or be empty",
                            },
                        ]}
                    >
                        <Input placeholder="Translator" />
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
                        label="ISBN"
                        name="isbn"
                        rules={[
                            { required: true, message: "Please enter the ISBN" },
                            {
                                validator: (_, value) => {
                                    if (!value || !/^\d+$/.test(value)) {
                                        return Promise.reject("ISBN must contain only numbers");
                                    }
                                    if (value.length > 13) {
                                        return Promise.reject("ISBN must not exceed 13 digits");
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        getValueFromEvent={(event) => event.target.value.replace(/\s+/g, "")}
                    >
                        <Input
                            placeholder="International Standard Book Number"
                            style={{ width: "100%" }}
                            maxLength={13}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Publisher"
                        name="publisher"
                        rules={[
                            { required: true, message: "Please enter the publisher" },
                            {
                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                message: "Publisher name must contain valid characters",
                            },
                        ]}
                    >
                        <Input placeholder="Publisher" />
                    </Form.Item>

                    <Form.Item
                        label="Hardcover"
                        name="hardcover"
                        rules={[
                            {
                                required: true,
                                validator: (_, value) => {
                                    if (!value || value <= 10000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Hardcover must not exceed 10,000"));
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            placeholder="Hardcover"
                            style={{ width: "100%" }}
                            min={1}
                            max={10000}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Weight"
                        name="weight"
                        rules={[
                            { required: true, message: "Please enter the weight" },
                            {
                                validator: (_, value) => {
                                    if (!value || value <= 100000) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Weight must not exceed 100,000 grams"));
                                },
                            },
                        ]}
                    >
                        <InputNumber placeholder="Weight" style={{ width: "100%" }} step={0.01} />
                    </Form.Item>


                    <Form.Item label="Description" name="bookDescription" rules={[{ required: true, message: "Please enter a description" }]}>
                        <TextArea rows={4} placeholder="Description" />
                    </Form.Item>

                    <Form.Item label="Image" name="image">
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={handleImageChange}
                            onRemove={() => setFileList([])}
                        >
                            {fileList.length < 1 && (
                                <>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </>
                            )}
                        </Upload>
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ width: "100%", maxHeight: "150px", marginTop: "10px" }}
                            />
                        )}
                    </Form.Item>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                            type="default"
                            onClick={() => {
                                setIsAddBookModalVisible(false);
                                setFileList([]);
                                setImagePreview(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Add Book
                        </Button>
                    </div>
                </Form>
            </Modal>

        </div>
    );
}

export default AddStock;
