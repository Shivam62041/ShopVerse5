/**
 * Orders.jsx — Order history fetched from Firestore /users/{uid}/orders
 * 🔒 Protected route.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../services/orderService";
import "./Orders.css";

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
      className="status-badge"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}
    >
      {cfg.label}
    </span>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const date = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="order-card">
      {/* Header row */}
      <div className="order-header">
        <div className="order-meta">
          <p className="order-id">
            <span className="order-id-label">Order</span>
            <code>#{order.id.slice(0, 8).toUpperCase()}</code>
          </p>
          <p className="order-date">{date}</p>
        </div>
        <div className="order-header-right">
          <StatusBadge status={order.status} />
          <p className="order-total">₹{order.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Item preview (first 2 images) */}
      <div className="order-previews">
        {order.items.slice(0, 4).map((item, i) => (
          <img key={i} src={item.imageUrl} alt={item.name} className="preview-img" />
        ))}
        {order.items.length > 4 && (
          <div className="preview-more">+{order.items.length - 4}</div>
        )}
        <span className="order-item-count">
          {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Expand/collapse */}
      <button className="order-toggle" onClick={() => setExpanded(e => !e)}>
        {expanded ? "Hide details ▲" : "View details ▼"}
      </button>

      {expanded && (
        <div className="order-details">
          <div className="detail-items">
            {order.items.map((item, i) => (
              <div key={i} className="detail-item">
                <img src={item.imageUrl} alt={item.name} className="di-img" />
                <div className="di-info">
                  <p className="di-name">{item.name}</p>
                  <p className="di-qty">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                </div>
                <p className="di-subtotal">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {order.shippingAddress && (
            <div className="detail-address">
              <p className="detail-label">Shipped to</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonOrder() {
  return (
    <div className="skeleton-order shimmer">
      <div className="skel-line wide" />
      <div className="skel-line medium" />
      <div className="skel-line short" />
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">Order History</h1>
        <Link to="/products" className="btn-shop-more">+ Shop More</Link>
      </div>

      {error && <div className="orders-error">⚠️ {error}</div>}

      {loading ? (
        <div className="orders-list">
          {[1,2,3].map(i => <SkeletonOrder key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h2 className="empty-heading">No orders yet</h2>
          <p className="empty-desc">When you place an order, it will appear here.</p>
          <Link to="/products" className="co-btn-primary-link" style={{ marginTop: "1rem" }}>Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}
