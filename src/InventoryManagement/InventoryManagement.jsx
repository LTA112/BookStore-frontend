import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Tabs,
  Spin,
  Modal,
  Descriptions,
  message,
  DatePicker,
} from "antd";
import {
  fetchImportStocks,
  fetchSupplierById,
  fetchStaffDetail,
  fetchImportStockDetailsByStockId,
  fetchOrders,
  fetchOrderDetail,
  fetchBookDetail,
} from "../config";
import DashboardContainer from "../DashBoard/DashBoardContainer";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { InfoCircleOutlined } from "@ant-design/icons";
import { checkAdminRole, checkWarehouseStaffRole } from "../jwtConfig";
import Footer from "../FooterForDashboard/Footer";
const { Search } = Input;
const { RangePicker } = DatePicker;

const enrichOrdersData = (orders) => {
  return orders.map((order) => {
    // Tính tổng giá sách trong orderDetails
    const totalBooksPrice = order.orderDetails.reduce(
      (sum, detail) =>
        sum + (detail.quantity || 0) * (detail.book?.bookPrice || 0),
      0
    );

    // Lấy discount và tính tổng giá trị đơn hàng
    const discount = order.discount || 0;
    const totalPrice = totalBooksPrice - discount;

    return {
      ...order,
      totalBooksPrice,
      discount,
      totalPrice,
    };
  });
};

const handleDownloadExcelForDateRange = (orders) => {
  if (!orders || orders.length === 0) {
    message.error("No orders available to download.");
    return;
  }

  const sheetData = [
    [
      "Order ID",
      "Customer Name",
      "Order Date",
      "Total Books Price (VND)",
      "Discount (VND)",
      "Total Price (VND)",
    ],
    ...orders.map((order) => [
      order.orderID,
      order.customerName || "N/A",
      order.orderDate,
      order.totalBooksPrice?.toLocaleString() || "0",
      order.discount?.toLocaleString() || "0",
      order.totalPrice?.toLocaleString() || "0",
    ]),
  ];
  const totalStockPrice = orders.reduce(
    (acc, order) => acc + (order.totalPrice || 0),
    0
  ); // Tổng giá trị cột Total Price

  // Thêm dòng tổng vào sheetData
  sheetData.push([
    "",
    "",
    "",
    "",
    "Total Stock",
    totalStockPrice.toLocaleString(),
  ]);
  console.log("Excel Sheet Data:", sheetData); // Log dữ liệu trước khi xuất
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Report");

  XLSX.writeFile(workbook, `Orders_Report_${Date.now()}.xlsx`);
};

