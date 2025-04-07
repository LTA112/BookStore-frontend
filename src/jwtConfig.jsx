export const decodeJWT = () => {
  try {
    let token = sessionStorage.getItem("jwtToken");
    if (token == null) {
      window.location.href = "/auth/login";
      return;
    }
    const base64Url = token.split(".")[1]; // Lấy phần payload
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Chuyển từ base64url sang base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload); // Trả về payload dưới dạng JSON
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const checkAdminRole = () => {
  let scope = decodeJWT().scope;
  return scope.includes("ADMIN") ? true : false;
};

export const checkSellerStaffRole = () => {
  let scope = decodeJWT().scope;
  return scope.includes("SELLER_STAFF") ? true : false;
};

export const checkWarehouseStaffRole = () => {
  let scope = decodeJWT().scope;
  console.log(scope.includes("WAREHOUSE_STAFF") ? true : false);
  return scope.includes("WAREHOUSE_STAFF") ? true : false;
};

export const checkCustomerRole = () => {
  let scope = decodeJWT().scope;
  return scope.includes("CUSTOMER") ? true : false;
};

export const checkStatusAccount = () => {
  return decodeJWT().status;
};
