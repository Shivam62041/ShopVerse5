/**
 * AdminLayout.jsx
 *
 * Layout wrapper for all admin pages, providing a sidebar.
 */
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
          >
            <span className="al-icon">🏷️</span> Products
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => isActive ? "admin-link active" : "admin-link"}
          >
            <span className="al-icon">📦</span> Orders
          </NavLink>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
