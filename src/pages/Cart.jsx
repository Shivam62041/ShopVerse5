/**
 * Cart.jsx — Shopping cart page with quantity controls and order summary.
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  updateQuantity,
  removeFromCart,
} from "../store/slices/cartSlice";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

function CartItemRow({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="cart-item">
      <img src={item.imageUrl} alt={item.name} className="ci-image" loading="lazy" />

      <div className="ci-info">
        <p className="ci-category">{item.category}</p>
        <p className="ci-name">{item.name}</p>
        <p className="ci-unit-price">₹{item.price.toFixed(2)} each</p>
      </div>

      <div className="ci-controls">
        <div className="qty-wrap">
          <button
            className="qty-btn"
            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
            aria-label="Decrease quantity"
          >−</button>
          <span className="qty-num">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
            aria-label="Increase quantity"
          >+</button>
        </div>
        <p className="ci-subtotal">₹{(item.price * item.quantity).toFixed(2)}</p>
        <button
          className="ci-remove"
          onClick={() => dispatch(removeFromCart(item.id))}
          aria-label={`Remove ${item.name}`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const items     = useSelector(selectCartItems);
  const total     = useSelector(selectCartTotal);
  const count     = useSelector(selectCartItemCount);
  const { currentUser } = useAuth();
  const navigate  = useNavigate();

  const shipping  = total >= 50 ? 0 : 5.99;
  const tax       = total * 0.08;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h1 className="empty-heading">Your cart is empty</h1>
        <p className="empty-desc">Browse our products and add something you love.</p>
        <Link to="/products" className="btn-shop">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-col">
          <h1 className="cart-title">Shopping Cart <span className="cart-count-badge">{count}</span></h1>
          <div className="cart-items-list">
            {items.map((item) => <CartItemRow key={item.id} item={item} />)}
          </div>
          <Link to="/products" className="continue-link">← Continue Shopping</Link>
        </div>

        {/* Summary */}
        <aside className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({count} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? "free-tag" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="free-hint">Add ₹{(50 - total).toFixed(2)} more for free shipping</p>
            )}
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {currentUser ? (
            <button className="btn-checkout" onClick={() => navigate("/checkout")}>
              Proceed to Checkout →
            </button>
          ) : (
            <>
              <button
                className="btn-checkout"
                onClick={() => navigate("/login", { state: { from: { pathname: "/checkout" } } })}
              >
                Sign In to Checkout →
              </button>
              <p className="signin-hint">You'll be returned here after signing in.</p>
            </>
          )}

          <div className="trust-badges">
            {["🔒 Secure Checkout", "↩️ Free Returns", "🚚 Fast Delivery"].map((b) => (
              <span key={b} className="trust-badge">{b}</span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
