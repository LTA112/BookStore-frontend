const Footer = () => {
  return (
    <div
      className="copyright"
      style={{
<<<<<<< HEAD
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
=======
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
>>>>>>> c4db0e6 (Commit frontend)
      <div>All Rights Reserved</div>
    </div>
  );
};
export default Footer;
