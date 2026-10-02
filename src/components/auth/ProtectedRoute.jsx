/**
 * ProtectedRoute.jsx
 *
 * Wraps a route that requires authentication.
 * Redirects unauthenticated users to /login, preserving
 * the original destination so they return after sign-in.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/checkout" element={<Checkout />} />
 *     <Route path="/profile"  element={<Profile />} />
 *   </Route>
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ redirectTo = "/login" }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Auth state is still resolving — render nothing to prevent flicker
  if (loading) {
    return (
      <div className="centered-spinner" aria-busy="true" aria-label="Loading">
        <span className="spinner" />
      </div>
    );
  }

  // Not authenticated → redirect, preserving the attempted URL
  if (!currentUser) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Authenticated → render child routes
  return <Outlet />;
}
