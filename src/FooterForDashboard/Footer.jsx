const Footer = () => {
  return (
    <div
      className="copyright"
      style={{
        width: "100vw",
        position: "static",
        bottom: "-4%",
        left: "0",
        padding: "0.5% 0",
        zIndex: "0",
      }}
    >
      <div>© Copyright {new Date().getFullYear()}</div>
      <div>Bookstore Management System</div>
      <div>All Rights Reserved</div>
    </div>
  );
};
export default Footer;
