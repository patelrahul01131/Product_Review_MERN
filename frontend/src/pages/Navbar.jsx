import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitial = (email) => (email ? email.charAt(0).toUpperCase() : "?");

  const handleLogout = () => {
    onLogout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
        color: "white",
        padding: "12px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left side: Logo */}
      <div>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          Product Review
        </Link>
      </div>

      {/* Center: Menus */}
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link to="/" style={menuLinkStyle}>Home</Link>
        <Link to="/add-product" style={menuLinkStyle}>Add Product</Link>
        <Link to="/products" style={menuLinkStyle}>Products</Link>
      </div>

      {/* Right side: Auth / Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {user ? (
          <>
            <span style={{ fontSize: "14px", opacity: 0.9 }}>{user.email}</span>

            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                onClick={() => setOpen(!open)}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  color: "#4e54c8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {getInitial(user.email)}
              </div>

              {open && (
                <div
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    backgroundColor: "white",
                    color: "#333",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    width: "180px",
                    zIndex: 10,
                    overflow: "hidden",
                  }}
                >
                  <Link
                    to="/profile"
                    style={{
                      display: "block",
                      padding: "10px 15px",
                      textDecoration: "none",
                      color: "#333",
                    }}
                    onClick={() => setOpen(false)}
                  >
                    👤 View Profile
                  </Link>

                  <hr style={{ margin: "0" }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 15px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#c0392b",
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={navButton}>
              Login
            </Link>
            <Link to="/signup" style={navButton}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Styles
const menuLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "16px",
};

const navButton = {
  backgroundColor: "white",
  color: "#4e54c8",
  padding: "8px 15px",
  borderRadius: "20px",
  textDecoration: "none",
  fontWeight: "500",
  transition: "0.3s",
};

export default Navbar;
