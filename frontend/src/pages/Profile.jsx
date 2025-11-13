import React, { useEffect, useState } from "react";

const Profile = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Try from props first, fallback to localStorage
    if (user) {
      setCurrentUser(user);
    } else {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, [user]);

  if (!currentUser) {
    return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Please login first.</h3>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2 style={{ color: "#4e54c8" }}>👤 User Profile</h2>
      <div
        style={{
          background: "#f7f7f7",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          marginTop: "20px",
        }}
      >
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>User ID:</strong> {currentUser.id}</p>
      </div>
    </div>
  );
};

export default Profile;
