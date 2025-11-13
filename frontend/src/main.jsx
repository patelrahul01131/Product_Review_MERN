import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Navbar from "./pages/Navbar";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./pages/main.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile user={user} />} />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute user={user}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

createRoot(document.getElementById("root")).render(<App />);
