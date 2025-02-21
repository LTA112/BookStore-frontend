import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Error Page
import ErrorPage from "./ErrorPage/Error404";

// Import dashboard
import Dashboard from "./DashBoard/DashBoard"; // Adjust this path if necessary

// Import book
import AddBook from "./BookManagement/AddBook"; // Assuming this component exists
import BookManagement from "./BookManagement/BookManagement";
import ViewBookDetail from "./BookManagement/ViewBookDetail";
import EditBook from "./BookManagement/EditBook";
import BookDetails from "./Homepage/BookDetails";

// Income Statistic
import IncomeStatistic from "./IncomeStatistic/IncomeStatistic";
// Import promotion
//import PromotionManagement from "./PromotionManagement/PromotionManagement";
// import AddPromotion from "./PromotionManagement/AddPromotion";
// import EditPromotion from "./PromotionManagement/EditPromotion";
// import PromotionDetail from "./PromotionManagement/PromotionDetail";

// Import order
import OrderManagement from "./OrderManagement/OrderManagement";
import OrderDetail from "./OrderManagement/OrderDetail";
import AddOrder from "./OrderManagement/AddOrder";

// Import profile
import ProfileDashboard from "./AccountManagement/Profile";
import ChangePasswordDashboard from "./AccountManagement/ChangePassword";
import Profile from "./Profile/ProfileManagement";
import ChangePassword from "./Profile/ChangPassword";

// Import inventory
import InventoryManagement from "./InventoryManagement/InventoryManagement";
import ViewStockDetail from "./InventoryManagement/ViewStockDetail";
import AddStock from "./InventoryManagement/AddStock";

// Import supplier
import AddSupplier from "./SupplierManagement/AddSupplier";
import SupplierManagement from "./SupplierManagement/SupplierManagement";
import ViewSupplierDetail from "./SupplierManagement/ViewSupplierDetail";
import EditSupplier from "./SupplierManagement/EditSupplier";

// Import account
import AccountDetail from "./AccountManagement/AccountDetail";
import AddAccount from "./AccountManagement/AddAccount";
import EditAccount from "./AccountManagement/EditAccount";
import AccountManagement from "./AccountManagement/AccountManagement";

// Import notification
// import NotificationManagement from "./NotificationManagement/NotificationManagement";
// import AddNotification from "./NotificationManagement/AddNotification";
// import NotificationDetail from "./NotificationManagement/NotificationDetail";
// import Notifications from "./Homepage/Notifications";

// Import category
import CategoryManagement from "./CategoryManagement/CategoryManagement";
import AddCategory from "./CategoryManagement/AddCategory";
import CategoryDetail from "./CategoryManagement/CategoryDetail";
import EditCategory from "./CategoryManagement/EditCategory";

// Import homepage
import Homepage from "./Homepage/Homepage";
import OrderHistory from "./Homepage/OrderHistory";
import OrderPage from "./Homepage/OrderPage";
import PaymentSuccessPage from "./Homepage/PaymentSuccessPage";
// Import login, logout, register
import Login from "./Login/Login/";
import Register from "./Register/Register";
import VerifyAccount from "./Register/verifyAccount";
import SetPassword from "./Register/SetPassword";

// Import cart
import CartDetails from "./Homepage/CartDetails";

// Import staff
import StaffManagement from "./StaffManagement/StaffManagement";
import StaffDetail from "./StaffManagement/StaffDetail";
import EditStaff from "./StaffManagement/EditStaff";
import AddStaff from "./StaffManagement/AddStaff";

