import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./CreateProduct.css";

export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const nav = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("You must log in to add a product!");
      nav("/login");
    }
  }, [nav]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;

    if (!token) {
      alert("You must be logged in!");
      return nav("/login");
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      if (image) formData.append("image", image);

      const res = await API.post("/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product created successfully!");
      nav("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error uploading product");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Add Product</h2>
      <form onSubmit={submit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={inputStyle}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{ ...inputStyle, height: 80 }}
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          style={inputStyle}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: "10px" }} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }}
          />
        )}
        <button type="submit" style={buttonStyle}>
          Create Product
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
