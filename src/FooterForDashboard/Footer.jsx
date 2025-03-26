const Footer = () => {
  return (
    <div
      className="copyright"
      style={{
        textAlign: "center",
        color: "#fff",
        backgroundColor: "#343a40",
        padding: "10px 0",
        bottom: 0,
        position: "",
        width: "100vw",
      }}
    >
      <div>© {new Date().getFullYear()} Bookstore Management System</div>
      <div>All Rights Reserved</div>
    </div>
  );
};
export default Footer;
