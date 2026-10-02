/**
 * Checkout.jsx — Multi-step checkout: Address → Review → Confirmation
 * 🔒 Protected route — only accessible when authenticated.
 */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from "../store/slices/cartSlice";
import { placeOrder } from "../services/orderService";
import PaymentProcessor from "../components/payment/PaymentProcessor";
import "./Checkout.css";

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepBar({ current }) {
  const steps = ["Shipping", "Review", "Payment", "Confirmation"];
  return (
    <div className="step-bar">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done    = current > idx;
        const active  = current === idx;
        return (
          <React.Fragment key={label}>
            <div className={`step-node ${active ? "active" : ""} ${done ? "done" : ""}`}>
              <div className="step-circle">
                {done ? "✓" : idx}
              </div>
              <span className="step-label">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-line ${done ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Shipping Address ─────────────────────────────────────────────────

const INITIAL_ADDR = {
  fullName: "", line1: "", line2: "", city: "", state: "", zip: "", country: "India",
};

function ShippingStep({ address, setAddress, onNext }) {
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!address.fullName.trim()) e.fullName = "Full name is required";
    if (!address.line1.trim())    e.line1    = "Address is required";
    if (!address.city.trim())     e.city     = "City is required";
    if (!address.state.trim())    e.state    = "State is required";
    if (!address.zip.trim())      e.zip      = "ZIP code is required";
    else if (!/^\d{4,10}$/.test(address.zip.trim())) e.zip = "Enter a valid ZIP code";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onNext();
  }

  function field(name, label, placeholder, opts = {}) {
    return (
      <div className={`co-field ${opts.half ? "half" : ""}`}>
        <label htmlFor={`co-${name}`}>{label}</label>
        <input
          id={`co-${name}`}
          value={address[name]}
          onChange={(e) => { setAddress(a => ({ ...a, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: "" })); }}
          placeholder={placeholder}
          {...opts.inputProps}
        />
        {errors[name] && <span className="field-error">{errors[name]}</span>}
      </div>
    );
  }

  return (
    <form className="co-form" onSubmit={handleSubmit} noValidate>
      <h2 className="co-section-title">Shipping Address</h2>
      {field("fullName", "Full Name", "Jane Doe")}
      {field("line1", "Address Line 1", "123 Main Street")}
      {field("line2", "Address Line 2 (optional)", "Apt 4B")}
      <div className="co-row">
        {field("city",  "City",  "Mumbai",  { half: true })}
        {field("state", "State", "Maharashtra", { half: true })}
      </div>
      <div className="co-row">
        {field("zip", "ZIP Code", "400001", { half: true })}
        <div className="co-field half">
          <label htmlFor="co-country">Country</label>
          <select
            id="co-country"
            value={address.country}
            onChange={(e) => setAddress(a => ({ ...a, country: e.target.value }))}
          >
            {["India","United States","United Kingdom","Canada","Australia","Germany","Singapore"].map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </select>
        </div>
      </div>
      <button type="submit" className="co-btn-primary">Continue to Review →</button>
    </form>
  );
}

// ─── Step 2: Review Order ─────────────────────────────────────────────────────

function ReviewStep({ address, items, total, onBack, onContinue, placing }) {
  const shipping   = total >= 50 ? 0 : 5.99;
  const tax        = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="review-step">
      <h2 className="co-section-title">Review Your Order</h2>

      {/* Items */}
      <div className="review-items">
        {items.map(item => (
          <div key={item.id} className="review-item">
            <img src={item.imageUrl} alt={item.name} className="ri-img" />
            <div className="ri-info">
              <p className="ri-name">{item.name}</p>
              <p className="ri-qty">Qty: {item.quantity}</p>
            </div>
            <p className="ri-price">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="review-address">
        <p className="review-section-label">Delivering to</p>
        <p className="addr-name">{address.fullName}</p>
        <p className="addr-line">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
        <p className="addr-line">{address.city}, {address.state} – {address.zip}</p>
        <p className="addr-line">{address.country}</p>
      </div>

      {/* Totals */}
      <div className="review-totals">
        {[
          ["Subtotal", `₹${total.toFixed(2)}`],
          ["Shipping", shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`],
          ["Tax (8%)", `₹${tax.toFixed(2)}`],
        ].map(([k, v]) => (
          <div key={k} className="rt-row">
            <span>{k}</span>
            <span className={v === "FREE" ? "free-tag" : ""}>{v}</span>
          </div>
        ))}
        <div className="rt-row grand">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="review-actions">
        <button className="co-btn-ghost" onClick={onBack} disabled={placing}>← Edit Address</button>
        <button className="co-btn-primary" onClick={() => onContinue(grandTotal)} disabled={placing}>
          {placing ? "Processing…" : "Continue to Payment →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────

function ConfirmationStep({ orderId }) {
  return (
    <div className="confirm-step">
      <div className="confirm-icon">🎉</div>
      <h2 className="confirm-heading">Order Placed!</h2>
      <p className="confirm-sub">Thank you for your purchase. We'll send a confirmation shortly.</p>
      <div className="confirm-id">
        Order ID: <code>{orderId}</code>
      </div>
      <div className="confirm-actions">
        <Link to="/orders"   className="co-btn-primary-link">View Orders</Link>
        <Link to="/products" className="co-btn-ghost-link">Continue Shopping</Link>
      </div>
    </div>
  );
}

// ─── Root Component ────────────────────────────────────────────────────────────

export default function Checkout() {
  const items   = useSelector(selectCartItems);
  const total   = useSelector(selectCartTotal);
  const count   = useSelector(selectCartItemCount);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [step, setStep]       = useState(1);
  const [address, setAddress] = useState(INITIAL_ADDR);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);
  const [error, setError]     = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Empty cart guard
  if (count === 0 && step < 3) {
    return (
      <div className="checkout-page">
        <div className="co-empty">
          <p>🛒 Your cart is empty.</p>
          <Link to="/products" className="co-btn-primary-link">Browse Products</Link>
        </div>
      </div>
    );
  }

  async function handleContinueToPayment(grandTotal) {
    setError(null);
    setPlacing(true);
    try {
      // Create order with status "pending-payment" before payment step
      const id = await placeOrder(items, grandTotal, address, dispatch);
      setOrderId(id);
      setGrandTotal(grandTotal);
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to create order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  async function handlePaymentSuccess() {
    setError(null);
    setPaymentProcessing(true);
    try {
      // Order already created before payment; just move to confirmation
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to process order. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <StepBar current={step} />

        {error && <div className="co-error">{error}</div>}

        {step === 1 && (
          <ShippingStep
            address={address}
            setAddress={setAddress}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ReviewStep
            address={address}
            items={items}
            total={total}
            onBack={() => setStep(1)}
            onContinue={handleContinueToPayment}
            placing={placing}
          />
        )}
        {step === 3 && (
          <div className="payment-step">
            <h2 className="co-section-title">Payment</h2>
            {orderId && (
              <PaymentProcessor
                amount={grandTotal}
                orderId={orderId}
                onSuccess={handlePaymentSuccess}
                onError={(err) => setError(err.message || "Payment failed. Please try again.")}
              />
            )}
            <div className="review-actions">
              <button className="co-btn-ghost" onClick={() => setStep(2)} disabled={paymentProcessing}>
                ← Back to Review
              </button>
            </div>
          </div>
        )}
        {step === 4 && <ConfirmationStep orderId={orderId} />}
      </div>
    </div>
  );
}