// Forgot password
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ForgotPassword/ResetPassword";
import VerifyEmail from "./ForgotPassword/VerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<ErrorPage />} />
        {/* error Page */}
        <Route path="/404" element={<ErrorPage />} />

        {/* Homepage */}
        <Route path="/" element={<Homepage />} />
        <Route path="/OrderHistory" element={<OrderHistory />} />
        <Route path="/OrderPage" element={<OrderPage />} />
        <Route path="/PaymentSuccessPage" element={<PaymentSuccessPage />} />
        {/* Manage books */}
        <Route path="/detail/:bookId" element={<BookDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/books/add/" element={<AddBook />} />
        <Route path="/dashboard/books/edit/:bookId" element={<EditBook />} />
        <Route path="/dashboard/books" element={<BookManagement />} />
        <Route path="/dashboard/books/detail" element={<ViewBookDetail />} />
        <Route path="/dashboard/books/edit" element={<EditBook />} />
        <Route
          path="/dashboard/books/detail/:bookId"
          element={<ViewBookDetail />}
        />
        {/* IncomeStatistic */}
        <Route
          path="/dashboard/income-statistic"
          element={<IncomeStatistic />}
        />

        {/* Manage cart */}
        <Route path="/cart/ViewDetail" element={<CartDetails />} />

        {/* Manage stocks */}
        <Route path="/dashboard/inventory" element={<InventoryManagement />} />
        <Route
          path="/dashboard/inventory/stock/:stockId"
          element={<ViewStockDetail />}
        />
        <Route path="/dashboard/inventory/addstock" element={<AddStock />} />

        {/* Manage promotions */}
        {/* <Route path="/dashboard/detail/:proID" element={<PromotionDetail />} />
        <Route path="/dashboard/promotions" element={<PromotionManagement />} />
        <Route path="/dashboard/add" element={<AddPromotion />} />
        <Route path="/dashboard/edit/:proID" element={<EditPromotion />} /> */}

        {/* Manage orders */}
        <Route path="/dashboard/orders" element={<OrderManagement />} />
        <Route path="/dashboard/orders/detail/:id" element={<OrderDetail />} />
        <Route path="/dashboard/orders/add" element={<AddOrder />}></Route>

        {/* Manage suppliers */}
        <Route path="/dashboard/suppliers" element={<SupplierManagement />} />
        <Route path="/dashboard/suppliers/add" element={<AddSupplier />} />
        <Route
          path="/dashboard/supplier/:supID"
          element={<ViewSupplierDetail />}
        />
        <Route
          path="/dashboard/suppliers/edit/:supID"
          element={<EditSupplier />}
        />

        {/* Manage accounts */}
        <Route path="/dashboard/accounts" element={<AccountManagement />} />
        <Route
          path="/dashboard/accounts/detail/:username"
          element={<AccountDetail />}
        />
        <Route path="/dashboard/accounts/add" element={<AddAccount />} />
        <Route path="/dashboard/accounts/:username" element={<EditAccount />} />

        {/* Manage notifications */}
        {/* <Route
          path="/dashboard/notifications/"
          element={<NotificationManagement />}
        />
        <Route
          path="/dashboard/notifications/detail/:notID"
          element={<NotificationDetail />}
        />
        <Route
          path="/dashboard/notifications/add"
          element={<AddNotification />}
        />
        <Route path="/notifications" element={<Notifications />} /> */}

        {/* Manage categories */}
        <Route path="/dashboard/category" element={<CategoryManagement />} />
        <Route
          path="/dashboard/category/detail/:catID"
          element={<CategoryDetail />}
        />
        <Route path="/dashboard/category/add" element={<AddCategory />} />
        <Route path="/dashboard/category/:catID" element={<EditCategory />} />

        {/* Login, Register, Logout, Forgot password, Reset Password, Verify Email, Verify Account */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset" element={<ResetPassword />} />
        <Route path="/email/verify" element={<VerifyEmail />} />
        <Route path="/account/verify" element={<VerifyAccount />} />
        <Route path="/password/set" element={<SetPassword />} />

        {/* Manage profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard/profile" element={<ProfileDashboard />} />
        <Route
          path="/dashboard/profile/changepassword"
          element={<ChangePasswordDashboard />}
        />
        <Route path="/profile/changepassword" element={<ChangePassword />} />

        {/* Manage staffs */}
        <Route path="/dashboard/staffs" element={<StaffManagement />} />
        <Route
          path="/dashboard/staffs/detail/:staffID"
          element={<StaffDetail />}
        />
        <Route path="/dashboard/staffs/:staffID" element={<EditStaff />} />
        <Route path="/dashboard/staffs/add" element={<AddStaff />} />
      </Routes>
    </Router>
  );
}

export default App;
