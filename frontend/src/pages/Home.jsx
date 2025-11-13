// pages/Home.jsx
import React, { useState, useEffect } from "react";
import API from "../api";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>All Products</h2>
      <div style={styles.grid}>
        {products.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            style={styles.card}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                style={styles.image}
              />
            ) : (
              <div style={styles.noImage}>No Image</div>
            )}
            <div style={styles.info}>
              <h3 style={styles.title}>{product.title}</h3>
              {product.price && <p style={styles.price}>${product.price}</p>}
              {product.avgRating !== null && (
                <p style={styles.rating}>⭐ {product.avgRating.toFixed(1)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#4e54c8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fff",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  noImage: {
    width: "100%",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  info: {
    padding: "10px 15px",
  },
  title: {
    fontSize: "18px",
    margin: "0 0 5px",
  },
  price: {
    fontSize: "16px",
    color: "#4e54c8",
    margin: "0 0 5px",
  },
  rating: {
    fontSize: "14px",
    color: "#f39c12",
    margin: 0,
  },
};
