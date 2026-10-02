/**
 * AdminOrders.jsx
 *
 * Admin view of all customer orders across the platform.
 */
import React, { useState, useEffect } from "react";
import { fetchAllOrders, updateOrderStatus } from "../../services/orderService";
import "./AdminOrders.css";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  processing: { label: "Processing", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  shipped:    { label: "Shipped",    color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  delivered:  { label: "Delivered",  color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className="ao-status-badge"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}
    >
      {cfg.label}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // id of order being updated

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      if (err.message.includes("FAILED_PRECONDITION")) {
        setError("Firestore Index required. Please check your browser console for the direct link to create the collectionGroup index.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, uid, newStatus) {
    setUpdating(orderId);
    try {
      await updateOrderStatus(uid, orderId, newStatus);
      // Optimistically update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="admin-orders">
      <div className="ao-header">
        <div>
          <h1 className="ao-title">Orders</h1>
          <p className="ao-sub">View and manage all customer orders.</p>
        </div>
        <button className="btn-refresh" onClick={loadOrders} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="ao-error">⚠️ {error}</div>}

      <div className="ao-table-wrap">
        <table className="ao-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="ao-loading">Loading orders…</td></tr>
            ) : orders.length === 0 && !error ? (
              <tr><td colSpan="6" className="ao-empty">No orders found.</td></tr>
            ) : (
              orders.map((o) => {
                const date = o.createdAt?.toDate 
                  ? o.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                  : "—";

                return (
                  <tr key={o.id}>
                    <td className="ao-id"><code>#{o.id.slice(0, 8).toUpperCase()}</code></td>
                    <td className="ao-date">{date}</td>
                    <td>
                      <div className="ao-customer">
                        <span className="ao-c-name">{o.shippingAddress?.fullName || "Unknown"}</span>
                        <span className="ao-c-email">{o.shippingAddress?.city}, {o.shippingAddress?.country}</span>
                      </div>
                    </td>
                    <td className="ao-total">₹{o.total.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-right">
                      <select 
                        className="ao-status-select"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, o.uid, e.target.value)}
                        disabled={updating === o.id}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
