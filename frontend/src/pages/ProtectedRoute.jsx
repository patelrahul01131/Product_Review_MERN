import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // if not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