const handleDownloadExcel = (orderDetails, order) => {
  if (!orderDetails || !order) {
    message.error("Order details are not available.");
    return;
  }

  const orderSummary = {
    totalBooksPrice: orderDetails.reduce(
      (acc, item) => acc + item.quantity * (item.book?.bookPrice || 0),
      0
    ),
    discount: order.discount || 0,
    totalPrice:
      orderDetails.reduce(
        (acc, item) => acc + item.quantity * (item.book?.bookPrice || 0),
        0
      ) - (order.discount || 0),
  };

  const sheetData = [
    ["Book ID", "Title", "Unit Price (VND)", "Quantity", "Final Price (VND)"],
    ...orderDetails.map((item) => [
      item.book?.bookID || "N/A",
      item.book?.bookTitle || "N/A",
      item.book?.bookPrice?.toLocaleString() || "0",
      item.quantity || "0",
      ((item.book?.bookPrice || 0) * item.quantity).toLocaleString(),
    ]),
    [],
    ["", "Summary"],
    ["Total Books Price (VND)", orderSummary.totalBooksPrice.toLocaleString()],
    ["Discount (VND)", orderSummary.discount.toLocaleString()],
    ["Total Price (VND)", orderSummary.totalPrice.toLocaleString()],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Order Details");

  XLSX.writeFile(workbook, `Order_Details_${Date.now()}.xlsx`);
};

function InventoryManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("import");
  const [importStocks, setImportStocks] = useState([]);
  const [importLoaded, setImportLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState({});
  const [staffs, setStaffs] = useState({});
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Load Import Stocks
  useEffect(() => {
    if (!checkWarehouseStaffRole() && !checkAdminRole()) {
      return navigate("/404");
    }
    if (activeTab === "import" && !importLoaded) {
      loadImportStocks();
    }
    if (activeTab === "export") {
      loadOrders();
    }
  }, [activeTab]);

  const loadImportStocks = async () => {
    setLoading(true);
    try {
      const response = await fetchImportStocks();
      if (Array.isArray(response.data)) {
        const importStocksData = response.data;

        const uniqueSupIDs = [
          ...new Set(importStocksData.map((stock) => stock.supID?.supID)),
        ].filter((id) => id);
        const uniqueStaffIDs = [
          ...new Set(
            importStocksData.map((stock) =>
              typeof stock.staffID === "object"
                ? stock.staffID.staffID
                : stock.staffID
            )
          ),
        ].filter((id) => id);

        const supplierPromises = uniqueSupIDs.map((id) =>
          fetchSupplierById(id).then((res) => ({ id, data: res.data }))
        );
        const suppliersData = await Promise.all(supplierPromises);
        const suppliersMap = suppliersData.reduce((map, item) => {
          map[item.id] = item.data;
          return map;
        }, {});
        setSuppliers(suppliersMap);

        const staffPromises = uniqueStaffIDs.map(async (id) => {
          try {
            const res = await fetchStaffDetail(id);
            return { id, data: res.data };
          } catch (error) {
            console.error(`Failed to fetch staff with ID ${id}:`, error);
            return { id, data: null };
          }
        });

        const staffData = await Promise.all(staffPromises);
        const staffsMap = staffData.reduce((map, item) => {
          if (item.data) {
            map[item.id] = item.data;
          }
          return map;
        }, {});
        setStaffs(staffsMap);

        const stockWithDetailsPromises = importStocksData.map(async (stock) => {
          try {
            const detailsResponse = await fetchImportStockDetailsByStockId(
              stock.isid
            );
            const details = detailsResponse.data;

            const totalPrice = details.reduce((sum, detail) => {
              const quantity = detail.iSDQuantity || 0;
              const price = parseFloat(detail.importPrice) || 0;
              return sum + quantity * price;
            }, 0);

            return { ...stock, totalPrice };
          } catch (error) {
            console.error(
              `Error fetching details for stock ID ${stock.isid}:`,
              error
            );
            return { ...stock, totalPrice: 0 };
          }
        });

        const stocksWithTotalPrice = await Promise.all(
          stockWithDetailsPromises
        );
        setImportStocks(stocksWithTotalPrice);
        setImportLoaded(true);
      } else {
        setImportStocks([]);
        message.error("Invalid data from API");
      }
    } catch (error) {
      console.error("Error fetching import stocks:", error);
      setError("Error fetching import stocks");
      message.error("Could not load data from API");
    }
    setLoading(false);
  };

  // Load Orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrders();
      if (Array.isArray(response.data)) {
        const ordersData = response.data;

        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const detailsResponse = await fetchOrderDetail(order.orderID);
              const orderDetails = detailsResponse.data.orderDetails || [];

              // Lấy dữ liệu sách
              const booksWithDetails = await Promise.all(
                orderDetails.map(async (detail) => {
                  try {
                    const bookResponse = await fetchBookDetail(detail.bookID);
                    return { ...detail, book: bookResponse.data || {} };
                  } catch (error) {
                    console.error(
                      `Failed to fetch book for detail ${detail.ODID}:`,
                      error
                    );
                    return { ...detail, book: {} };
                  }
                })
              );

              console.log("Order Details with Books:", booksWithDetails);
              return { ...order, orderDetails: booksWithDetails };
            } catch (error) {
              console.error(
                `Failed to fetch details for order ${order.orderID}:`,
                error
              );
              return { ...order, orderDetails: [] };
            }
          })
        );

        setOrders(ordersWithDetails);
        setFilteredOrders(ordersWithDetails);
      } else {
        message.error("Invalid order data");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    setSelectedDateRange(dates);
    if (dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startDate.toDate() && orderDate <= endDate.toDate();
      });
      const enrichedOrders = enrichOrdersData(filtered);
      setFilteredOrders(enrichedOrders);
    } else {
      const enrichedOrders = enrichOrdersData(orders);
      setFilteredOrders(enrichedOrders);
    }
  };

  const onExportFilteredOrders = () => {
    const enrichedOrders = enrichOrdersData(filteredOrders);
    console.log("Enriched Orders for Export:", enrichedOrders); // Kiểm tra dữ liệu đã enrich
    if (!enrichedOrders || enrichedOrders.length === 0) {
      message.error("No orders available to download.");
      return;
    }
    handleDownloadExcelForDateRange(enrichedOrders);
  };

  // Open Order Details Modal
  const openDetailModal = async (orderID) => {
    setLoading(true);
    try {
      const orderResponse = await fetchOrderDetail(orderID);
      const orderDetails = orderResponse.data.orderDetails || [];

      const bookPromises = orderDetails.map((item) =>
        fetchBookDetail(item.bookID)
      );
      const bookResponses = await Promise.all(bookPromises);

      const enrichedOrderDetails = orderDetails.map((detail, index) => ({
        ...detail,
        book: bookResponses[index]?.data || {},
      }));

      setOrderDetails(enrichedOrderDetails);
      setSelectedOrder({
        ...orderResponse.data,
        totalBooksPrice: enrichedOrderDetails.reduce(
          (acc, item) =>
            acc + (item.quantity || 0) * (item.book?.bookPrice || 0),
          0
        ),
        totalPrice:
          enrichedOrderDetails.reduce(
            (acc, item) =>
              acc + (item.quantity || 0) * (item.book?.bookPrice || 0),
            0
          ) - (orderResponse.data.discount || 0),
      });

      setIsDetailModalVisible(true);
    } catch (error) {
      message.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  // Import Columns
  const importColumns = useMemo(
    () => [
      { title: "Stock ID", dataIndex: "isid", key: "isid" },
      {
        title: "Supplier",
        dataIndex: "supID",
        key: "supID",
        render: (supID) => suppliers[supID?.supID]?.supName || "N/A",
      },
      {
        title: "Staff",
        dataIndex: "staffID",
        key: "staffID",
        render: (staffID) => {
          if (staffID && typeof staffID === "object" && staffID.username) {
            const { firstName, lastName } = staffID.username;
            return `${firstName || ""} ${lastName || ""}`.trim() || "N/A";
          } else if (typeof staffID === "number") {
            const staffData = staffs[staffID];
            if (staffData?.username) {
              const { firstName, lastName } = staffData.username;
              return `${firstName || ""} ${lastName || ""}`.trim() || "N/A";
            }
          }
          return "N/A";
        },
      },
      { title: "Import Date", dataIndex: "importDate", key: "importDate" },
      {
        title: "Total Price",
        dataIndex: "totalPrice",
        key: "totalPrice",
        render: (price) =>
          `${new Intl.NumberFormat("en-US").format(price)} VND`,
      },
      {
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Button
            type="link"
            onClick={() =>
              navigate(`/dashboard/inventory/stock/${record.isid}`)
            }
          >
            <InfoCircleOutlined title="Detail" />
          </Button>
        ),
      },
    ],
    [suppliers, staffs]
  );

  // Export Columns
  const exportColumns = [
    { title: "Order ID", dataIndex: "orderID", key: "orderID" },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
    { title: "Order Date", dataIndex: "orderDate", key: "orderDate" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => openDetailModal(record.orderID)}>
          <InfoCircleOutlined title="Detail" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="main-container">
      <DashboardContainer />
      <div className="dashboard-content">
        <h1>Inventory Management</h1>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Import" key="import">
            <Button
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={() => navigate("/dashboard/inventory/addstock")}
            >
              Import Stock
            </Button>
            <Search
              placeholder="Search by ISID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300, marginLeft: 16 }}
            />
            <Table
              columns={importColumns}
              dataSource={importStocks.filter((stock) =>
                stock.isid.toString().includes(searchTerm)
              )}
              rowKey="isid"
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Export" key="export">
            <RangePicker
              onChange={handleDateRangeChange}
              style={{ marginBottom: "16px" }}
            />
            <Button type="primary" onClick={onExportFilteredOrders}>
              Export Orders to Excel
            </Button>
            <Table
              columns={exportColumns}
              dataSource={enrichOrdersData(filteredOrders)} // Dữ liệu đã enrich
              rowKey="orderID"
            />
          </Tabs.TabPane>
        </Tabs>
      </div>

      <Modal
        title="Order Details"
        visible={isDetailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button
            key="download"
            type="primary"
            onClick={() => handleDownloadExcel(orderDetails, selectedOrder)}
          >
            Download Excel
          </Button>,
          <Button key="close" onClick={closeDetailModal}>
            Close
          </Button>,
        ]}
      >
        <Table
          columns={[
            { title: "Book ID", dataIndex: ["book", "bookID"], key: "bookID" },
            {
              title: "Title",
              dataIndex: ["book", "bookTitle"],
              key: "bookTitle",
            },
            {
              title: "Unit Price",
              dataIndex: ["book", "bookPrice"],
              key: "bookPrice",
            },
            { title: "Quantity", dataIndex: "quantity", key: "quantity" },
            {
              title: "Final Price",
              key: "finalPrice",
              render: (_, record) =>
                `${(
                  (record.book?.bookPrice || 0) * (record.quantity || 0)
                ).toLocaleString()} VND`,
            },
          ]}
          dataSource={orderDetails}
          rowKey={(record) => record.book?.bookID || record.ODID}
          pagination={false}
        />
        <Descriptions title="Summary" bordered>
          <Descriptions.Item label="Total Books Price" span={3}>
            {selectedOrder?.totalBooksPrice?.toLocaleString() || "0"} VND
          </Descriptions.Item>
          <Descriptions.Item label="Discount" span={3}>
            {selectedOrder?.discount?.toLocaleString() || "0"} VND
          </Descriptions.Item>
          <Descriptions.Item label="Total Price" span={3}>
            {selectedOrder?.totalPrice?.toLocaleString() || "0"} VND
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Footer></Footer>
    </div>
  );
}

export default InventoryManagement;
