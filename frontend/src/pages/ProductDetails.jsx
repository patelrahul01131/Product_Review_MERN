import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch product and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
        setReviews(res.data.reviews);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  // Open popup with review data
const handleOpenEdit = (review) => {
  setEditReview(review);
  setEditRating(review.rating);
  setEditComment(review.comment);
};

const handleDeleteReview = async (reviewId) => {
  if (!window.confirm("Are you sure you want to delete this review?")) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Access denied, no token provided");

    await API.delete(`/products/${product.id}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setReviews(reviews.filter(r => r.id !== reviewId));
    alert("Review deleted successfully");
  } catch (err) {
    console.error("Delete review error:", err);
    alert(err.response?.data?.message || "Error deleting review");
  }
};

// Submit edited review
const handleSubmitEdit = async () => {
  try {
    await API.put(`/products/${product.id}/reviews/${editReview.id}`, {
      user_id: user.id,
      rating: editRating,
      comment: editComment,
    });
    alert('Review updated!');
    setEditReview(null);
    fetchProduct(); // refetch product details
  } catch (err) {
    // alert(err.response?.data?.message || 'Error');
  }
};


  // Submit rating
  const submitRating = async () => {
    if (!user) return alert("You must be logged in to rate.");
    if (!userRating) return alert("Select a rating.");
    try {
      const res = await API.post(`/products/${id}/reviews`, {
        user_id: user.id,
        rating: userRating,
        comment
      });
      setReviews([res.data, ...reviews]);
      setUserRating(0);
      setComment("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: "0 20px" }}>
      <h2>{product.title}</h2>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: "8px" }}
        />
      )}
      <p>{product.description}</p>
      <p><b>Price:</b> ${product.price}</p>
      <p><b>Average Rating:</b> {product.avgRating ? product.avgRating.toFixed(1) : "No ratings"}</p>

      {/* User rating */}
      {user ? (
        <div style={{ marginTop: "20px" }}>
          <h3>Give your rating:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: "25px",
                  cursor: "pointer",
                  color: star <= (hoverRating || userRating) ? "gold" : "#ccc",
                  transition: "color 0.2s"
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Leave a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", marginTop: 10, padding: 8, borderRadius: 6 }}
          />
          <button
            onClick={submitRating}
            style={{
              marginTop: 10,
              padding: "8px 15px",
              backgroundColor: "#4e54c8",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Submit
          </button>
        </div>
      ) : (
        <p style={{ color: "red" }}>Login to rate this product</p>
      )}

      {/* Reviews list */}
      <div style={{ marginTop: "30px" }}>
        <h3>Reviews:</h3>
        {reviews.map(r => (
          <div key={r.id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
            <div>
              <strong>{'Anonymous'}</strong> rated {r.rating} ⭐
            </div>
            <p>{r.comment}</p>

            {user?.id === r.user_id && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleOpenEdit(r)}>Edit</button>
                <button onClick={() => handleDeleteReview(r.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

{editReview && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 100
  }}>
    <div style={{
      background: 'white', padding: '20px', borderRadius: '8px',
      width: '400px', maxWidth: '90%'
    }}>
      <h3>Edit Review</h3>
      <div>
        <label>Rating: </label>
        <input
          type="number"
          value={editRating}
          min={1}
          max={5}
          onChange={e => setEditRating(e.target.value)}
        />
      </div>
      <div>
        <label>Comment: </label>
        <textarea
          value={editComment}
          onChange={e => setEditComment(e.target.value)}
          rows={4}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={() => setEditReview(null)}>Cancel</button>
        <button onClick={handleSubmitEdit}>Save</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}


