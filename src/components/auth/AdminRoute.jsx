/**
 * AdminRoute.jsx
 *
 * Route guard that requires the user to be authenticated AND have the "admin" role.
 */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="centered-spinner" aria-busy="true">
        <span className="spinner" />
      </div>
    );
  }

  // If not logged in, go to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but not admin, redirect to homepage.
  if (userRole !== "admin") {
    // Alternatively, you could render a 403 Not Authorized page here.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
